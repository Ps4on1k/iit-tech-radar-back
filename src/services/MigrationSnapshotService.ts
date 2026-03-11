import { Repository } from 'typeorm';
import { MigrationSnapshotEntity } from '../models/MigrationSnapshotEntity';
import { CreateMigrationSnapshotDto, MigrationSnapshotDto } from '../dto/MigrationSnapshotDto';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { AppDataSource } from '../database';

export class MigrationSnapshotService {
  private repository: Repository<MigrationSnapshotEntity> | null = null;

  constructor(
    private auditService: AuditService
  ) {}

  private getRepository(): Repository<MigrationSnapshotEntity> {
    if (!this.repository) {
      this.repository = AppDataSource.getRepository(MigrationSnapshotEntity);
    }
    return this.repository;
  }

  /**
   * Получить все снапшоты завершенных миграций
   */
  async getAll(): Promise<MigrationSnapshotDto[]> {
    const repo = this.getRepository();
    const snapshots = await repo.find({
      order: { completedAt: 'DESC' },
    });

    return snapshots.map(s => ({
      id: s.id,
      techRadarId: s.techRadarId,
      techName: s.techName,
      versionBefore: s.versionBefore,
      versionAfter: s.versionAfter,
      deadline: s.deadline,
      upgradePath: s.upgradePath,
      recommendedAlternatives: s.recommendedAlternatives,
      priority: s.priority,
      progress: s.progress,
      completedAt: s.completedAt,
      completedBy: s.completedBy,
    }));
  }

  /**
   * Получить снапшот по ID
   */
  async findById(id: string): Promise<MigrationSnapshotDto | undefined> {
    const result = await this.getRepository().findOne({ where: { id } });
    if (!result) return undefined;

    return {
      id: result.id,
      techRadarId: result.techRadarId,
      techName: result.techName,
      versionBefore: result.versionBefore,
      versionAfter: result.versionAfter,
      deadline: result.deadline,
      upgradePath: result.upgradePath,
      recommendedAlternatives: result.recommendedAlternatives,
      priority: result.priority,
      progress: result.progress,
      completedAt: result.completedAt,
      completedBy: result.completedBy,
    };
  }

  /**
   * Получить снапшоты по techRadarId
   */
  async findByTechRadarId(techRadarId: string): Promise<MigrationSnapshotDto[]> {
    const snapshots = await this.getRepository().find({
      where: { techRadarId },
      order: { completedAt: 'DESC' },
    });

    return snapshots.map(s => ({
      id: s.id,
      techRadarId: s.techRadarId,
      techName: s.techName,
      versionBefore: s.versionBefore,
      versionAfter: s.versionAfter,
      deadline: s.deadline,
      upgradePath: s.upgradePath,
      recommendedAlternatives: s.recommendedAlternatives,
      priority: s.priority,
      progress: s.progress,
      completedAt: s.completedAt,
      completedBy: s.completedBy,
    }));
  }

  /**
   * Создать снапшот завершенной миграции
   */
  async create(dto: CreateMigrationSnapshotDto, userId?: string): Promise<MigrationSnapshotEntity> {
    const repository = this.getRepository();
    const snapshot = repository.create({
      techRadarId: dto.techRadarId,
      techName: dto.techName,
      versionBefore: dto.versionBefore,
      versionAfter: dto.versionAfter,
      deadline: dto.deadline,
      upgradePath: dto.upgradePath,
      recommendedAlternatives: dto.recommendedAlternatives,
      priority: dto.priority ?? 0,
      progress: 100,
      completedBy: userId,
    });

    const saved = await repository.save(snapshot);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'CREATE',
        entity: 'MigrationSnapshot',
        entityId: saved.id,
        details: { techRadarId: dto.techRadarId, techName: dto.techName },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for MigrationSnapshot create', { error: auditError?.message });
    }

    return saved;
  }

  /**
   * Удалить снапшот
   */
  async delete(id: string, userId?: string): Promise<void> {
    const snapshot = await this.findById(id);
    if (!snapshot) {
      throw new Error('Снапшот миграции не найден');
    }

    await this.getRepository().delete(id);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'DELETE',
        entity: 'MigrationSnapshot',
        entityId: id,
        details: { techRadarId: snapshot.techRadarId },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for MigrationSnapshot delete', { error: auditError?.message });
    }
  }

  /**
   * Получить статистику снапшотов
   */
  async getStatistics(): Promise<{
    total: number;
    lastMonthCount: number;
    lastYearCount: number;
  }> {
    const repo = this.getRepository();
    const all = await repo.find();

    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    const lastMonthCount = all.filter(s => new Date(s.completedAt) >= lastMonth).length;
    const lastYearCount = all.filter(s => new Date(s.completedAt) >= lastYear).length;

    return {
      total: all.length,
      lastMonthCount,
      lastYearCount,
    };
  }

  /**
   * Удалить все снапшоты (очистка архива)
   */
  async deleteAll(userId?: string): Promise<number> {
    const repo = this.getRepository();
    const all = await repo.find();
    const count = all.length;

    if (count === 0) {
      return 0;
    }

    // Удаляем все снапшоты
    await repo.delete({});

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'DELETE',
        entity: 'MigrationSnapshot',
        details: { bulkDelete: true, count, type: 'all_snapshots' },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for MigrationSnapshot bulk delete', { error: auditError?.message });
    }

    return count;
  }
}
