import { AppDataSource } from '../database';
import { AuditLogEntity } from '../models/AuditLogEntity';
import { Repository, LessThan } from 'typeorm';
import { logger } from '../utils/logger';

/**
 * Сервис для автоматической очистки журнала аудита
 * Удаляет записи старше 14 дней и оставляет запись об очистке
 */
export class AuditCleanupService {
  private repository: Repository<AuditLogEntity>;
  private readonly RETENTION_DAYS = parseInt(process.env.AUDIT_RETENTION_DAYS || '14', 10);

  constructor() {
    this.repository = AppDataSource.getRepository(AuditLogEntity);
  }

  /**
   * Очистить старые записи аудита
   * @returns Количество удалённых записей
   */
  async cleanup(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.RETENTION_DAYS);

      logger.info(`Audit cleanup: поиск записей старше ${cutoffDate.toISOString()} (период хранения: ${this.RETENTION_DAYS} дн.)`);

      // Считаем количество записей до удаления
      const countBefore = await this.repository.count({
        where: {
          timestamp: LessThan(cutoffDate),
        },
      });

      logger.info(`Audit cleanup: найдено ${countBefore} старых записей`);

      if (countBefore === 0) {
        logger.info('Audit cleanup: нет старых записей для удаления');
        return 0;
      }

      // Удаляем старые записи
      const deleteResult = await this.repository
        .createQueryBuilder('audit')
        .delete()
        .where('audit.timestamp < :cutoffDate', { cutoffDate })
        .execute();

      const deletedCount = deleteResult.affected || 0;

      // Создаём запись об очистке
      await this.repository.save({
        action: 'AUDIT_CLEANUP',
        entity: 'Audit',
        status: 'SUCCESS',
        details: JSON.stringify({
          deletedRecords: deletedCount,
          cutoffDate: cutoffDate.toISOString(),
          executedAt: new Date().toISOString(),
        }),
      });

      logger.info(`Audit cleanup: удалено ${deletedCount} записей старше ${cutoffDate.toISOString()}`);

      return deletedCount;
    } catch (error: any) {
      logger.error('Audit cleanup failed:', {
        error: error.message,
        stack: error.stack,
      });

      // Создаём запись об ошибке очистки
      try {
        await this.repository.save({
          action: 'AUDIT_CLEANUP',
          entity: 'Audit',
          status: 'FAILURE',
          details: JSON.stringify({
            error: error.message,
            executedAt: new Date().toISOString(),
          }),
        });
      } catch (saveError) {
        logger.error('Failed to save audit cleanup error:', saveError);
      }

      throw error;
    }
  }

  /**
   * Получить дату cutoff для записей
   */
  getCutoffDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() - this.RETENTION_DAYS);
    return date;
  }
}
