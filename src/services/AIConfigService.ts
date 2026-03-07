import { Repository } from 'typeorm';
import { AIConfigEntity } from '../models/AIConfigEntity';
import { CreateAIConfigDto, UpdateAIConfigDto, AIConfigGlobalSettingsDto } from '../dto/AIConfigDto';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { AppDataSource } from '../database';
import { AIUpdateService } from './AIUpdateService';
import { AIConfig } from '../types/asyncapi';

export class AIConfigService {
  private repository: Repository<AIConfigEntity> | null = null;
  private aiUpdateService: AIUpdateService | null = null;
  private globalSettings: AIConfigGlobalSettingsDto = {
    apiKey: '',
    apiEndpoint: '',
    updateFrequency: 24, // по умолчанию раз в сутки
  };

  constructor(
    private auditService: AuditService
  ) {}

  private getRepository(): Repository<AIConfigEntity> {
    if (!this.repository) {
      this.repository = AppDataSource.getRepository(AIConfigEntity);
    }
    return this.repository;
  }

  /**
   * Получение или создание AIUpdateService
   */
  private getAIUpdateService(): AIUpdateService {
    if (!this.aiUpdateService) {
      this.aiUpdateService = new AIUpdateService(this.auditService);
    }
    return this.aiUpdateService;
  }

  async findAll(): Promise<AIConfigEntity[]> {
    const repo = this.getRepository();
    return repo.find({ order: { displayName: 'ASC' } });
  }

  async findByFieldName(fieldName: string): Promise<AIConfigEntity | undefined> {
    return this.getRepository().findOne({ where: { fieldName } }) as Promise<AIConfigEntity | undefined>;
  }

  async findById(id: string): Promise<AIConfigEntity | undefined> {
    return this.getRepository().findOne({ where: { id } }) as Promise<AIConfigEntity | undefined>;
  }

  async create(dto: CreateAIConfigDto, userId?: string): Promise<AIConfigEntity> {
    const existing = await this.findByFieldName(dto.fieldName);
    if (existing) {
      throw new Error(`Конфигурация для поля ${dto.fieldName} уже существует`);
    }

    const repository = this.getRepository();
    const config = repository.create({
      ...dto,
      enabled: dto.enabled ?? false,
      prompt: dto.prompt ?? 'Проведи анализ публичных доступных данных, сделай вывод и обнови это значение',
    });

    const saved = await repository.save(config);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'CREATE',
        entity: 'AIConfig',
        entityId: saved.id,
        details: { fieldName: dto.fieldName, displayName: dto.displayName },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for AIConfig create', { error: auditError?.message });
    }

