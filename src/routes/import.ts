import { Router } from 'express';
import { ImportController } from '../controllers/ImportController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const controller = new ImportController();

// Все эндпоинты требуют аутентификации и роли admin
router.use(authenticate, isAdmin);

// Импорт технологий
router.post('/tech-radar', controller.importTechRadar.bind(controller));

// Экспорт технологий
router.get('/tech-radar', controller.exportTechRadar.bind(controller));

// Валидация данных перед импортом
router.post('/tech-radar/validate', controller.validateImport.bind(controller));

export default router;
