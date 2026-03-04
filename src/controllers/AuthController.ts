import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { auditService } from '../services/AuditService';
import { LoginDto } from '../dto/LoginDto';
import { CreateUserDto } from '../dto/CreateUserDto';
import { UpdateUserDto } from '../dto/UpdateUserDto';
import { ChangePasswordDto } from '../dto/ChangePasswordDto';

const authService = new AuthService();

export class AuthController {
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as LoginDto;

      const result = await authService.login(dto);

      res.json({
        token: result.token,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
        },
      });

      // Логируем успешный вход после отправки ответа (не блокируя)
      auditService.logSuccess({
        action: 'LOGIN',
        entity: 'Auth',
        entityId: result.user.id,
        ipAddress: req.ip,
        details: { email: result.user.email },
      }).catch(() => {}); // Игнорируем ошибки логирования
    } catch (error: any) {
      const dto = req.body as LoginDto;
      
      // Логируем неудачную попытку
      auditService.logFailure({
        action: 'LOGIN',
        entity: 'Auth',
        ipAddress: req.ip,
        details: { email: dto?.email, error: error.message },
      }).catch(() => {}); // Игнорируем ошибки логирования
      
      res.status(401).json({ error: error.message || 'Ошибка аутентификации' });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const authReq = req as any;
    if (!authReq.user) {
      res.status(401).json({ error: 'Требуется аутентификация' });
      return;
    }

    res.json({
      user: {
        id: authReq.user.id,
        email: authReq.user.email,
        firstName: authReq.user.firstName,
        lastName: authReq.user.lastName,
        role: authReq.user.role,
      },
    });
  };

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может просматривать пользователей' });
        return;
      }

      const users = await authService.getAllUsers();

      // Не возвращаем пароли
      const safeUsers = users.map(({ password, createdAt, updatedAt, ...user }: any) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении пользователей' });
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может просматривать пользователей' });
        return;
      }

      const id = String(req.params.id);
      const user = await authService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      const { password, ...safeUser } = user as any;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при получении пользователя' });
    }
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может создавать пользователей' });
        return;
      }

      const dto = req.body as CreateUserDto;

      const user = await authService.createUser({
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: (dto.role || 'user') as 'admin' | 'user',
      });

      const { password: _, ...safeUser } = user as any;
      res.status(201).json(safeUser);
    } catch (error: any) {
      res.status(error.message.includes('email') ? 409 : 500).json({ error: error.message });
    }
  };

  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может редактировать пользователей' });
        return;
      }

      const id = String(req.params.id);
      const dto = req.body as UpdateUserDto;

      const updated = await authService.updateUser(id, {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as any,
        isActive: dto.isActive,
      });

      if (!updated) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      const { password: _, ...safeUser } = updated as any;
      res.json(safeUser);
    } catch (error: any) {
      res.status(error.message.includes('email') ? 409 : 500).json({ error: error.message });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может удалять пользователей' });
        return;
      }

      const id = String(req.params.id);

      // Нельзя удалить самого себя
      if (id === authReq.user.id) {
        res.status(400).json({ error: 'Нельзя удалить самого себя' });
        return;
      }

      const deleted = await authService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при удалении пользователя' });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
      }

      const dto = req.body as ChangePasswordDto;

      // Проверяем текущий пароль
      const validUser = await authService.validateUser(authReq.user.email, dto.oldPassword);

      if (!validUser) {
        res.status(401).json({ error: 'Неверный текущий пароль' });
        return;
      }

      await authService.changePassword(authReq.user.id, dto.newPassword);

      res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при смене пароля' });
    }
  };

  // Админ может сменить пароль любому пользователю
  setUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может менять пароли' });
        return;
      }

      const id = String(req.params.id);
      const { newPassword } = req.body;

      if (!newPassword) {
        res.status(400).json({ error: 'Требуется новый пароль' });
        return;
      }

      const user = await authService.getUserById(id);
      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      await authService.setUserPassword(id, newPassword);

      res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при смене пароля' });
    }
  };

  // Блокировка/разблокировка пользователя (toggle)
  toggleUserActive = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as any;
      if (!authReq.user || authReq.user.role !== 'admin') {
        res.status(403).json({ error: 'Только администратор может управлять статусом пользователей' });
        return;
      }

      const id = String(req.params.id);

      // Нельзя заблокировать самого себя
      if (id === authReq.user.id) {
        res.status(400).json({ error: 'Нельзя изменить свой собственный статус' });
        return;
      }

      const user = await authService.toggleUserActive(id);

      if (!user) {
        res.status(404).json({ error: 'Пользователь не найден' });
        return;
      }

      const { password: _, ...safeUser } = user as any;
      res.json({
        ...safeUser,
        isActive: user.isActive,
      });
    } catch (error) {
      res.status(500).json({ error: 'Ошибка при изменении статуса пользователя' });
    }
  };
}
