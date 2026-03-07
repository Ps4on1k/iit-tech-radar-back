/**
 * AI Update Service
 * Сервис для обновления данных технологий через AI агента (Qwen) via RabbitMQ
 */

import { Repository } from 'typeorm';
import { TechRadarEntity } from '../models/TechRadarEntity';
import { AIConfigEntity } from '../models/AIConfigEntity';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { AppDataSource } from '../database';
import { RabbitMQService } from './RabbitMQService';
import {
  UpdateRequest,
  UpdateResponse,
  BulkUpdateResponse,
  AIConfig,
  TechRadarEntity as AsyncApiTechRadar
} from '../types/asyncapi';

export interface AIUpdateResult {
  technologyId: string;
  success: boolean;
  updatedFields: Record<string, any>;
  failedFields: Array<{ fieldName: string; reason: string }>;
  message?: string;
}

/**
 * Сервис для обновления данных через AI агента
 */
export class AIUpdateService {
  private techRadarRepository: Repository<TechRadarEntity> | null = null;
  private aiConfigRepository: Repository<AIConfigEntity> | null = null;
  private rabbitMQService: RabbitMQService;
  private isInitialized: boolean = false;

  constructor(
    private auditService: AuditService
  ) {
    // RabbitMQ конфигурация из переменных окружения
    const rabbitMQConfig = {
      host: process.env.RABBITMQ_HOST || 'localhost',
      port: parseInt(process.env.RABBITMQ_PORT || '5672'),
      username: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
      vhost: process.env.RABBITMQ_VHOST || '',
      requestQueue: process.env.RABBITMQ_REQUEST_QUEUE || 'techradar.requests',
      responseQueue: process.env.RABBITMQ_RESPONSE_QUEUE || 'techradar.responses'
    };

    this.rabbitMQService = new RabbitMQService(rabbitMQConfig);
  }

  /**
   * Инициализация сервиса
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.techRadarRepository = AppDataSource.getRepository(TechRadarEntity);
      this.aiConfigRepository = AppDataSource.getRepository(AIConfigEntity);

      // Подключение к RabbitMQ
      await this.rabbitMQService.connect();

      // Подписка на ответы от агента
      await this.rabbitMQService.subscribeToResponses(
        async (response, correlationId) => {
          await this.handleAgentResponse(response, correlationId);
        }
      );

      this.isInitialized = true;
      logger.info('[AIUpdateService] Сервис инициализирован');
    } catch (error: any) {
      logger.error('[AIUpdateService] Ошибка инициализации:', { error: error?.message || error });
      throw error;
    }
  }

  /**
   * Обработка ответа от AI агента
   */
  private async handleAgentResponse(
    response: UpdateResponse | BulkUpdateResponse,
    correlationId: string
  ): Promise<void> {
    // Проверяем тип ответа
    if ('results' in response) {
      // Это BulkUpdateResponse - обрабатываем массовый ответ
      logger.info('[AIUpdateService] Обработка массового ответа агента:', {
        correlationId,
        status: response.status,
        totalResults: response.results?.length
      });

      // Обрабатываем каждый результат отдельно
      if (response.results) {
        for (const result of response.results) {
          if (result.response) {
            await this.handleSingleResponse(result.response, correlationId);
          } else if (result.status === 'error') {
            logger.warn('[AIUpdateService] Ошибка обновления технологии:', {
              correlationId,
              technologyId: result.technologyId,
              error: result.error
            });
          }
        }
      }
      return;
    }

    // Это UpdateResponse - обрабатываем единичный ответ
    await this.handleSingleResponse(response as UpdateResponse, correlationId);
  }

