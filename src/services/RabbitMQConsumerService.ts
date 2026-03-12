/**
 * RabbitMQ Consumer Service
 * Сервис для получения и обработки сообщений от Qwen Agent через RabbitMQ
 * 
 * Обработка сообщений:
 * - Если есть id - обновляется сущность технологии (только параметры из сообщения)
 * - Если нет id - сверяется по паре name+version, при совпадении - обновление
 * - Если нет id и нет совпадения - создается новая сущность
 */

import { Repository } from 'typeorm';
import { TechRadarEntity } from '../models/TechRadarEntity';
import { AuditService } from './AuditService';
import { logger } from '../utils/logger';
import { AppDataSource } from '../database';
import { RabbitMQService } from './RabbitMQService';
import { UpdateResponse, BulkUpdateResponse } from '../types/asyncapi';

export interface ConsumerResult {
  success: boolean;
  technologyId: string;
  action: 'updated' | 'created' | 'error';
  message?: string;
}

/**
 * Сервис для получения и обработки сообщений от AI агента
 */
export class RabbitMQConsumerService {
  private techRadarRepository: Repository<TechRadarEntity> | null = null;
  private rabbitMQService: RabbitMQService;
  private isInitialized: boolean = false;
  private isConsuming: boolean = false;

  constructor(
    private auditService: AuditService
  ) {
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
   * Инициализация сервиса и создание очередей
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('[RabbitMQConsumer] Сервис уже инициализирован');
      return;
    }

