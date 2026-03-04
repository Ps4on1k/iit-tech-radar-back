import { Router } from 'express';
import { ImportController } from '../controllers/ImportController';
import { authenticate, isManagerOrAdmin } from '../middleware/auth';
import { importLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new ImportController();

// Все эндпоинты требуют аутентификации и роли admin/manager
router.use(authenticate, isManagerOrAdmin);

// Импорт технологий (строгий лимит)
router.post('/tech-radar', importLimiter, controller.importTechRadar.bind(controller));

// Экспорт технологий
router.get('/tech-radar', controller.exportTechRadar.bind(controller));

// Валидация данных перед импортом (строгий лимит)
router.post('/tech-radar/validate', importLimiter, controller.validateImport.bind(controller));

export default router;
