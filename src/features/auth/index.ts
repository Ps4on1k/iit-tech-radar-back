/**
 * Auth feature module
 * Экспортирует все компоненты связанные с аутентификацией и пользователями
 */
export { User } from '../../models/User';
export { AuthController } from '../../controllers/AuthController';
export { AuthService } from '../../services/AuthService';
export { DatabaseUserRepository, createUserRepository } from '../../services/UserRepository';
export { default as authRoutes } from '../../routes/auth';
