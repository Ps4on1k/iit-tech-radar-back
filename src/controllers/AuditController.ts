import { Request, Response } from 'express';
import { auditService, AuditLogFilter } from '../services/AuditService';
import { BaseController } from './BaseController';

/**
 * Безопасный парсинг JSON
 */
function safeJsonParse(str: string | null | undefined): any {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return str; // Возвращаем как строку если не JSON
  }
}

/**
 * Контроллер для управления аудит логами
 * Доступно только для роли admin
 */
export class AuditController extends BaseController {
  /**
   * Получить аудит логи с пагинацией и фильтрацией
   * GET /api/audit
   */
  getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      
      // Проверка роли admin
      if (!authReq.user || authReq.user.role !== 'admin') {
        this.sendForbidden(res, 'Только администратор может просматривать аудит логи');
        return;
      }

      // Парсим параметры запроса
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      
      const filter: AuditLogFilter = {
        userId: req.query.userId as string,
        action: req.query.action as any,
        entity: req.query.entity as any,
        status: req.query.status as any,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };

      // Очищаем undefined значения
      Object.keys(filter).forEach(key => {
        if (filter[key as keyof AuditLogFilter] === undefined) {
          delete filter[key as keyof AuditLogFilter];
        }
      });

      // Валидация пагинации
      if (page < 1) {
        this.sendBadRequest(res, 'Номер страницы должен быть больше 0');
        return;
      }

      if (limit < 1 || limit > 100) {
        this.sendBadRequest(res, 'Лимит должен быть от 1 до 100');
        return;
      }

      const result = await auditService.getLogs(filter, page, limit);

      this.sendSuccess(res, {
        data: result.data.map(log => ({
          id: log.id,
          userId: log.userId,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          ipAddress: log.ipAddress,
          details: log.details ? safeJsonParse(log.details) : null,
          status: log.status,
          timestamp: log.timestamp,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      this.handleError(res, error, 'Ошибка при получении аудит логов');
    }
  };

  /**
   * Получить детали конкретного аудита лога
   * GET /api/audit/:id
   */
  getLogById = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      
      // Проверка роли admin
      if (!authReq.user || authReq.user.role !== 'admin') {
        this.sendForbidden(res, 'Только администратор может просматривать аудит логи');
        return;
      }

      const id = String(req.params.id);
      
      // Получаем лог из БД (нужно добавить метод в сервис)
      const { AppDataSource } = await import('../database');
      const { AuditLogEntity } = await import('../models/AuditLogEntity');
      
      const repository = AppDataSource.getRepository(AuditLogEntity);
      const log = await repository.findOne({ where: { id } });

      if (!log) {
        this.sendNotFound(res, 'Аудит лог не найден');
        return;
      }

      this.sendSuccess(res, {
        id: log.id,
        userId: log.userId,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        ipAddress: log.ipAddress,
        details: log.details ? safeJsonParse(log.details) : null,
        status: log.status,
        timestamp: log.timestamp,
      });
    } catch (error) {
      this.handleError(res, error, 'Ошибка при получении аудита лога');
    }
  };

  /**
   * Получить статистику по аудит логам
   * GET /api/audit/statistics
   */
  getStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      
      // Проверка роли admin
      if (!authReq.user || authReq.user.role !== 'admin') {
        this.sendForbidden(res, 'Только администратор может просматривать статистику аудита');
        return;
      }

      const { AppDataSource } = await import('../database');
      const { AuditLogEntity } = await import('../models/AuditLogEntity');
      
      const repository = AppDataSource.getRepository(AuditLogEntity);

      // Общая статистика
      const total = await repository.count();
      
      // По действиям
      const byAction = await repository
        .createQueryBuilder('audit')
        .select('audit.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.action')
        .getRawMany();

      // По сущностям
      const byEntity = await repository
        .createQueryBuilder('audit')
        .select('audit.entity', 'entity')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.entity')
        .getRawMany();

      // По статусам
      const byStatus = await repository
        .createQueryBuilder('audit')
        .select('audit.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('audit.status')
        .getRawMany();

      // Последние 7 дней
      const last7Days = await repository
        .createQueryBuilder('audit')
        .select('DATE(audit.timestamp)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('audit.timestamp >= :date', { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) })
        .groupBy('DATE(audit.timestamp)')
        .orderBy('DATE(audit.timestamp)', 'DESC')
        .getRawMany();

      this.sendSuccess(res, {
        total,
        byAction: byAction.reduce((acc, row) => ({ ...acc, [row.action]: parseInt(row.count, 10) }), {}),
        byEntity: byEntity.reduce((acc, row) => ({ ...acc, [row.entity]: parseInt(row.count, 10) }), {}),
        byStatus: byStatus.reduce((acc, row) => ({ ...acc, [row.status]: parseInt(row.count, 10) }), {}),
        last7Days: last7Days.map(row => ({ date: row.date, count: parseInt(row.count, 10) })),
      });
    } catch (error) {
      this.handleError(res, error, 'Ошибка при получении статистики аудита');
    }
  };
}