  /**
   * Обработка единичного ответа от AI агента
   */
  private async handleSingleResponse(
    response: UpdateResponse,
    correlationId: string
  ): Promise<void> {
    logger.info('[AIUpdateService] Обработка ответа агента:', {
      correlationId,
      technologyId: response.technologyId,
      status: response.status
    });

    try {
      if (response.status === 'error') {
        logger.warn('[AIUpdateService] Ошибка обновления от агента:', {
          correlationId,
          error: response.error
        });

        await this.auditService.logFailure({
          action: 'UPDATE',
          entity: 'TechRadar',
          entityId: response.technologyId,
          details: {
            correlationId,
            error: response.error,
            aiMessage: response.aiMessage
          }
        });

        return;
      }

      // Применяем обновления в БД
      if (Object.keys(response.updatedFields).length > 0) {
        await this.applyUpdates(response.technologyId, response.updatedFields);

        logger.info('[AIUpdateService] Поля обновлены:', {
          correlationId,
          technologyId: response.technologyId,
          fields: Object.keys(response.updatedFields)
        });

        await this.auditService.logSuccess({
          action: 'UPDATE',
          entity: 'TechRadar',
          entityId: response.technologyId,
          details: {
            correlationId,
            updatedFields: response.updatedFields,
            sources: response.sources,
            aiMessage: response.aiMessage
          }
        });
      }

      // Логируем неудачные поля
      if (response.failedFields.length > 0) {
        logger.warn('[AIUpdateService] Не удалось обновить поля:', {
          correlationId,
          failedFields: response.failedFields
        });
      }
    } catch (error: any) {
      logger.error('[AIUpdateService] Ошибка применения обновлений:', {
        correlationId,
        error: error?.message || error
      });

      await this.auditService.logFailure({
        action: 'UPDATE',
        entity: 'TechRadar',
        entityId: response.technologyId,
        details: {
          correlationId,
          error: error?.message || error
        }
      });
    }
  }

  /**
   * Применение обновлений в БД
   */
  private async applyUpdates(
    technologyId: string,
    updatedFields: Record<string, any>
  ): Promise<void> {
    if (!this.techRadarRepository) {
      throw new Error('Repository не инициализирован');
    }

    // Проверяем существование технологии
    const existing = await this.techRadarRepository.findOne({
      where: { id: technologyId }
    });

    if (!existing) {
      throw new Error(`Технология с ID ${technologyId} не найдена`);
    }

    // Фильтруем поля, которые можно обновить
    const allowedFields: Array<keyof TechRadarEntity> = [
      'version',
      'versionReleaseDate',
      'lastUpdated',
      'maturity',
      'riskLevel',
      'supportStatus',
      'adoptionRate',
      'popularityIndex',
      'communitySize',
      'securityVulnerabilities',
      'documentationUrl',
      'description',
      'owner',
      'license',
      'performanceImpact',
      'costFactor',
      'vendorLockIn',
      'businessCriticality',
      'versionToUpdate',
      'versionUpdateDeadline',
      'endOfLifeDate'
    ];

    const fieldsToUpdate: Partial<TechRadarEntity> = {};

    for (const [fieldName, value] of Object.entries(updatedFields)) {
      if (allowedFields.includes(fieldName as keyof TechRadarEntity)) {
        fieldsToUpdate[fieldName as keyof TechRadarEntity] = value;
      } else {
        logger.warn('[AIUpdateService] Поле не разрешено для обновления:', { fieldName });
      }
    }

    // Добавляем дату последнего обновления
    fieldsToUpdate.lastUpdated = new Date().toISOString().split('T')[0];

    // Обновляем сущность
    Object.assign(existing, fieldsToUpdate);
    await this.techRadarRepository.save(existing);
  }

