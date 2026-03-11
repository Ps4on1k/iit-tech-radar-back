import { AppDataSource } from '../database';
import { AuditLogEntity } from '../models/AuditLogEntity';
import { Repository } from 'typeorm';
import { logger } from '../utils/logger';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'IMPORT' | 'EXPORT' | 'PASSWORD_CHANGE';
export type AuditEntity = 'TechRadar' | 'User' | 'Import' | 'Auth' | 'TechRadarReview' | 'TechRadarTag' | 'TechRadarTags' | 'TechRadarAttachment' | 'TechRadarHistory' | 'AIConfig' | 'MigrationMetadata' | 'MigrationSnapshot';
export type AuditStatus = 'SUCCESS' | 'FAILURE';

export interface AuditLogOptions {
  userId?: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  status: AuditStatus;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  entity?: AuditEntity;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedAuditLogs {
  data: AuditLogEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Сервис для логирования критических операций
 */
export class AuditService {
  private repository: Repository<AuditLogEntity> | null = null;

  private getRepository(): Repository<AuditLogEntity> {
    if (!this.repository) {
      this.repository = AppDataSource.getRepository(AuditLogEntity);
    }
    return this.repository;
  }

  /**
   * Логирование операции
   */
  async log(options: AuditLogOptions): Promise<AuditLogEntity | null> {
    try {
      const repository = this.getRepository();
      const auditLog = repository.create({
        userId: options.userId,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId,
        ipAddress: options.ipAddress,
        details: options.details ? JSON.stringify(options.details) : undefined,
        status: options.status,
      });

      const saved = await repository.save(auditLog);

      // Логируем в консоль для development
      logger.info(`AUDIT: ${options.action} ${options.entity} by ${options.userId || 'anonymous'} - ${options.status}`, {
        entityId: options.entityId,
        ipAddress: options.ipAddress,
      });

      return saved;
    } catch (error) {
      // Если не удалось сохранить в БД, логируем в консоль
      logger.error('Failed to save audit log to database', { error, options });

      // Возвращаем null (не сохраняем в БД)
      return null;
    }
  }

  /**
   * Логирование успешной операции
   */
  async logSuccess(options: Omit<AuditLogOptions, 'status'>): Promise<AuditLogEntity | null> {
    return this.log({ ...options, status: 'SUCCESS' });
  }

  /**
   * Логирование неудачной операции
   */
  async logFailure(options: Omit<AuditLogOptions, 'status'>): Promise<AuditLogEntity | null> {
    return this.log({ ...options, status: 'FAILURE' });
  }

  /**
   * Получить историю операций для сущности
   */
  async getEntityHistory(entity: AuditEntity, entityId: string, limit: number = 50): Promise<AuditLogEntity[]> {
    return this.getRepository().find({
      where: { entity, entityId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Получить историю операций пользователя
   */
  async getUserHistory(userId: string, limit: number = 50): Promise<AuditLogEntity[]> {
    return this.getRepository().find({
      where: { userId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Получить последние операции
   */
  async getRecent(limit: number = 100): Promise<AuditLogEntity[]> {
    return this.getRepository().find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Получить аудит логи с пагинацией и фильтрацией
   */
  async getLogs(
    filter: AuditLogFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedAuditLogs> {
    const queryBuilder = this.getRepository().createQueryBuilder('audit');
    
    // Применяем фильтры
    if (filter.userId) {
      queryBuilder.andWhere('audit.user_id = :userId', { userId: filter.userId });
    }
    
    if (filter.action) {
      queryBuilder.andWhere('audit.action = :action', { action: filter.action });
    }
    
    if (filter.entity) {
      queryBuilder.andWhere('audit.entity = :entity', { entity: filter.entity });
    }
    
    if (filter.status) {
      queryBuilder.andWhere('audit.status = :status', { status: filter.status });
    }
    
    if (filter.startDate) {
      queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate: filter.startDate });
    }
    
    if (filter.endDate) {
      queryBuilder.andWhere('audit.timestamp <= :endDate', { endDate: filter.endDate });
    }
    
    // Получаем общее количество записей
    const total = await queryBuilder.getCount();
    
    // Получаем данные с пагинацией
    const data = await queryBuilder
      .orderBy('audit.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}

// Экспорт единственного экземпляра для удобства
export const auditService = new AuditService();
