import { Router } from 'express';
import { TechRadarController } from '../controllers/TechRadarController';
import { optionalAuth, authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const controller = new TechRadarController();

// Публичные эндпоинты (с опциональной аутентификацией) - только чтение
router.get('/', optionalAuth, controller.getAll.bind(controller));
router.get('/filtered', optionalAuth, controller.getFiltered.bind(controller));
router.get('/search', optionalAuth, controller.search.bind(controller));
router.get('/statistics', optionalAuth, controller.getStatistics.bind(controller));
router.get('/category/:category', optionalAuth, controller.getByCategory.bind(controller));
router.get('/type/:type', optionalAuth, controller.getByType.bind(controller));

// Эндпоинты только для администратора - CRUD операции
router.get('/:id', authenticate, isAdmin, controller.getById.bind(controller));
router.post('/', authenticate, isAdmin, controller.create.bind(controller));
router.put('/:id', authenticate, isAdmin, controller.update.bind(controller));
router.delete('/:id', authenticate, isAdmin, controller.delete.bind(controller));

export default router;
