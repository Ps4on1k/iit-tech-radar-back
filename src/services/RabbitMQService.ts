/**
 * RabbitMQ Service для TechRadar Backend
 * Сервис для подключения и обмена сообщениями с Qwen Agent через RabbitMQ
 */

import amqp, { Channel, ConsumeMessage, ChannelModel } from 'amqplib';
import { logger } from '../utils/logger';
import {
  UpdateRequest,
  UpdateResponse,
  BulkUpdateRequest,
  BulkUpdateResponse,
  RequestMessage,
  ResponseMessage
} from '../types/asyncapi';

export interface RabbitMQConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost?: string;
  requestQueue: string;
  responseQueue: string;
}

export type ResponseMessageHandler = (response: UpdateResponse | BulkUpdateResponse, correlationId: string) => Promise<void>;

/**
 * Сервис для подключения и работы с RabbitMQ
 */
export class RabbitMQService {
  private config: RabbitMQConfig;
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private isConnected: boolean = false;
  private isConsuming: boolean = false;
  private pendingResponses: Map<string, {
    resolve: (response: UpdateResponse | BulkUpdateResponse) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  /**
   * Подключение к RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      const url = `amqp://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.vhost || ''}`;

      logger.info('[RabbitMQ] Подключение к:', {
        host: this.config.host,
        port: this.config.port,
        vhost: this.config.vhost || '/'
      });

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Обработчики событий
      this.connection.on('error', (err: Error) => {
        logger.error('[RabbitMQ] Ошибка соединения:', { error: err.message });
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logger.warn('[RabbitMQ] Соединение закрыто');
        this.isConnected = false;
      });

      // Настройка очередей
      await this.setupQueues();

      this.isConnected = true;
      logger.info('[RabbitMQ] Успешное подключение');
    } catch (error: any) {
      logger.error('[RabbitMQ] Ошибка подключения:', { error: error?.message || error });
      throw error;
    }
  }

  /**
   * Настройка очередей
   */
  private async setupQueues(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel не инициализирован');
    }

    // Основная очередь запросов
    await this.channel.assertQueue(this.config.requestQueue, {
      durable: true,
      autoDelete: false,
      exclusive: false,
      arguments: {
        'x-message-ttl': 300000, // 5 минут
        'x-dead-letter-exchange': 'techradar.dlx',
        'x-dead-letter-routing-key': 'requests.dlq'
      }
    });

    // Основная очередь ответов
    await this.channel.assertQueue(this.config.responseQueue, {
      durable: true,
      autoDelete: false,
      exclusive: false,
      arguments: {
        'x-message-ttl': 300000, // 5 минут
        'x-dead-letter-exchange': 'techradar.dlx',
        'x-dead-letter-routing-key': 'responses.dlq'
      }
    });

    // Dead Letter Exchange
    await this.channel.assertExchange('techradar.dlx', 'direct', {
      durable: true
    });

    // Dead Letter Queues
    await this.channel.assertQueue('techradar.requests.dlq', {
      durable: true,
      autoDelete: false
    });

    await this.channel.assertQueue('techradar.responses.dlq', {
      durable: true,
      autoDelete: false
    });

    // Привязка DLQ к exchange
    await this.channel.bindQueue('techradar.requests.dlq', 'techradar.dlx', 'requests.dlq');
    await this.channel.bindQueue('techradar.responses.dlq', 'techradar.dlx', 'responses.dlq');

    logger.info('[RabbitMQ] Очереди настроены', {
      requestQueue: this.config.requestQueue,
      responseQueue: this.config.responseQueue,
      dlx: 'techradar.dlx'
    });
  }