    try {
      this.techRadarRepository = AppDataSource.getRepository(TechRadarEntity);

      // Подключение к RabbitMQ и создание очередей
      await this.rabbitMQService.connect();
      logger.info('[RabbitMQConsumer] Очереди созданы/проверены');

      this.isInitialized = true;
      logger.info('[RabbitMQConsumer] Сервис инициализирован');
    } catch (error: any) {
      logger.error('[RabbitMQConsumer] Ошибка инициализации:', { error: error?.message || error });
      throw error;
    }
  }

  /**
   * Запуск потребления сообщений из очереди ответов
   */
  async startConsuming(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isConsuming) {
      logger.warn('[RabbitMQConsumer] Уже потребляет сообщения');
      return;
    }

    await this.rabbitMQService.subscribeToResponses(
      async (response, correlationId) => {
        await this.handleMessage(response, correlationId);
      }
    );

    this.isConsuming = true;
    logger.info('[RabbitMQConsumer] Потребление сообщений запущено');
  }

  /**
   * Обработка сообщения от AI агента
   */
  private async handleMessage(
    response: UpdateResponse | BulkUpdateResponse,
    correlationId: string
  ): Promise<void> {
    logger.info('[RabbitMQConsumer] Получено сообщение:', {
      correlationId,
      status: response.status,
      type: 'results' in response ? 'bulk' : 'single'
    });

    // Проверяем тип ответа
    if ('results' in response) {
      // Массовый ответ - обрабатываем каждый результат
      const bulkResponse = response as BulkUpdateResponse;
      if (bulkResponse.results) {
        for (const result of bulkResponse.results) {
          if (result.response) {
            await this.handleSingleMessage(result.response, correlationId);
          }
        }
      }
      return;
    }

    // Единичный ответ
    await this.handleSingleMessage(response as UpdateResponse, correlationId);
  }

  /**
   * Обработка единичного сообщения
   */
  private async handleSingleMessage(
    response: UpdateResponse,
    correlationId: string
  ): Promise<void> {
    logger.info('[RabbitMQConsumer] Получено сообщение:', {
      correlationId,
      technologyId: response.technologyId,
      status: response.status
    });

    try {
      if (response.status === 'error') {
        logger.warn('[RabbitMQConsumer] Ошибка в сообщении от агента:', {
          correlationId,
          error: response.error
        });

        await this.auditService.logFailure({
          action: 'UPDATE',
          entity: 'TechRadar',
          entityId: response.technologyId || 'unknown',
          details: {
            correlationId,
            error: response.error,
            aiMessage: response.aiMessage
          }
        });

        return;
      }

      // Применяем обновления/создание
      const result = await this.applyMessageUpdates(response, correlationId);

      if (result.success) {
        await this.auditService.logSuccess({
          action: result.action === 'created' ? 'CREATE' : 'UPDATE',
          entity: 'TechRadar',
          entityId: result.technologyId,
          details: {
            correlationId,
            action: result.action,
            updatedFields: response.updatedFields,
            sources: response.sources,
            aiMessage: response.aiMessage
          }
        });
      } else {
        await this.auditService.logFailure({
          action: 'UPDATE',
          entity: 'TechRadar',
          entityId: result.technologyId,
          details: {
            correlationId,
            error: result.message
          }
        });
      }
    } catch (error: any) {
      logger.error('[RabbitMQConsumer] Ошибка обработки сообщения:', {
        correlationId,
        error: error?.message || error
      });

      await this.auditService.logFailure({
        action: 'UPDATE',
        entity: 'TechRadar',
        entityId: response.technologyId || 'unknown',
        details: {
          correlationId,
          error: error?.message || error
        }
      });
    }
  }

  /**
   * Применение обновлений из сообщения
   * Логика:
   * 1. Если есть id - обновляем сущность
   * 2. Если нет id - ищем по name+version
   *    - Если найдено - обновляем
   *    - Если не найдено - создаем новую
   */
  private async applyMessageUpdates(
    response: UpdateResponse,
    correlationId: string
  ): Promise<ConsumerResult> {
    if (!this.techRadarRepository) {
      throw new Error('Repository не инициализирован');
    }

    const { technologyId, updatedFields } = response;

    try {
      let entity: TechRadarEntity | null = null;
      let action: 'updated' | 'created' = 'updated';

      // Если есть ID - ищем по нему
      if (technologyId && technologyId !== '00000000-0000-0000-0000-000000000000') {
        entity = await this.techRadarRepository.findOne({
          where: { id: technologyId }
        });

        if (entity) {
          logger.info('[RabbitMQConsumer] Найдена сущность по ID:', { technologyId });
        }
      }

      // Если не нашли по ID, пробуем найти по name+version
      if (!entity && updatedFields.name && updatedFields.version) {
        entity = await this.techRadarRepository.findOne({
          where: {
            name: updatedFields.name,
            version: updatedFields.version
          }
        });

        if (entity) {
          logger.info('[RabbitMQConsumer] Найдена сущность по name+version:', {
            name: updatedFields.name,
            version: updatedFields.version
          });
        }
      }

      // Если нашли - обновляем
      if (entity) {
        const fieldsToUpdate = this.filterAllowedFields(updatedFields);
        Object.assign(entity, fieldsToUpdate);
        await this.techRadarRepository.save(entity);

        logger.info('[RabbitMQConsumer] Сущность обновлена:', {
          id: entity.id,
          fieldsCount: Object.keys(fieldsToUpdate).length
        });

        return {
          success: true,
          technologyId: entity.id,
          action: 'updated',
          message: `Обновлено полей: ${Object.keys(fieldsToUpdate).length}`
        };
      }

      // Если не нашли - создаем новую
      logger.info('[RabbitMQConsumer] Создание новой сущности...');

      const newEntity = this.techRadarRepository.create({
        ...this.filterAllowedFields(updatedFields),
        firstAdded: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      });

      const saved = await this.techRadarRepository.save(newEntity);

      logger.info('[RabbitMQConsumer] Сущность создана:', {
        id: saved.id,
        name: saved.name,
        version: saved.version
      });

      return {
        success: true,
        technologyId: saved.id,
        action: 'created',
        message: 'Сущность создана'
      };

    } catch (error: any) {
      logger.error('[RabbitMQConsumer] Ошибка применения обновлений:', {
        error: error?.message || error
      });

      return {
        success: false,
        technologyId: technologyId || 'unknown',
        action: 'error',
        message: error?.message || 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Фильтрация разрешенных полей для обновления
   */
  private filterAllowedFields(fields: Record<string, any>): Record<string, any> {
    const allowedFields: Array<keyof TechRadarEntity> = [
      'name',
      'version',
      'versionReleaseDate',
      'type',
      'subtype',
      'category',
      'description',
      'owner',
      'stakeholders',
      'maturity',
      'riskLevel',
      'license',
      'adoptionRate',
      'popularityIndex',
      'communitySize',
      'documentationUrl',
      'securityVulnerabilities',
      'supportStatus',
      'businessCriticality',
      'performanceImpact',
      'costFactor',
      'vendorLockIn',
      'versionToUpdate',
      'versionUpdateDeadline',
      'endOfLifeDate'
    ];

    const filtered: Record<string, any> = {};

    for (const [fieldName, value] of Object.entries(fields)) {
      if (allowedFields.includes(fieldName as keyof TechRadarEntity)) {
        filtered[fieldName] = value;
      } else {
        logger.debug('[RabbitMQConsumer] Поле отфильтровано:', { fieldName });
      }
    }

    return filtered;
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
    isConsuming: boolean;
    rabbitMQ: any;
  } {
    return {
      isInitialized: this.isInitialized,
      isConsuming: this.isConsuming,
      rabbitMQ: this.rabbitMQService.getStatus()
    };
  }

  /**
   * Закрытие соединения
   */
  async close(): Promise<void> {
    this.isConsuming = false;
    this.isInitialized = false;
    await this.rabbitMQService.close();
  }
}
