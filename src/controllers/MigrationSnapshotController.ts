import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { MigrationSnapshotService } from '../services/MigrationSnapshotService';
import { MigrationMetadataService } from '../services/MigrationMetadataService';
import { CreateMigrationSnapshotDto } from '../dto/MigrationSnapshotDto';
import { authenticate, isAdminOrManager } from '../middleware/auth';
import { AuditService } from '../services/AuditService';
import { MigrationMetadataEntity, MigrationStatus } from '../models/MigrationMetadataEntity';

export class MigrationSnapshotController extends BaseController {
  private snapshotService: MigrationSnapshotService;
  private metadataService: MigrationMetadataService;

  constructor() {
    super();
    const auditService = new AuditService();
    this.snapshotService = new MigrationSnapshotService(auditService);
    this.metadataService = new MigrationMetadataService(auditService);
  }

  /**
   * Получить все снапшоты завершенных миграций
   * GET /api/migration-snapshots
   * Доступно: все авторизованные пользователи
   */
  private getAll = this.wrapAsync(async (req: Request, res: Response) => {
    const snapshots = await this.snapshotService.getAll();
    this.sendSuccess(res, snapshots);
  });

  /**
   * Получить снапшот по ID
   * GET /api/migration-snapshots/:id
   * Доступно: все авторизованные пользователи
   */
  private getById = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const snapshot = await this.snapshotService.findById(id);

    if (!snapshot) {
      this.sendNotFound(res, 'Снапшот миграции не найден');
      return;
    }

    this.sendSuccess(res, snapshot);
  });

  /**
   * Завершить миграцию - создать снапшот и удалить метаданные
   * POST /api/migration-snapshots/complete/:techRadarId
   * Доступно: admin, manager
   */
  private completeMigration = this.wrapAsync(async (req: Request, res: Response) => {
    const techRadarId = Array.isArray(req.params.techRadarId)
      ? req.params.techRadarId[0]
      : req.params.techRadarId;
    const userId = (req as any).user?.id;

    // Находим существующие метаданные
    const existingMetadata = await this.metadataService.findByTechRadarId(techRadarId);
    if (!existingMetadata) {
      this.sendBadRequest(res, 'Метаданные миграции не найдены');
      return;
    }

    // Проверяем, что миграция имеет статус completed
    if (existingMetadata.status !== MigrationStatus.COMPLETED) {
      this.sendBadRequest(res, 'Завершить можно только миграцию со статусом "completed"');
      return;
    }

    // Получаем данные о технологии из запроса
    const { techName, versionBefore, versionAfter, deadline, upgradePath, recommendedAlternatives } = req.body;

    if (!techName || !versionBefore) {
      this.sendBadRequest(res, 'techName и versionBefore обязательны');
      return;
    }

    // Создаем снапшот
    const snapshotDto: CreateMigrationSnapshotDto = {
      techRadarId,
      techName,
      versionBefore,
      versionAfter,
      deadline,
      upgradePath,
      recommendedAlternatives,
      priority: existingMetadata.priority,
      completedBy: userId,
    };

    const snapshot = await this.snapshotService.create(snapshotDto, userId);

    // Удаляем метаданные миграции
    await this.metadataService.delete(existingMetadata.id, userId);

    this.sendCreated(res, snapshot);
  });

  /**
   * Удалить снапшот
   * DELETE /api/migration-snapshots/:id
   * Доступно: admin, manager
   */
  private delete = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user?.id;

    await this.snapshotService.delete(id, userId);
    this.sendNoContent(res);
  });

  /**
   * Удалить все снапшоты (очистка архива)
   * DELETE /api/migration-snapshots/all
   * Доступно: только admin
   */
  private deleteAll = this.wrapAsync(async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    // Проверяем, что пользователь - admin
    if (userRole !== 'admin') {
      this.sendForbidden(res, 'Только администратор может очистить архив');
      return;
    }

    const deletedCount = await this.snapshotService.deleteAll(userId);
    this.sendSuccess(res, { message: `Удалено ${deletedCount} снапшотов`, deletedCount });
  });

  /**
   * Получить статистику снапшотов
   * GET /api/migration-snapshots/statistics
   * Доступно: все авторизованные пользователи
   */
  private getStatistics = this.wrapAsync(async (req: Request, res: Response) => {
    const statistics = await this.snapshotService.getStatistics();
    this.sendSuccess(res, statistics);
  });

  /**
   * Регистрация роутов
   */
  registerRoutes() {
    const router = this.getRouter();

    // Публичные роуты (для всех авторизованных)
    router.get('/', authenticate, this.getAll);
    router.get('/statistics', authenticate, this.getStatistics);
    router.get('/:id', authenticate, this.getById);

    // Роуты только для admin и manager
    router.post('/complete/:techRadarId', authenticate, isAdminOrManager, this.completeMigration);
    router.delete('/:id', authenticate, isAdminOrManager, this.delete);

    // Роуты только для admin
    router.delete('/all', authenticate, isAdminOrManager, this.deleteAll);

    return router;
  }
}
