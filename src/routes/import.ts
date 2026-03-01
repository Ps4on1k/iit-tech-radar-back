import { Router } from 'express';
import { ImportController } from '../controllers/ImportController';
import { authenticate, isManagerOrAdmin } from '../middleware/auth';

const router = Router();
const controller = new ImportController();

// Все эндпоинты требуют аутентификации и роли admin/manager
router.use(authenticate, isManagerOrAdmin);

// Импорт технологий
router.post('/tech-radar', controller.importTechRadar.bind(controller));

// Экспорт технологий
router.get('/tech-radar', controller.exportTechRadar.bind(controller));

// Валидация данных перед импортом
router.post('/tech-radar/validate', controller.validateImport.bind(controller));

export default router;