  /**
   * Отправка запроса на обновление технологии
   */
  async requestUpdate(
    technologyId: string,
    aiConfig?: AIConfig,
    reason?: string,
    trigger?: string
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Получаем текущие данные технологии
      const currentData = await this.getCurrentTechRadarData(technologyId);

      if (!currentData) {
        throw new Error(`Технология с ID ${technologyId} не найдена`);
      }

      // Получаем AI конфигурацию для полей
      const fieldConfigs = await this.getAIFieldConfigs();

      // Формируем запрос
      const request: UpdateRequest = {
        correlationId: '', // Будет сгенерирован в RabbitMQService
        technologyId,
        aiConfig: aiConfig || this.buildAIConfig(fieldConfigs),
        currentData: this.convertToAsyncApiFormat(currentData),
        reason: reason || 'AI обновление по расписанию',
        trigger: trigger || 'scheduled-job',
        priority: 'normal'
      };

      // Отправляем запрос
      const correlationId = await this.rabbitMQService.sendRequest(request);

      logger.info('[AIUpdateService] Запрос отправлен:', {
        correlationId,
        technologyId,
        fieldsCount: request.currentData ? Object.keys(request.currentData).length : 0
      });

      await this.auditService.logSuccess({
        action: 'UPDATE',
        entity: 'TechRadar',
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
      logger.error('[AIUpdateService] Ошибка отправки запроса:', {
        error: error?.message || error
      });

      await this.auditService.logFailure({
        action: 'UPDATE',
        entity: 'TechRadar',
        entityId: technologyId,
        details: {
          error: error?.message || error,
          reason
        }
      });

      throw error;
    }
  }

  /**
   * Отправка запроса и ожидание ответа
   */
  async requestUpdateAndWait(
    technologyId: string,
    aiConfig?: AIConfig,
    timeoutMs: number = 60000
  ): Promise<AIUpdateResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Получаем текущие данные технологии
      const currentData = await this.getCurrentTechRadarData(technologyId);

      if (!currentData) {
        throw new Error(`Технология с ID ${technologyId} не найдена`);
      }

      // Получаем AI конфигурацию для полей
      const fieldConfigs = await this.getAIFieldConfigs();

      // Формируем запрос
      const request: UpdateRequest = {
        correlationId: '',
        technologyId,
        aiConfig: aiConfig || this.buildAIConfig(fieldConfigs),
        currentData: this.convertToAsyncApiFormat(currentData),
        reason: 'AI обновление по запросу',
        trigger: 'manual-request',
        priority: 'high'
      };

      // Отправляем и ждем ответ
      const response = await this.rabbitMQService.sendRequestAndWait(request, timeoutMs) as UpdateResponse;

      if (response.status === 'error') {
        return {
          technologyId,
          success: false,
          updatedFields: {},
          failedFields: [],
          message: response.aiMessage || 'Ошибка обработки'
        };
      }

      // Применяем обновления
      if (Object.keys(response.updatedFields).length > 0) {
        await this.applyUpdates(technologyId, response.updatedFields);
      }

      return {
        technologyId,
        success: response.status === 'success',
        updatedFields: response.updatedFields,
        failedFields: response.failedFields.map(f => ({
          fieldName: f.fieldName,
          reason: f.reason
        })),
        message: response.aiMessage
      };
    } catch (error: any) {
      logger.error('[AIUpdateService] Ошибка обновления:', {
        error: error?.message || error
      });

      return {
        technologyId,
        success: false,
        updatedFields: {},
        failedFields: [],
        message: error?.message || 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Массовое обновление технологий
   */
  async requestBulkUpdate(
    technologyIds: string[],
    aiConfig?: AIConfig,
    mode: 'parallel' | 'sequential' = 'parallel',
    maxConcurrency: number = 3
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const requests: Array<{
        technologyId: string;
        aiConfig?: AIConfig;
        currentData?: AsyncApiTechRadar;
      }> = [];

      for (const techId of technologyIds) {
        const currentData = await this.getCurrentTechRadarData(techId);
        if (currentData) {
          requests.push({
            technologyId: techId,
            aiConfig: aiConfig,
            currentData: this.convertToAsyncApiFormat(currentData)
          });
        }
      }

      if (requests.length === 0) {
        throw new Error('Нет технологий для обновления');
      }

      const correlationId = await this.rabbitMQService.sendRequest({
        correlationId: '',
        requests,
        mode,
        maxConcurrency,
        aiConfig
      });

      logger.info('[AIUpdateService] Массовый запрос отправлен:', {
        correlationId,
        count: requests.length,
        mode
      });

      await this.auditService.logSuccess({
        action: 'UPDATE',
        entity: 'TechRadar',
        entityId: 'bulk',
        details: {
          correlationId,
          action: 'AI bulk update requested',
          count: requests.length,
          technologyIds: technologyIds
        }
      });

      return correlationId;
    } catch (error: any) {
      logger.error('[AIUpdateService] Ошибка массового обновления:', {
        error: error?.message || error
      });

      throw error;
    }
  }

  /**
   * Получение текущих данных технологии
   */
  private async getCurrentTechRadarData(technologyId: string): Promise<TechRadarEntity | null> {
    if (!this.techRadarRepository) {
      throw new Error('Repository не инициализирован');
    }

    return this.techRadarRepository.findOne({
      where: { id: technologyId }
    });
  }

  /**
   * Получение AI конфигурации для полей
   */
  private async getAIFieldConfigs(): Promise<AIConfigEntity[]> {
    if (!this.aiConfigRepository) {
      return [];
    }

    try {
      return await this.aiConfigRepository.find({
        where: { enabled: true },
        order: { displayName: 'ASC' }
      });
    } catch (error: any) {
      logger.warn('[AIUpdateService] Ошибка получения AI конфигурации:', {
        error: error?.message || error
      });
      return [];
    }
  }

  /**
   * Построение AI конфигурации из сущностей
   */
  private buildAIConfig(fieldConfigs: AIConfigEntity[]): AIConfig {
    const fields: Record<string, any> = {};

    for (const config of fieldConfigs) {
      fields[config.fieldName] = {
        enabled: config.enabled,
        prompt: config.prompt,
        required: false // По умолчанию не обязательные
      };
    }

    return {
      prompt: 'Проанализируй технологию и обнови все доступные поля на основе последних данных',
      fields
    };
  }

  /**
   * Конвертация TechRadarEntity в формат AsyncAPI
   */
  private convertToAsyncApiFormat(entity: TechRadarEntity): AsyncApiTechRadar {
    return {
      id: entity.id,
      name: entity.name,
      version: entity.version,
      versionReleaseDate: entity.versionReleaseDate,
      type: entity.type as AsyncApiTechRadar['type'],
      subtype: entity.subtype,
      category: entity.category as AsyncApiTechRadar['category'],
      description: entity.description,
      firstAdded: entity.firstAdded,
      lastUpdated: entity.lastUpdated,
      owner: entity.owner,
      stakeholders: entity.stakeholders,
      maturity: entity.maturity as AsyncApiTechRadar['maturity'],
      riskLevel: entity.riskLevel as AsyncApiTechRadar['riskLevel'],
      license: entity.license,
      adoptionRate: entity.adoptionRate,
      popularityIndex: entity.popularityIndex,
      communitySize: entity.communitySize,
      documentationUrl: entity.documentationUrl,
      securityVulnerabilities: entity.securityVulnerabilities,
      supportStatus: entity.supportStatus as AsyncApiTechRadar['supportStatus'],
      businessCriticality: entity.businessCriticality as AsyncApiTechRadar['businessCriticality'],
      performanceImpact: entity.performanceImpact as AsyncApiTechRadar['performanceImpact'],
      costFactor: entity.costFactor as AsyncApiTechRadar['costFactor'],
      vendorLockIn: entity.vendorLockIn,
      versionToUpdate: entity.versionToUpdate,
      versionUpdateDeadline: entity.versionUpdateDeadline,
      endOfLifeDate: entity.endOfLifeDate,
      createdAt: entity.createdAt?.toISOString(),
      updatedAt: entity.updatedAt?.toISOString()
    };
  }

  /**
   * Проверка подключения к RabbitMQ
   */
  async checkConnection(): Promise<boolean> {
    return this.rabbitMQService.checkConnection();
  }

  /**
   * Получение статуса сервиса
   */
  getStatus(): {
    isInitialized: boolean;
    rabbitMQ: any;
  } {
    return {
      isInitialized: this.isInitialized,
      rabbitMQ: this.rabbitMQService.getStatus()
    };
  }

  /**
   * Закрытие соединения
   */
  async close(): Promise<void> {
    await this.rabbitMQService.close();
    this.isInitialized = false;
  }
}
