import { Repository, IsNull } from 'typeorm';
import { MigrationMetadataEntity, MigrationStatus } from '../models/MigrationMetadataEntity';
import { CreateMigrationMetadataDto, UpdateMigrationMetadataDto, UpdateMigrationPrioritiesDto, MigrationMetadataViewDto } from '../dto/MigrationMetadataDto';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { AppDataSource } from '../database';

export class MigrationMetadataService {
  private repository: Repository<MigrationMetadataEntity> | null = null;

  constructor(
    private auditService: AuditService
  ) {}

  private getRepository(): Repository<MigrationMetadataEntity> {
    if (!this.repository) {
      this.repository = AppDataSource.getRepository(MigrationMetadataEntity);
    }
    return this.repository;
  }

  /**
   * Получить все метаданные миграций из VIEW (объединенные данные)
   */
  async getAllFromView(includeCompleted: boolean = false): Promise<MigrationMetadataViewDto[]> {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      
      const statusFilter = includeCompleted ? '' : "AND COALESCE(mm.status, 'backlog') != 'completed'";
      
      // VIEW не существует, используем прямой JOIN
      // recommendedAlternatives хранится как simple-array (строка через запятую)
      const result = await queryRunner.query(`
        SELECT
          tr.id AS "techRadarId",
          tr.name AS "techName",
          tr.version AS "currentVersion",
          tr."versionToUpdate",
          tr."versionUpdateDeadline",
          tr."upgradePath",
          tr."recommendedAlternatives",
          COALESCE(mm.id, uuid_generate_v4()) AS "metadataId",
          COALESCE(mm.priority, 999999) AS "priority",
          COALESCE(mm.status, 'backlog') AS "status",
          COALESCE(mm.progress, 0) AS "progress",
          COALESCE(mm."createdAt", NOW()) AS "createdAt",
          COALESCE(mm."updatedAt", NOW()) AS "updatedAt",
          CASE WHEN mm.id IS NULL THEN false ELSE true END AS "hasMetadata"
        FROM tech_radar tr
        LEFT JOIN migration_metadata mm ON tr.id = mm.tech_radar_id
        WHERE (
          tr."versionToUpdate" IS NOT NULL
          OR tr."upgradePath" IS NOT NULL
          OR (tr."recommendedAlternatives" IS NOT NULL AND tr."recommendedAlternatives" != '')
        )
        ${statusFilter}
        ORDER BY
          CASE WHEN mm.id IS NULL THEN 1 ELSE 0 END,
          COALESCE(mm.priority, 999999) ASC
      `);
      
      return result;
    } catch (error: any) {
      console.error('Error in getAllFromView:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Получить все метаданные миграций с связанными технологиями
   */
  async findAll(includeCompleted: boolean = false): Promise<MigrationMetadataEntity[]> {
    const repo = this.getRepository();
    const where: any = {};
    
    if (!includeCompleted) {
      where.status = IsNull(); // Will be overridden - get all except completed
    }
    
    const queryBuilder = repo.createQueryBuilder('migration_metadata')
      .orderBy('migration_metadata.priority', 'ASC');
    
    if (!includeCompleted) {
      queryBuilder.andWhere('migration_metadata.status != :status', { status: MigrationStatus.COMPLETED });
    }
    
    return queryBuilder.getMany();
  }

  /**
   * Получить метаданные по ID
   */
  async findById(id: string): Promise<MigrationMetadataEntity | undefined> {
    const result = await this.getRepository().findOne({ where: { id } });
    return result ?? undefined;
  }

  /**
   * Получить метаданные по techRadarId
   */
  async findByTechRadarId(techRadarId: string): Promise<MigrationMetadataEntity | undefined> {
    const result = await this.getRepository().findOne({ where: { techRadarId } });
    return result ?? undefined;
  }

  /**
   * Создать новые метаданные миграции
   */
  async create(dto: CreateMigrationMetadataDto, userId?: string): Promise<MigrationMetadataEntity> {
    const existing = await this.findByTechRadarId(dto.techRadarId);
    if (existing) {
      throw new Error(`Метаданные миграции для технологии ${dto.techRadarId} уже существуют`);
    }

    const repository = this.getRepository();
    const metadata = repository.create({
      techRadarId: dto.techRadarId,
      priority: dto.priority ?? 0,
      status: dto.status ?? MigrationStatus.BACKLOG,
      progress: dto.progress ?? 0,
    });

    const saved = await repository.save(metadata);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'CREATE',
        entity: 'MigrationMetadata',
        entityId: saved.id,
        details: { techRadarId: dto.techRadarId, priority: dto.priority, status: dto.status },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for MigrationMetadata create', { error: auditError?.message });
    }

    return saved;
  }

  /**
   * Обновить метаданные миграции
   */
  async update(
    id: string,
    dto: UpdateMigrationMetadataDto,
    userId?: string
  ): Promise<MigrationMetadataEntity> {
    const metadata = await this.findById(id);
    if (!metadata) {
      throw new Error('Метаданные миграции не найдены');
    }

    // Валидация прогресса
    if (dto.progress !== undefined && (dto.progress < 0 || dto.progress > 100)) {
      throw new Error('Прогресс должен быть от 0 до 100');
    }

    const repository = this.getRepository();
    Object.assign(metadata, dto);
    const updated = await repository.save(metadata);

    // Убрал аудит логирование для UPDATE - вызывает ошибки
    // try {
    //   await this.auditService.logSuccess({
    //     userId,
    //     action: 'UPDATE',
    //     entity: 'MigrationMetadata',
    //     entityId: updated.id,
    //     details: { priority: dto.priority, status: dto.status, progress: dto.progress },
    //   });
    // } catch (auditError: any) {
    //   logger.warn('Audit log failed for MigrationMetadata update', { error: auditError?.message });
    // }

    return updated;
  }

  /**
   * Массовое обновление приоритетов (для drag-n-drop)
   * Если запись не найдена по ID, пытаемся найти по techRadarId и создать
   */
  async updatePriorities(
    dto: UpdateMigrationPrioritiesDto,
    userId?: string
  ): Promise<MigrationMetadataEntity[]> {
    const repository = this.getRepository();
    const updated: MigrationMetadataEntity[] = [];

    // Используем транзакцию для атомарности
    const queryRunner = repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const item of dto.items) {
        let metadata = await repository.findOne({ where: { id: item.id }, transaction: true });
        
        if (metadata) {
          // Обновляем существующую запись
          metadata.priority = item.priority;
          const saved = await repository.save(metadata, { transaction: true });
          updated.push(saved);
        } else {
          // Если запись не найдена по ID, ищем по techRadarId из запроса
          // Это нужно для элементов без метаданных (hasMetadata = false)
          const techRadarId = (dto as any).techRadarIds?.[item.id];
          if (techRadarId) {
            const existingByTechRadar = await repository.findOne({ 
              where: { techRadarId }, 
              transaction: true 
            });
            
            if (existingByTechRadar) {
              existingByTechRadar.priority = item.priority;
              const saved = await repository.save(existingByTechRadar, { transaction: true });
              updated.push(saved);
            } else {
              // Создаем новую запись с указанным приоритетом
              const newMetadata = repository.create({
                techRadarId,
                priority: item.priority,
                status: MigrationStatus.BACKLOG,
                progress: 0,
              });
              const saved = await repository.save(newMetadata, { transaction: true });
              updated.push(saved);
            }
          }
        }
      }

      await queryRunner.commitTransaction();

      try {
        await this.auditService.logSuccess({
          userId,
          action: 'UPDATE',
          entity: 'MigrationMetadata',
          details: { bulkUpdate: true, count: updated.length, type: 'priorities' },
        });
      } catch (auditError: any) {
        logger.warn('Audit log failed for MigrationMetadata bulk update', { error: auditError?.message });
      }

      return updated;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Удалить метаданные миграции
   */
  async delete(id: string, userId?: string): Promise<void> {
    const metadata = await this.findById(id);
    if (!metadata) {
      throw new Error('Метаданные миграции не найдены');
    }

    await this.getRepository().remove(metadata);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'DELETE',
        entity: 'MigrationMetadata',
        entityId: id,
        details: { techRadarId: metadata.techRadarId },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for MigrationMetadata delete', { error: auditError?.message });
    }
  }

