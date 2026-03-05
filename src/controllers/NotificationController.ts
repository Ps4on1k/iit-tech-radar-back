import { Request, Response } from 'express';
import { notificationService } from '../services/NotificationService';

export class NotificationController {
  /**
   * Получить уведомления пользователя
   * GET /api/notifications
   */
  getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const isRead = req.query.isRead 
        ? req.query.isRead === 'true' 
        : undefined;

      const notifications = await notificationService.getUserNotifications(userId, limit, isRead);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({
        notifications,
        unreadCount,
        total: notifications.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при получении уведомлений: ${error.message}` });
    }
  };

  /**
   * Отметить уведомление как прочитанное
   * PUT /api/notifications/:id/read
   */
  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;
      const id = String(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      const notification = await notificationService.markAsRead(id);

      if (!notification) {
        res.status(404).json({ error: 'Уведомление не найдено' });
        return;
      }

      if (notification.userId !== userId) {
        res.status(403).json({ error: 'Доступ запрещен' });
        return;
      }

      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при отметке уведомления: ${error.message}` });
    }
  };

  /**
   * Отметить все уведомления как прочитанные
   * PUT /api/notifications/read-all
   */
  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      await notificationService.markAllAsRead(userId);
      res.json({ message: 'Все уведомления отмечены как прочитанные' });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при отметке уведомлений: ${error.message}` });
    }
  };

  /**
   * Получить количество непрочитанных уведомлений
   * GET /api/notifications/unread-count
   */
  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      const count = await notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при получении количества: ${error.message}` });
    }
  };

  /**
   * Удалить уведомление
   * DELETE /api/notifications/:id
   */
  deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;
      const id = String(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      const deleted = await notificationService.deleteNotification(id);

      if (!deleted) {
        res.status(404).json({ error: 'Уведомление не найдено' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при удалении уведомления: ${error.message}` });
    }
  };

  /**
   * Удалить все прочитанные уведомления
   * DELETE /api/notifications/read
   */
  deleteReadNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      await notificationService.deleteReadNotifications(userId);
      res.json({ message: 'Все прочитанные уведомления удалены' });
    } catch (error: any) {
      res.status(500).json({ error: `Ошибка при удалении уведомлений: ${error.message}` });
    }
  };
}
