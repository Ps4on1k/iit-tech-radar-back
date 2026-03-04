import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate, isAdmin } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';
import { validateDto } from '../middleware/validateDto';
import { LoginDto } from '../dto/LoginDto';
import { CreateUserDto } from '../dto/CreateUserDto';
import { UpdateUserDto } from '../dto/UpdateUserDto';
import { ChangePasswordDto } from '../dto/ChangePasswordDto';

const router = Router();
const controller = new AuthController();

// Публичные эндпоинты
router.post('/login', loginLimiter, validateDto(LoginDto), controller.login.bind(controller));

// Защищенные эндпоинты
router.get('/me', authenticate, controller.me.bind(controller));

// Эндпоинты только для администратора
router.get('/users', authenticate, isAdmin, controller.getUsers.bind(controller));
router.get('/users/:id', authenticate, isAdmin, controller.getUserById.bind(controller));
router.post('/users', authenticate, isAdmin, validateDto(CreateUserDto), controller.createUser.bind(controller));
router.put('/users/:id', authenticate, isAdmin, validateDto(UpdateUserDto), controller.updateUser.bind(controller));
router.delete('/users/:id', authenticate, isAdmin, controller.deleteUser.bind(controller));
router.post('/users/:id/password', authenticate, isAdmin, controller.setUserPassword.bind(controller));
router.post('/users/:id/toggle-status', authenticate, isAdmin, controller.toggleUserActive.bind(controller));

// Смена пароля (любой авторизованный может сменить свой пароль)
router.post('/change-password', authenticate, validateDto(ChangePasswordDto), controller.changePassword.bind(controller));

export default router;