    return saved;
  }

  async update(id: string, dto: UpdateAIConfigDto, userId?: string): Promise<AIConfigEntity> {
    const config = await this.findById(id);
    if (!config) {
      throw new Error(`Конфигурация с ID ${id} не найдена`);
    }

    Object.assign(config, dto);
    const repository = this.getRepository();
    const updated = await repository.save(config);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'UPDATE',
        entity: 'AIConfig',
        entityId: id,
        details: { changes: dto },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for AIConfig update', { error: auditError?.message });
    }

    return updated;
  }

  async delete(id: string, userId?: string): Promise<void> {
    const config = await this.findById(id);
    if (!config) {
      throw new Error(`Конфигурация с ID ${id} не найдена`);
    }

    const repository = this.getRepository();
    await repository.delete(id);

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'DELETE',
        entity: 'AIConfig',
        entityId: id,
        details: { fieldName: config.fieldName },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for AIConfig delete', { error: auditError?.message });
    }
  }

  async getGlobalSettings(): Promise<AIConfigGlobalSettingsDto> {
    return { ...this.globalSettings };
  }

  async updateGlobalSettings(settings: AIConfigGlobalSettingsDto, userId?: string): Promise<AIConfigGlobalSettingsDto> {
    const oldSettings = { ...this.globalSettings };
    this.globalSettings = { ...this.globalSettings, ...settings };

    try {
      await this.auditService.logSuccess({
        userId,
        action: 'UPDATE',
        entity: 'AIConfig',
        entityId: 'global',
        details: { oldSettings, newSettings: this.globalSettings },
      });
    } catch (auditError: any) {
      logger.warn('Audit log failed for AIConfig global settings update', { error: auditError?.message });
    }

    logger.info('AI global settings updated', { settings: this.globalSettings });

    return { ...this.globalSettings };
  }

  async getEnabledConfigs(): Promise<AIConfigEntity[]> {
    return this.getRepository().find({
      where: { enabled: true },
      order: { displayName: 'ASC' }
    });
  }

  /**
   * Запрос на обновление технологии через AI агента
   */
  async requestAIUpdate(
    technologyId: string,
    userId?: string,
    reason?: string,
    trigger?: string
  ): Promise<string> {
    const aiUpdateService = this.getAIUpdateService();

    // Инициализируем сервис при первом вызове
    if (!aiUpdateService) {
      throw new Error('AIUpdateService не доступен');
    }

    try {
      const correlationId = await aiUpdateService.requestUpdate(
        technologyId,
        undefined,
        reason,
        trigger
      );

      await this.auditService.logSuccess({
        userId,
        action: 'UPDATE',
        entity: 'AIConfig',
        entityId: technologyId,
        details: {
          correlationId,
          action: 'AI update requested',
          reason,
          trigger
        }
      });

      return correlationId;
    } catch (error: any) {
      logger.error('AIConfigService.requestAIUpdate: Error', { error: error?.message || error });
      throw error;
    }
  }

  /**
   * Массовый запрос на обновление технологий через AI агента
   */
  async requestBulkAIUpdate(
    technologyIds: string[],
    userId?: string,
    mode: 'parallel' | 'sequential' = 'parallel',
    maxConcurrency: number = 3
  ): Promise<string> {
    const aiUpdateService = this.getAIUpdateService();

    try {
      const correlationId = await aiUpdateService.requestBulkUpdate(
        technologyIds,
        undefined,
        mode,
        maxConcurrency
      );

      await this.auditService.logSuccess({
        userId,
        action: 'UPDATE',
        entity: 'AIConfig',
        entityId: 'bulk',
        details: {
          correlationId,
          action: 'AI bulk update requested',
          count: technologyIds.length,
          mode
        }
      });

      return correlationId;
    } catch (error: any) {
      logger.error('AIConfigService.requestBulkAIUpdate: Error', { error: error?.message || error });
      throw error;
    }
  }

  /**
   * Построение AI конфигурации для запроса
   */
  async buildAIConfigForRequest(fieldNames?: string[]): Promise<AIConfig> {
    const enabledConfigs = await this.getEnabledConfigs();

    const fields: Record<string, any> = {};

    for (const config of enabledConfigs) {
      if (!fieldNames || fieldNames.includes(config.fieldName)) {
        fields[config.fieldName] = {
          enabled: config.enabled,
          prompt: config.prompt,
          required: false
        };
      }
    }

    // Используем общий промпт из глобальных настроек, если он есть
    const defaultPrompt = this.globalSettings.defaultPrompt || 
      'Проанализируй технологию и обнови все доступные поля на основе последних данных';

    return {
      prompt: defaultPrompt,
      fields
    };
  }

  /**
   * Проверка подключения к RabbitMQ
   */
  async checkRabbitMQConnection(): Promise<boolean> {
    const aiUpdateService = this.getAIUpdateService();
    return aiUpdateService.checkConnection();
  }

  /**
   * Получение статуса AI сервиса
   */
  async getAIServiceStatus(): Promise<{
    isInitialized: boolean;
    rabbitMQ: any;
  }> {
    const aiUpdateService = this.getAIUpdateService();
    return aiUpdateService.getStatus();
  }
}
