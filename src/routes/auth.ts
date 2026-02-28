import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();
const controller = new AuthController();

// Публичные эндпоинты
router.post('/login', controller.login.bind(controller));

// Защищенные эндпоинты
router.get('/me', authenticate, controller.me.bind(controller));

// Эндпоинты только для администратора
router.get('/users', authenticate, isAdmin, controller.getUsers.bind(controller));
router.get('/users/:id', authenticate, isAdmin, controller.getUserById.bind(controller));
router.post('/users', authenticate, isAdmin, controller.createUser.bind(controller));
router.put('/users/:id', authenticate, isAdmin, controller.updateUser.bind(controller));
router.delete('/users/:id', authenticate, isAdmin, controller.deleteUser.bind(controller));
router.post('/users/:id/password', authenticate, isAdmin, controller.setUserPassword.bind(controller));
router.post('/users/:id/toggle-status', authenticate, isAdmin, controller.toggleUserActive.bind(controller));

// Смена пароля (любой авторизованный может сменить свой пароль)
router.post('/change-password', authenticate, controller.changePassword.bind(controller));

export default router;
