import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new NotificationController();

// Все routes требуют аутентификации
router.use(authenticate);

router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.put('/:id/read', controller.markAsRead);
router.put('/read-all', controller.markAllAsRead);
router.delete('/:id', controller.deleteNotification);
router.delete('/read', controller.deleteReadNotifications);

export default router;
