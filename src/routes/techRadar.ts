import { Router } from 'express';
import { TechRadarController } from '../controllers/TechRadarController';
import { optionalAuth, authenticate, isAdmin, isManagerOrAdmin } from '../middleware/auth';
import { apiLimiter, techRadarWriteLimiter } from '../middleware/rateLimiter';

const router = Router();
const controller = new TechRadarController();

// Публичные эндпоинты (с опциональной аутентификацией) - только чтение
router.get('/', apiLimiter, optionalAuth, controller.getAll.bind(controller));
router.get('/filtered', apiLimiter, optionalAuth, controller.getFiltered.bind(controller));
router.get('/search', apiLimiter, optionalAuth, controller.search.bind(controller));
router.get('/statistics', apiLimiter, optionalAuth, controller.getStatistics.bind(controller));
router.get('/category/:category', apiLimiter, optionalAuth, controller.getByCategory.bind(controller));
router.get('/type/:type', apiLimiter, optionalAuth, controller.getByType.bind(controller));

// Эндпоинт для просмотра технологии - доступен всем аутентифицированным
router.get('/:id', apiLimiter, authenticate, controller.getById.bind(controller));

// Эндпоинты для администраторов и менеджеров - CRUD операции
router.post('/', apiLimiter, techRadarWriteLimiter, authenticate, isManagerOrAdmin, controller.create.bind(controller));
router.put('/:id', apiLimiter, techRadarWriteLimiter, authenticate, isManagerOrAdmin, controller.update.bind(controller));
router.delete('/:id', apiLimiter, techRadarWriteLimiter, authenticate, isManagerOrAdmin, controller.delete.bind(controller));

export default router;
