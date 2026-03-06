import { NotificationRepository, INotificationRepository } from '../repositories/NotificationRepository';
import { NotificationEntity, NotificationType, NotificationCategory } from '../models/NotificationEntity';

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Сервис уведомлений
 */
export class NotificationService {
  private repository: INotificationRepository;

  constructor() {
    this.repository = new NotificationRepository();
  }

  /**
   * Создать уведомление
   */
  async createNotification(dto: CreateNotificationDto): Promise<NotificationEntity> {
    return this.repository.create({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'info',
      category: dto.category || 'system',
      actionUrl: dto.actionUrl,
      metadata: dto.metadata,
      isRead: false,
    });
  }

  /**
   * Создать уведомление о изменении технологии
   * Отправляет уведомление всем администраторам и менеджерам
   */
  async notifyTechRadarChange(
    userId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    techName: string,
    techId: string
  ): Promise<void> {
    const actionLabels = {
      CREATE: 'создана',
      UPDATE: 'обновлена',
      DELETE: 'удалена',
    };

    // Получаем всех администраторов и менеджеров
    const { DatabaseUserRepository } = await import('./UserRepository');
    const userRepository = new DatabaseUserRepository();
    const users = await userRepository.getAdminsAndManagers();

    // Создаём уведомление для каждого
    for (const user of users) {
      await this.createNotification({
        userId: user.id,
        title: `Технология ${actionLabels[action]}`,
        message: `Технология "${techName}" была ${actionLabels[action].toLowerCase()}`,
        type: action === 'DELETE' ? 'warning' : 'success',
        category: 'tech-radar',
        actionUrl: `/tech-radar/${techId}`,
        metadata: { techId, action },
      });
    }
  }

  /**
   * Создать уведомление об импорте
   */
  async notifyImport(
    userId: string,
    success: boolean,
    imported: number,
    errors?: string[]
  ): Promise<NotificationEntity> {
    return this.createNotification({
      userId,
      title: success ? 'Импорт завершен' : 'Ошибка импорта',
      message: success 
        ? `Успешно импортировано ${imported} записей`
        : `Импорт завершен с ошибками: ${errors?.join(', ')}`,
      type: success ? 'success' : 'error',
      category: 'import',
      metadata: { imported, success, errors },
    });
  }

  /**
   * Получить уведомления пользователя
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    isRead?: boolean
  ): Promise<NotificationEntity[]> {
    return this.repository.findByUserId(userId, limit, isRead);
  }

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(id: string): Promise<NotificationEntity | undefined> {
    return this.repository.markAsRead(id);
  }

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead(userId: string): Promise<void> {
    return this.repository.markAllAsRead(userId);
  }

  /**
   * Получить количество непрочитанных уведомлений
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.getUnreadCount(userId);
  }

  /**
   * Удалить уведомление
   */
  async deleteNotification(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }

  /**
   * Удалить все прочитанные уведомления пользователя
   */
  async deleteReadNotifications(userId: string): Promise<void> {
    const notifications = await this.repository.findByUserId(userId, 1000, true);
    for (const notification of notifications) {
      await this.repository.delete(notification.id);
    }
  }
}

// Ленивая инициализация сервиса
let _notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!_notificationService) {
    _notificationService = new NotificationService();
  }
  return _notificationService;
}

// Для обратной совместимости (но не используем напрямую в контроллерах)
export const notificationService = {
  notifyTechRadarChange: (userId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', techName: string, techId: string) => {
    getNotificationService().notifyTechRadarChange(userId, action, techName, techId)
      .catch(err => console.error('Failed to send TechRadar notification:', err));
  },
  notifyImport: (userId: string, success: boolean, imported: number, errors?: string[]) => {
    getNotificationService().notifyImport(userId, success, imported, errors)
      .catch(err => console.error('Failed to send Import notification:', err));
  },
};