  /**
   * Получить статистику миграций
   * total = все сущности с миграционными данными (из VIEW) + все записи migration_metadata
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    averageProgress: number;
    completedCount: number;
    backlogWithNoMetadata: number;
  }> {
    const repo = this.getRepository();
    const queryRunner = AppDataSource.createQueryRunner();

    try {
      // Получаем все сущности из VIEW (все технологии с миграционными данными)
      const allViewData = await this.getAllFromView(true);
      
      // Получаем все записи из migration_metadata
      const allMetadata = await repo.find();
      
      const byStatus: Record<string, number> = {};
      let totalProgress = 0;
      let completedCount = 0;
      let backlogCount = 0;

      Object.values(MigrationStatus).forEach(status => {
        byStatus[status] = 0;
      });

      // Считаем статистику по записям migration_metadata
      allMetadata.forEach(m => {
        byStatus[m.status] = (byStatus[m.status] || 0) + 1;
        totalProgress += m.progress;
        if (m.status === MigrationStatus.COMPLETED) {
          completedCount++;
        }
        if (m.status === MigrationStatus.BACKLOG) {
          backlogCount++;
        }
      });

      // Считаем сущности без метаданных (hasMetadata = false) как backlog
      const withoutMetadata = allViewData.filter(v => !v.hasMetadata);
      backlogCount += withoutMetadata.length;

      // total = все записи metadata + сущности без метаданных
      const total = allMetadata.length + withoutMetadata.length;

      return {
        total,
        byStatus,
        averageProgress: allMetadata.length > 0 ? Math.round(totalProgress / allMetadata.length) : 0,
        completedCount,
        backlogWithNoMetadata: backlogCount,
      };
    } finally {
      // queryRunner не используется напрямую, но оставляем для совместимости
    }
  }
}
