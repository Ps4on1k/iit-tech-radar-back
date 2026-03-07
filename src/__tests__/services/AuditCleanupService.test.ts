import { AuditCleanupService } from '../../services/AuditCleanupService';
import { AuditLogEntity } from '../../models/AuditLogEntity';

// Моки для TypeORM
const mockQueryBuilder = {
  delete: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  execute: jest.fn(),
};

const mockRepository = {
  count: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  save: jest.fn(),
};

jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: () => mockRepository,
  },
}));

describe('AuditCleanupService', () => {
  let cleanupService: AuditCleanupService;

  beforeEach(() => {
    jest.clearAllMocks();
    cleanupService = new AuditCleanupService();
  });

  describe('getCutoffDate', () => {
    it('должен возвращать дату 14 дней назад', () => {
      const cutoffDate = cleanupService.getCutoffDate();
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 14);

      expect(cutoffDate.getDate()).toBeCloseTo(expectedDate.getDate(), 0);
      expect(cutoffDate.getMonth()).toBe(expectedDate.getMonth());
      expect(cutoffDate.getFullYear()).toBe(expectedDate.getFullYear());
    });
  });

  describe('cleanup', () => {
    it('должен возвращать 0 если нет старых записей', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await cleanupService.cleanup();

      expect(result).toBe(0);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('должен удалять старые записи и создавать запись об очистке', async () => {
      mockRepository.count.mockResolvedValue(50);
      mockQueryBuilder.execute.mockResolvedValue({ affected: 50 });
      mockRepository.save.mockResolvedValue({});

      const result = await cleanupService.cleanup();

      expect(result).toBe(50);
      expect(mockRepository.count).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'AUDIT_CLEANUP',
          entity: 'Audit',
          status: 'SUCCESS',
        })
      );
    });

    it('должен создавать запись об ошибке при неудаче', async () => {
      mockRepository.count.mockResolvedValue(50);
      mockQueryBuilder.execute.mockRejectedValue(new Error('DB error'));

      await expect(cleanupService.cleanup()).rejects.toThrow('DB error');

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'AUDIT_CLEANUP',
          entity: 'Audit',
          status: 'FAILURE',
        })
      );
    });
  });
});
