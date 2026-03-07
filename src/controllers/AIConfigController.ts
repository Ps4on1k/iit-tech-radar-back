import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { AIConfigService } from '../services/AIConfigService';
import { CreateAIConfigDto, UpdateAIConfigDto, AIConfigGlobalSettingsDto } from '../dto/AIConfigDto';
import { authenticate, isAdmin } from '../middleware/auth';
import { AuditService } from '../services/AuditService';
import { logger } from '../utils/logger';

export class AIConfigController extends BaseController {
  private aiConfigService: AIConfigService;

  constructor() {
    super();
    const auditService = new AuditService();
    this.aiConfigService = new AIConfigService(auditService);
  }

  /**
   * Получить все конфигурации AI полей
   * GET /api/ai-config
   */
  private getAll = this.wrapAsync(async (req: Request, res: Response) => {
    const configs = await this.aiConfigService.findAll();
    this.sendSuccess(res, configs);
  });

  /**
   * Получить конфигурацию по ID
   * GET /api/ai-config/:id
   */
  private getById = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const config = await this.aiConfigService.findById(id);

    if (!config) {
      this.sendNotFound(res, 'Конфигурация не найдена');
      return;
    }

    this.sendSuccess(res, config);
  });

  /**
   * Создать новую конфигурацию
   * POST /api/ai-config
   */
  private create = this.wrapAsync(async (req: Request, res: Response) => {
    const dto: CreateAIConfigDto = req.body;
    const userId = (req as any).user?.id;

    if (!dto.fieldName || !dto.displayName) {
      this.sendBadRequest(res, 'Поля fieldName и displayName обязательны');
      return;
    }

    const config = await this.aiConfigService.create(dto, userId);
    this.sendCreated(res, config);
  });

  /**
   * Обновить конфигурацию
   * PUT /api/ai-config/:id
   */
  private update = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const dto: UpdateAIConfigDto = req.body;
    const userId = (req as any).user?.id;

    const config = await this.aiConfigService.update(id, dto, userId);
    this.sendSuccess(res, config);
  });

  /**
   * Удалить конфигурацию
   * DELETE /api/ai-config/:id
   */
  private delete = this.wrapAsync(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user?.id;

    await this.aiConfigService.delete(id, userId);
    this.sendNoContent(res);
  });

  /**
   * Получить глобальные настройки AI
   * GET /api/ai-config/global-settings
   */
  private getGlobalSettings = this.wrapAsync(async (req: Request, res: Response) => {
    const settings = await this.aiConfigService.getGlobalSettings();
    this.sendSuccess(res, settings);
  });

  /**
   * Обновить глобальные настройки AI
   * PUT /api/ai-config/global-settings
   */
  private updateGlobalSettings = this.wrapAsync(async (req: Request, res: Response) => {
    const dto: AIConfigGlobalSettingsDto = req.body;
    const userId = (req as any).user?.id;

    const settings = await this.aiConfigService.updateGlobalSettings(dto, userId);
    this.sendSuccess(res, settings);
  });

  public registerRoutes(): any {
    const express = require('express');
    const router = express.Router();

    // Все маршруты требуют аутентификации и роль администратора
    router.use(authenticate, isAdmin);

    // Специфичные маршруты должны быть зарегистрированы ДО маршрутов с параметрами
    router.get('/', this.getAll);
    router.get('/global-settings', this.getGlobalSettings);
    router.put('/global-settings', this.updateGlobalSettings);
    router.get('/:id', this.getById);
    router.post('/', this.create);
    router.put('/:id', this.update);
    router.delete('/:id', this.delete);

    return router;
  }
}
