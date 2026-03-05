import { NotificationService, CreateNotificationDto } from '../../services/NotificationService';
import { NotificationEntity, NotificationType, NotificationCategory } from '../../models/NotificationEntity';
import { NotificationRepository } from '../../repositories/NotificationRepository';

// Mock для NotificationRepository
jest.mock('../../repositories/NotificationRepository', () => ({
  NotificationRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findByUserId: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
    getUnreadCount: jest.fn(),
  })),
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
      getUnreadCount: jest.fn(),
    };
    (NotificationRepository as jest.Mock).mockImplementation(() => mockRepository);
    notificationService = new NotificationService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('должен создавать уведомление с правильными параметрами', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test Title',
        message: 'Test Message',
        type: 'info',
        category: 'system',
      };

      const mockNotification = { id: '1', ...dto, isRead: false };
      mockRepository.create.mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Test Title',
        message: 'Test Message',
        type: 'info',
        category: 'system',
        actionUrl: undefined,
        metadata: undefined,
        isRead: false,
      });
      expect(result).toEqual(mockNotification);
    });

    it('должен использовать значения по умолчанию для type и category', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test',
      };

      mockRepository.create.mockResolvedValue({ id: '1', ...dto });

      await notificationService.createNotification(dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Test',
        message: 'Test',
        type: 'info',
        category: 'system',
        actionUrl: undefined,
        metadata: undefined,
        isRead: false,
      });
    });

    it('должен создавать уведомление с actionUrl и metadata', async () => {
      const dto: CreateNotificationDto = {
        userId: 'user-123',
        title: 'Test',
        message: 'Test',
        actionUrl: '/tech-radar/123',
        metadata: { techId: '123' },
      };

      mockRepository.create.mockResolvedValue({ id: '1', ...dto });

      await notificationService.createNotification(dto);

      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        actionUrl: '/tech-radar/123',
        metadata: { techId: '123' },
      }));
    });
  });

  describe('notifyTechRadarChange', () => {
    it('должен создавать уведомление о создании технологии', async () => {
      mockRepository.create.mockResolvedValue({ id: '1' });

      await notificationService.notifyTechRadarChange(
        'user-123',
        'CREATE',
        'React',
        'tech-123'
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Технология создана',
        message: 'Технология "React" была создана',
        type: 'success',
        category: 'tech-radar',
        actionUrl: '/tech-radar/tech-123',
        metadata: { techId: 'tech-123', action: 'CREATE' },
        isRead: false,
      });
    });

    it('должен создавать уведомление об обновлении технологии', async () => {
      mockRepository.create.mockResolvedValue({ id: '1' });

      await notificationService.notifyTechRadarChange(
        'user-123',
        'UPDATE',
        'Angular',
        'tech-456'
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Технология обновлена',
        message: 'Технология "Angular" была обновлена',
        type: 'success',
        category: 'tech-radar',
        actionUrl: '/tech-radar/tech-456',
        metadata: { techId: 'tech-456', action: 'UPDATE' },
        isRead: false,
      });
    });

    it('должен создавать уведомление об удалении технологии', async () => {
      mockRepository.create.mockResolvedValue({ id: '1' });

      await notificationService.notifyTechRadarChange(
        'user-123',
        'DELETE',
        'Vue',
        'tech-789'
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Технология удалена',
        message: 'Технология "Vue" была удалена',
        type: 'warning',
        category: 'tech-radar',
        actionUrl: '/tech-radar/tech-789',
        metadata: { techId: 'tech-789', action: 'DELETE' },
        isRead: false,
      });
    });
  });

  describe('notifyImport', () => {
    it('должен создавать уведомление об успешном импорте', async () => {
      mockRepository.create.mockResolvedValue({ id: '1' });

      await notificationService.notifyImport('user-123', true, 50);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Импорт завершен',
        message: 'Успешно импортировано 50 записей',
        type: 'success',
        category: 'import',
        metadata: { imported: 50, success: true, errors: undefined },
        isRead: false,
      });
    });

    it('должен создавать уведомление об ошибке импорта', async () => {
      mockRepository.create.mockResolvedValue({ id: '1' });
      const errors = ['Error 1', 'Error 2'];

      await notificationService.notifyImport('user-123', false, 10, errors);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId: 'user-123',
        title: 'Ошибка импорта',
        message: 'Импорт завершен с ошибками: Error 1, Error 2',
        type: 'error',
        category: 'import',
        metadata: { imported: 10, success: false, errors },
        isRead: false,
      });
    });
  });

  describe('getUserNotifications', () => {
    it('должен возвращать уведомления пользователя', async () => {
      const mockNotifications = [
        { id: '1', title: 'Notification 1' },
        { id: '2', title: 'Notification 2' },
      ];
      mockRepository.findByUserId.mockResolvedValue(mockNotifications);

      const result = await notificationService.getUserNotifications('user-123', 50);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', 50, undefined);
      expect(result).toEqual(mockNotifications);
    });

    it('должен фильтровать по isRead', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      await notificationService.getUserNotifications('user-123', 30, true);

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', 30, true);
    });

    it('должен использовать limit по умолчанию 50', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      await notificationService.getUserNotifications('user-123');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', 50, undefined);
    });
  });

  describe('markAsRead', () => {
    it('должен отмечать уведомление как прочитанное', async () => {
      const mockNotification = { id: '1', isRead: true };
      mockRepository.markAsRead.mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead('1');

      expect(mockRepository.markAsRead).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('должен отмечать все уведомления как прочитанные', async () => {
      mockRepository.markAllAsRead.mockResolvedValue(undefined);

      await notificationService.markAllAsRead('user-123');

      expect(mockRepository.markAllAsRead).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getUnreadCount', () => {
    it('должен возвращать количество непрочитанных уведомлений', async () => {
      mockRepository.getUnreadCount.mockResolvedValue(5);

      const result = await notificationService.getUnreadCount('user-123');

      expect(mockRepository.getUnreadCount).toHaveBeenCalledWith('user-123');
      expect(result).toBe(5);
    });
  });

  describe('deleteNotification', () => {
    it('должен удалять уведомление', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await notificationService.deleteNotification('1');

      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });
  });

  describe('deleteReadNotifications', () => {
    it('должен удалять все прочитанные уведомления пользователя', async () => {
      const readNotifications = [
        { id: '1', isRead: true },
        { id: '2', isRead: true },
      ];
      mockRepository.findByUserId.mockResolvedValue(readNotifications);
      mockRepository.delete.mockResolvedValue(true);

      await notificationService.deleteReadNotifications('user-123');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', 1000, true);
      expect(mockRepository.delete).toHaveBeenCalledTimes(2);
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('2');
    });

    it('должен работать если нет прочитанных уведомлений', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      await notificationService.deleteReadNotifications('user-123');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123', 1000, true);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
