import { NotificationRepository } from '../../repositories/NotificationRepository';
import { NotificationEntity } from '../../models/NotificationEntity';
import { AppDataSource } from '../../database';
import { Repository } from 'typeorm';

// Mock для AppDataSource
jest.mock('../../database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let mockTypeormRepository: Partial<Repository<NotificationEntity>>;

  beforeEach(() => {
    mockTypeormRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTypeormRepository);
    repository = new NotificationRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('должен находить уведомление по id', async () => {
      const mockNotification = { id: '1', title: 'Test' } as NotificationEntity;
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockNotification);

      const result = await repository.findById('1');

      expect(mockTypeormRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockNotification);
    });

    it('должен возвращать undefined если уведомление не найдено', async () => {
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('должен находить уведомления пользователя', async () => {
      const mockNotifications = [
        { id: '1', userId: 'user-123' },
        { id: '2', userId: 'user-123' },
      ] as NotificationEntity[];
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await repository.findByUserId('user-123', 50);

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockNotifications);
    });

    it('должен фильтровать по isRead', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      await repository.findByUserId('user-123', 50, true);

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: true },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    });

    it('должен использовать limit по умолчанию 50', async () => {
      (mockTypeormRepository.find as jest.Mock).mockResolvedValue([]);

      await repository.findByUserId('user-123');

      expect(mockTypeormRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    });
  });

  describe('create', () => {
    it('должен создавать уведомление', async () => {
      const data = { userId: 'user-123', title: 'Test', message: 'Test' };
      const mockNotification = { id: '1', ...data } as NotificationEntity;

      (mockTypeormRepository.create as jest.Mock).mockReturnValue(mockNotification);
      (mockTypeormRepository.save as jest.Mock).mockResolvedValue(mockNotification);

      const result = await repository.create(data);

      expect(mockTypeormRepository.create).toHaveBeenCalledWith(data);
      expect(mockTypeormRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAsRead', () => {
    it('должен отмечать уведомление как прочитанное', async () => {
      const mockNotification = { id: '1', isRead: true } as NotificationEntity;

      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(mockNotification);

      const result = await repository.markAsRead('1');

      expect(mockTypeormRepository.update).toHaveBeenCalledWith('1', { isRead: true });
      expect(result).toEqual(mockNotification);
    });

    it('должен возвращать undefined если уведомление не найдено', async () => {
      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 1 });
      (mockTypeormRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await repository.markAsRead('1');

      expect(result).toBeUndefined();
    });
  });

  describe('markAllAsRead', () => {
    it('должен отмечать все уведомления пользователя как прочитанные', async () => {
      (mockTypeormRepository.update as jest.Mock).mockResolvedValue({ affected: 5 });

      await repository.markAllAsRead('user-123');

      expect(mockTypeormRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', isRead: false },
        { isRead: true }
      );
    });
  });

  describe('delete', () => {
    it('должен возвращать true при успешном удалении', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await repository.delete('1');

      expect(result).toBe(true);
    });

    it('должен возвращать false если уведомление не найдено', async () => {
      (mockTypeormRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

      const result = await repository.delete('999');

      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('должен возвращать количество непрочитанных уведомлений', async () => {
      (mockTypeormRepository.count as jest.Mock).mockResolvedValue(5);

      const result = await repository.getUnreadCount('user-123');

      expect(mockTypeormRepository.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', isRead: false },
      });
      expect(result).toBe(5);
    });

    it('должен возвращать 0 если нет непрочитанных', async () => {
      (mockTypeormRepository.count as jest.Mock).mockResolvedValue(0);

      const result = await repository.getUnreadCount('user-123');

      expect(result).toBe(0);
    });
  });
});
