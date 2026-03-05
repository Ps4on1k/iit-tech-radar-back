import { AuditService, AuditAction, AuditEntity, AuditStatus } from '../../services/AuditService';
import { AppDataSource } from '../../database';
import { AuditLogEntity } from '../../models/AuditLogEntity';
import { Repository } from 'typeorm';
import { logger } from '../../utils/logger';

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// Mock для logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('AuditService', () => {
  let auditService: AuditService;
  let mockRepository: Partial<Repository<AuditLogEntity>>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);
    auditService = new AuditService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('должен создавать и сохранять audit log', async () => {
      const options = {
        userId: 'user-123',
        action: 'CREATE' as AuditAction,
        entity: 'TechRadar' as AuditEntity,
        entityId: 'tech-456',
        status: 'SUCCESS' as AuditStatus,
      };

      const mockLog = { id: '1', ...options, timestamp: new Date() };
      (mockRepository.create as jest.Mock).mockReturnValue(mockLog);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockLog);

      const result = await auditService.log(options);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'CREATE',
        entity: 'TechRadar',
        entityId: 'tech-456',
        ipAddress: undefined,
        details: undefined,
        status: 'SUCCESS',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockLog);
      expect(result).toEqual(mockLog);
    });

    it('должен логировать с дополнительными параметрами', async () => {
      const options = {
        userId: 'user-123',
        action: 'UPDATE' as AuditAction,
        entity: 'User' as AuditEntity,
        entityId: 'user-456',
        ipAddress: '192.168.1.1',
        details: { changedFields: ['email', 'name'] },
        status: 'SUCCESS' as AuditStatus,
      };

      const mockLog = { id: '1', ...options, details: JSON.stringify(options.details) };
      (mockRepository.create as jest.Mock).mockReturnValue(mockLog);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockLog);

      await auditService.log(options);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'UPDATE',
        entity: 'User',
        entityId: 'user-456',
        ipAddress: '192.168.1.1',
        details: JSON.stringify({ changedFields: ['email', 'name'] }),
        status: 'SUCCESS',
      });
    });

    it('должен обрабатывать ошибку сохранения', async () => {
      const options = {
        userId: 'user-123',
        action: 'CREATE' as AuditAction,
        entity: 'TechRadar' as AuditEntity,
        status: 'SUCCESS' as AuditStatus,
      };

      const mockLog = { id: '1', ...options };
      (mockRepository.create as jest.Mock).mockReturnValue(mockLog);
      (mockRepository.save as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await auditService.log(options);

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to save audit log to database',
        expect.any(Object)
      );
      expect(result).toEqual(mockLog);
    });
  });

  describe('logSuccess', () => {
    it('должен логировать успешную операцию', async () => {
      const options = {
        userId: 'user-123',
        action: 'LOGIN' as AuditAction,
        entity: 'Auth' as AuditEntity,
      };

      const mockLog = { ...options, status: 'SUCCESS' };
      (mockRepository.create as jest.Mock).mockReturnValue(mockLog);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockLog);

      await auditService.logSuccess(options);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...options,
        status: 'SUCCESS',
        ipAddress: undefined,
        details: undefined,
      });
    });
  });

  describe('logFailure', () => {
    it('должен логировать неудачную операцию', async () => {
      const options = {
        userId: 'user-123',
        action: 'LOGIN' as AuditAction,
        entity: 'Auth' as AuditEntity,
      };

      const mockLog = { ...options, status: 'FAILURE' };
      (mockRepository.create as jest.Mock).mockReturnValue(mockLog);
      (mockRepository.save as jest.Mock).mockResolvedValue(mockLog);

      await auditService.logFailure(options);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...options,
        status: 'FAILURE',
        ipAddress: undefined,
        details: undefined,
      });
    });
  });

  describe('getEntityHistory', () => {
    it('должен возвращать историю операций для сущности', async () => {
      const mockLogs = [
        { id: '1', action: 'CREATE', entity: 'TechRadar', entityId: 'tech-1' },
        { id: '2', action: 'UPDATE', entity: 'TechRadar', entityId: 'tech-1' },
      ];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditService.getEntityHistory('TechRadar' as AuditEntity, 'tech-1', 50);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { entity: 'TechRadar', entityId: 'tech-1' },
        order: { timestamp: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockLogs);
    });

    it('должен использовать limit по умолчанию 50', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([]);

      await auditService.getEntityHistory('TechRadar' as AuditEntity, 'tech-1');

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { entity: 'TechRadar', entityId: 'tech-1' },
        order: { timestamp: 'DESC' },
        take: 50,
      });
    });
  });

  describe('getUserHistory', () => {
    it('должен возвращать историю операций пользователя', async () => {
      const mockLogs = [
        { id: '1', action: 'CREATE', userId: 'user-123' },
        { id: '2', action: 'LOGIN', userId: 'user-123' },
      ];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditService.getUserHistory('user-123', 50);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { timestamp: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockLogs);
    });
  });

  describe('getRecent', () => {
    it('должен возвращать последние операции', async () => {
      const mockLogs = [
        { id: '1', action: 'CREATE' },
        { id: '2', action: 'UPDATE' },
      ];
      (mockRepository.find as jest.Mock).mockResolvedValue(mockLogs);

      const result = await auditService.getRecent(100);

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { timestamp: 'DESC' },
        take: 100,
      });
      expect(result).toEqual(mockLogs);
    });

    it('должен использовать limit по умолчанию 100', async () => {
      (mockRepository.find as jest.Mock).mockResolvedValue([]);

      await auditService.getRecent();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { timestamp: 'DESC' },
        take: 100,
      });
    });
  });

  describe('getLogs', () => {
    it('должен возвращать логи с пагинацией', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]),
        getCount: jest.fn().mockResolvedValue(100),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      const result = await auditService.getLogs({}, 1, 20);

      expect(result).toEqual({
        data: [{ id: '1' }, { id: '2' }],
        total: 100,
        page: 1,
        limit: 20,
        totalPages: 5,
      });
    });

    it('должен применять фильтры', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      await auditService.getLogs({
        userId: 'user-123',
        action: 'CREATE' as AuditAction,
        entity: 'TechRadar' as AuditEntity,
        status: 'SUCCESS' as AuditStatus,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(6);
    });

    it('должен использовать значения по умолчанию', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getCount: jest.fn().mockResolvedValue(0),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
      };
      (mockRepository.createQueryBuilder as jest.Mock).mockReturnValue(mockQueryBuilder);

      await auditService.getLogs();

      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });
  });
});
