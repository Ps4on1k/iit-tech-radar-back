import cron from 'node-cron';
import { AuditCleanupService } from '../services/AuditCleanupService';
import { logger } from '../utils/logger';

// Создаём экземпляр сервиса
const auditCleanupService = new AuditCleanupService();

/**
 * Планировщик задач для фоновых операций
 */
export class TaskScheduler {
  private cleanupJob: cron.ScheduledTask | null = null;

  /**
   * Запустить планировщик задач
   */
  start(): void {
    // Очистка журнала аудита каждый день в 02:00 (production)
    // Для тестирования использовать: '*/10 * * * *' (каждые 10 минут)
    this.cleanupJob = cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled audit cleanup...');
      try {
        const deletedCount = await auditCleanupService.cleanup();
        logger.info(`Audit cleanup completed. Deleted ${deletedCount} records.`);
      } catch (error: any) {
        logger.error('Scheduled audit cleanup failed:', {
          error: error.message,
          stack: error.stack,
        });
      }
    }, {
      scheduled: true,
      timezone: 'Europe/Moscow',
    });

    logger.info('Task scheduler started. Audit cleanup scheduled for 02:00 daily (PRODUCTION MODE).');
  }

  /**
   * Остановить планировщик задач
   */
  stop(): void {
    if (this.cleanupJob) {
      this.cleanupJob.stop();
      this.cleanupJob = null;
      logger.info('Task scheduler stopped.');
    }
  }

  /**
   * Выполнить очистку аудита немедленно (для тестирования)
   */
  async runCleanupNow(): Promise<number> {
    logger.info('Running immediate audit cleanup...');
    const deletedCount = await auditCleanupService.cleanup();
    logger.info(`Immediate audit cleanup completed. Deleted ${deletedCount} records.`);
    return deletedCount;
  }
}

// Экспорт единственного экземпляра
export const taskScheduler = new TaskScheduler();
