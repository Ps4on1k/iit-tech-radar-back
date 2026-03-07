import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new DashboardController();

// Все эндпоинты дашбордов требуют аутентификации
router.use(authenticate);

// Все метрики дашборда
router.get('/metrics', apiLimiter, controller.getMetrics);

// Метрики здоровья стека (для обратной совместимости)
router.get('/health', apiLimiter, controller.getStackHealth);

export default router;
