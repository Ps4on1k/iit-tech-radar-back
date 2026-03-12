/**
 * Тесты для RabbitMQConsumerService
 * Проверяют обработку сообщений от Qwen Agent
 */

import { RabbitMQConsumerService } from '../../services/RabbitMQConsumerService';
import { AuditService } from '../../services/AuditService';
import { AppDataSource } from '../../database';
import { TechRadarEntity } from '../../models/TechRadarEntity';
import { UpdateResponse } from '../../types/asyncapi';

describe('RabbitMQConsumerService', () => {
  let consumerService: RabbitMQConsumerService;
  let auditService: AuditService;

  beforeAll(async () => {
    // Инициализация БД для тестов
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(() => {
    auditService = new AuditService();
    consumerService = new RabbitMQConsumerService(auditService);
  });

  afterEach(async () => {
    await consumerService.close();
  });

  describe('Обработка сообщений', () => {
    it('должен обновить сущность по ID', async () => {
      // Создаем тестовую сущность
      const repo = AppDataSource.getRepository(TechRadarEntity);
      const testEntity = repo.create({
        name: 'Test Technology',
        version: '1.0.0',
        type: 'framework',
        category: 'adopt',
        owner: 'Test Owner',
        maturity: 'active',
        riskLevel: 'low',
        license: 'MIT',
        supportStatus: 'active',
        businessCriticality: 'high',
        vendorLockIn: false,
        firstAdded: '2024-01-01',
        lastUpdated: '2024-01-01'
      });
      const saved = await repo.save(testEntity);

      // Сообщение с обновлением
      const response: UpdateResponse = {
        correlationId: 'test-correlation-id',
        technologyId: saved.id,
        status: 'success',
        updatedFields: {
          version: '2.0.0',
          maturity: 'stable'
        },
        failedFields: [],
        aiMessage: 'Updated by AI',
        processingTimeMs: 100,
        sources: ['Qwen AI']
      };

      // Проверяем что сущность обновилась
      const updated = await repo.findOne({ where: { id: saved.id } });
      expect(updated).toBeTruthy();
      expect(updated?.version).toBe('1.0.0'); // Еще не обновлено

      // TODO: После реализации метода applyMessageUpdates добавить тест
      await repo.delete(saved.id);
    });

    it('должен создать новую сущность если нет ID и нет совпадения по name+version', async () => {
      const repo = AppDataSource.getRepository(TechRadarEntity);

      const response: UpdateResponse = {
        correlationId: 'test-correlation-id-2',
        technologyId: '00000000-0000-0000-0000-000000000000',
        status: 'success',
        updatedFields: {
          name: 'New Technology',
          version: '1.0.0',
          type: 'library',
          category: 'trial',
          description: 'Test description'
        },
        failedFields: [],
        aiMessage: 'Created by AI',
        processingTimeMs: 100,
        sources: ['Qwen AI']
      };

      // TODO: После реализации метода applyMessageUpdates добавить тест
    });

    it('должен обновить сущность по name+version если нет ID', async () => {
      const repo = AppDataSource.getRepository(TechRadarEntity);

      // Создаем тестовую сущность
      const testEntity = repo.create({
        name: 'Match Technology',
        version: '3.0.0',
        type: 'tool',
        category: 'assess',
        owner: 'Test Owner',
        maturity: 'active',
        riskLevel: 'medium',
        license: 'Apache-2.0',
        supportStatus: 'active',
        businessCriticality: 'medium',
        vendorLockIn: false,
        firstAdded: '2024-01-01',
        lastUpdated: '2024-01-01'
      });
      const saved = await repo.save(testEntity);

      const response: UpdateResponse = {
        correlationId: 'test-correlation-id-3',
        technologyId: '00000000-0000-0000-0000-000000000000',
        status: 'success',
        updatedFields: {
          name: 'Match Technology',
          version: '3.0.0',
          maturity: 'stable',
          riskLevel: 'low'
        },
        failedFields: [],
        aiMessage: 'Matched by name+version',
        processingTimeMs: 100,
        sources: ['Qwen AI']
      };

      // TODO: После реализации метода applyMessageUpdates добавить тест
      await repo.delete(saved.id);
    });
  });

  describe('Фильтрация полей', () => {
    it('должен фильтровать недопустимые поля', () => {
      // Приватный метод, нужен тест через публичный API
      // TODO: Добавить тест после рефакторинга
    });
  });
});
