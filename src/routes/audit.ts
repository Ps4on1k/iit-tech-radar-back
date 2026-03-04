import { Router } from 'express';
import { AuditController } from '../controllers/AuditController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const controller = new AuditController();

// Все эндпоинты требуют аутентификации и роли admin
router.use(authenticate, isAdmin);

// Получить аудит логи с пагинацией и фильтрацией
router.get('/', controller.getLogs.bind(controller));

// Получить детали конкретного лога
router.get('/:id', controller.getLogById.bind(controller));

// Получить статистику по аудит логам
router.get('/statistics', controller.getStatistics.bind(controller));

export default router;
