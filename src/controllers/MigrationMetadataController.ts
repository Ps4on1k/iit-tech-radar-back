import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { MigrationMetadataService } from '../services/MigrationMetadataService';
import { CreateMigrationMetadataDto, UpdateMigrationMetadataDto, UpdateMigrationPrioritiesDto } from '../dto/MigrationMetadataDto';
import { MigrationStatus } from '../models/MigrationMetadataEntity';
import { authenticate, isAdminOrManager } from '../middleware/auth';
import { AuditService } from '../services/AuditService';
import { logger } from '../utils/logger';

export class MigrationMetadataController extends BaseController {
  private migrationService: MigrationMetadataService;

  constructor() {
    super();
    const auditService = new AuditService();
    this.migrationService = new MigrationMetadataService(auditService);
  }

  /**
   * Получить все метаданные миграций (объединенные данные из VIEW)
   * GET /api/migration-metadata
   * Доступно: все авторизованные пользователи
   */
  private getAll = this.wrapAsync(async (req: Request, res: Response) => {
    const includeCompleted = req.query.includeCompleted === 'true';
    const metadata = await this.migrationService.getAllFromView(includeCompleted);
    this.sendSuccess(res, metadata);
  });

  /**
   * Получить метаданные по ID
   * GET /api/migration-metadata/:id
   * Доступно: все авторизованные пользователи
   */
  private getById = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const metadata = await this.migrationService.findById(id);

    if (!metadata) {
      this.sendNotFound(res, 'Метаданные миграции не найдены');
      return;
    }

    this.sendSuccess(res, metadata);
  });

  /**
   * Получить метаданные по techRadarId
   * GET /api/migration-metadata/tech-radar/:techRadarId
   * Доступно: все авторизованные пользователи
   */
  private getByTechRadarId = this.wrapAsync(async (req: Request, res: Response) => {
    const techRadarId = Array.isArray(req.params.techRadarId) 
      ? req.params.techRadarId[0] 
      : req.params.techRadarId;
    
    const metadata = await this.migrationService.findByTechRadarId(techRadarId);
    this.sendSuccess(res, metadata || null);
  });

  /**
   * Создать метаданные миграции
   * POST /api/migration-metadata
   * Доступно: admin, manager
   */
  private create = this.wrapAsync(async (req: Request, res: Response) => {
    const dto: CreateMigrationMetadataDto = req.body;
    const userId = (req as any).user?.id;

    if (!dto.techRadarId) {
      this.sendBadRequest(res, 'techRadarId обязателен');
      return;
    }

    const metadata = await this.migrationService.create(dto, userId);
    this.sendCreated(res, metadata);
  });

  /**
   * Обновить или создать метаданные миграции (upsert) по techRadarId
   * PUT /api/migration-metadata/upsert/:techRadarId
   * Если запись существует - обновляет, если нет - создает
   * Доступно: admin, manager
   */
  private upsert = this.wrapAsync(async (req: Request, res: Response) => {
    const techRadarId = Array.isArray(req.params.techRadarId) 
      ? req.params.techRadarId[0] 
      : req.params.techRadarId;
    const dto: UpdateMigrationMetadataDto = req.body;
    const userId = (req as any).user?.id;

    // Пытаемся найти существующую запись
    const existing = await this.migrationService.findByTechRadarId(techRadarId);
    
    if (existing) {
      // Обновляем существующую
      const updated = await this.migrationService.update(existing.id, dto, userId);
      this.sendSuccess(res, updated);
    } else {
      // Создаем новую
      const createDto: CreateMigrationMetadataDto = {
        techRadarId,
        priority: dto.priority ?? 999999,
        status: dto.status ?? MigrationStatus.BACKLOG,
        progress: dto.progress ?? 0,
      };
      const created = await this.migrationService.create(createDto, userId);
      this.sendCreated(res, created);
    }
  });

  /**
   * Обновить метаданные миграции
   * PUT /api/migration-metadata/:id
   * Если запись не найдена, пытается найти по techRadarId и создать новую
   * Доступно: admin, manager
   */
  private update = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dto: UpdateMigrationMetadataDto = req.body;
    const userId = (req as any).user?.id;

    // Пытаемся обновить существующую запись
    try {
      const metadata = await this.migrationService.update(id, dto, userId);
      this.sendSuccess(res, metadata);
      return;
    } catch (err: any) {
      // Если запись не найдена, пытаемся создать новую
      if (err.message === 'Метаданные миграции не найдены') {
        // Получаем techRadarId из тела запроса или заголовка
        const techRadarId = req.body.techRadarId || req.query.techRadarId;
        if (techRadarId) {
          const createDto: CreateMigrationMetadataDto = {
            techRadarId,
            ...dto,
          };
          const metadata = await this.migrationService.create(createDto, userId);
          this.sendCreated(res, metadata);
          return;
        }
      }
      throw err;
    }
  });

  /**
   * Массовое обновление приоритетов (для drag-n-drop)
   * PUT /api/migration-metadata/priorities
   * Доступно: admin, manager
   */
  private updatePriorities = this.wrapAsync(async (req: Request, res: Response) => {
    const dto: UpdateMigrationPrioritiesDto = req.body;
    const userId = (req as any).user?.id;

    if (!dto.items || !Array.isArray(dto.items)) {
      this.sendBadRequest(res, 'items должен быть массивом');
      return;
    }

    const updated = await this.migrationService.updatePriorities(dto, userId);
    this.sendSuccess(res, updated);
  });

  /**
   * Удалить метаданные миграции
   * DELETE /api/migration-metadata/:id
   * Доступно: admin, manager
   */
  private delete = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user?.id;

    await this.migrationService.delete(id, userId);
    this.sendNoContent(res);
  });

  /**
   * Получить статистику миграций
   * GET /api/migration-metadata/statistics
   * Доступно: все авторизованные пользователи
   */
  private getStatistics = this.wrapAsync(async (req: Request, res: Response) => {
    const statistics = await this.migrationService.getStatistics();
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
    router.get('/tech-radar/:techRadarId', authenticate, this.getByTechRadarId);

    // Роуты только для admin и manager
    router.post('/', authenticate, isAdminOrManager, this.create);
    router.put('/upsert/:techRadarId', authenticate, isAdminOrManager, this.upsert);
    router.put('/:id', authenticate, isAdminOrManager, this.update);
    router.put('/priorities', authenticate, isAdminOrManager, this.updatePriorities);
    router.delete('/:id', authenticate, isAdminOrManager, this.delete);

    return router;
  }
}