  /**
   * Подписка на очередь ответов
   */
  async subscribeToResponses(handler: ResponseMessageHandler): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel не инициализирован');
    }

    if (this.isConsuming) {
      logger.warn('[RabbitMQ] Уже подписан на очередь ответов');
      return;
    }

    logger.info('[RabbitMQ] Подписка на очередь ответов:', this.config.responseQueue);

    await this.channel.consume(
      this.config.responseQueue,
      async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(msg.content.toString());
          const correlationId = msg.properties.correlationId;

          logger.info('[RabbitMQ] Получен ответ:', {
            correlationId,
            status: content.status,
            timestamp: new Date().toISOString()
          });

          // Проверяем, есть ли ожидающий запрос
          const pending = this.pendingResponses.get(correlationId);
          if (pending) {
            // Разрешаем ожидающий промис
            pending.resolve(content);
            this.pendingResponses.delete(correlationId);
          }

          // Вызываем обработчик для фоновой обработки
          await handler(content, correlationId);

          // Подтверждение получения
          if (this.channel) {
            this.channel.ack(msg);
          }
        } catch (error: any) {
          logger.error('[RabbitMQ] Ошибка обработки ответа:', { error: error?.message || error });

          // Отправляем в DLQ при ошибке
          if (this.channel) {
            this.channel.nack(msg, false, false);
          }
        }
      },
      {
        noAck: false
      }
    );

    this.isConsuming = true;
    logger.info('[RabbitMQ] Подписка на ответы активна');
  }

  /**
   * Отправка запроса в очередь запросов
   */
  async sendRequest(request: UpdateRequest | BulkUpdateRequest): Promise<string> {
    if (!this.channel) {
      throw new Error('Channel не инициализирован');
    }

    const correlationId = this.generateCorrelationId();
    const message = {
      ...request,
      correlationId
    };

    const buffer = Buffer.from(JSON.stringify(message));

    // Определяем приоритет для единичных запросов
    const priority = 'priority' in request && request.priority 
      ? (request.priority === 'critical' ? 10 : request.priority === 'high' ? 7 : 5)
      : 5;

    await this.channel.sendToQueue(
      this.config.requestQueue,
      buffer,
      {
        correlationId,
        contentType: 'application/json',
        deliveryMode: 2, // persistent
        timestamp: Date.now(),
        priority,
        headers: {
          messageType: 'requests' in request ? 'bulk' : 'single'
        }
      }
    );

    logger.info('[RabbitMQ] Запрос отправлен:', {
      correlationId,
      queue: this.config.requestQueue,
      type: 'requests' in request ? 'bulk' : 'single'
    });

    return correlationId;
  }

  /**
   * Отправка запроса и ожидание ответа
   */
  async sendRequestAndWait(request: UpdateRequest | BulkUpdateRequest, timeoutMs: number = 60000): Promise<UpdateResponse | BulkUpdateResponse> {
    const correlationId = await this.sendRequest(request);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(correlationId);
        reject(new Error(`Timeout waiting for response. Correlation ID: ${correlationId}`));
      }, timeoutMs);

      this.pendingResponses.set(correlationId, { resolve, reject, timeout });
    });
  }

  /**
   * Проверка подключения
   */
  async checkConnection(): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      return false;
    }

    try {
      await this.channel.checkQueue(this.config.requestQueue);
      return true;
    } catch (error: any) {
      logger.error('[RabbitMQ] Ошибка проверки подключения:', { error: error?.message || error });
      return false;
    }
  }

  /**
   * Переподключение
   */
  async reconnect(): Promise<void> {
    logger.info('[RabbitMQ] Попытка переподключения...');

    try {
      await this.close();
      await this.connect();
      logger.info('[RabbitMQ] Успешное переподключение');
    } catch (error: any) {
      logger.error('[RabbitMQ] Ошибка переподключения:', { error: error?.message || error });
      throw error;
    }
  }

  /**
   * Закрытие соединения
   */
  async close(): Promise<void> {
    try {
      // Отменяем все ожидающие запросы
      for (const [correlationId, pending] of this.pendingResponses.entries()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error('RabbitMQ connection closed'));
      }
      this.pendingResponses.clear();

      this.isConsuming = false;

      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.isConnected = false;
      logger.info('[RabbitMQ] Соединение закрыто');
    } catch (error: any) {
      logger.error('[RabbitMQ] Ошибка закрытия:', { error: error?.message || error });
    }
  }

  /**
   * Генерация correlationId
   */
  private generateCorrelationId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Получение статуса
   */
  getStatus(): {
    isConnected: boolean;
    isConsuming: boolean;
    requestQueue: string;
    responseQueue: string;
    pendingRequests: number;
  } {
    return {
      isConnected: this.isConnected,
      isConsuming: this.isConsuming,
      requestQueue: this.config.requestQueue,
      responseQueue: this.config.responseQueue,
      pendingRequests: this.pendingResponses.size
    };
  }
}
