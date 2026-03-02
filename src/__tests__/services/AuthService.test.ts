import { AuthService } from '../../services/AuthService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Моки для репозитория
const mockUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  updatePassword: jest.fn(),
};

jest.mock('../../services/UserRepository', () => ({
  createUserRepository: () => mockUserRepository,
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('generateToken', () => {
    it('должен генерировать токен с правильным payload', () => {
      const payload = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin' as const,
      };

      const token = authService.generateToken(payload);

      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), expect.any(Object));
      expect(token).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('должен возвращать payload для валидного токена', () => {
      const mockPayload = {
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);

      const result = authService.verifyToken('valid_token');

      expect(result).toEqual(mockPayload);
    });

    it('должен возвращать null для невалидного токена', () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const result = authService.verifyToken('invalid_token');

      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const,
      isActive: true,
    };

    it('должен возвращать пользователя при успешной валидации', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('должен возвращать null если пользователь не найден', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(undefined);

      const result = await authService.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });

    it('должен возвращать null если пользователь не активен', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmail.mockResolvedValueOnce(inactiveUser);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });

    it('должен возвращать null при неверном пароле', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await authService.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashed_password',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user' as const,
      isActive: true,
    };

    it('должен возвращать токен и пользователя при успешном логине', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValueOnce('mock_token');

      const result = await authService.login({ email: 'test@example.com', password: 'password' });

      expect(result).toEqual({
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
        },
        token: 'mock_token',
      });
    });

    it('должен выбрасывать ошибку при неверных учетных данных', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(undefined);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toThrow('Неверный email или пароль');
    });
  });

  describe('getUserById', () => {
    it('должен возвращать пользователя по ID', async () => {
      const mockUser = { id: '123', email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
      mockUserRepository.findById.mockResolvedValueOnce(mockUser);

      const result = await authService.getUserById('123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('getAllUsers', () => {
    it('должен возвращать всех пользователей', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
      ];
      mockUserRepository.findAll.mockResolvedValueOnce(mockUsers);

      const result = await authService.getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(mockUserRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'user' as const,
    };

    it('должен создавать нового пользователя', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(undefined);
      mockUserRepository.create.mockResolvedValueOnce({
        ...userData,
        id: 'new-id',
        isActive: true,
      });

      const result = await authService.createUser(userData);

      expect(result).toBeDefined();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('должен выбрасывать ошибку если email уже существует', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce({ id: 'existing', email: userData.email });

      await expect(authService.createUser(userData)).rejects.toThrow(
        'Пользователь с таким email уже существует'
      );
    });
  });

  describe('updateUser', () => {
    it('должен обновлять пользователя', async () => {
      const existingUser = { id: '123', email: 'old@example.com', firstName: 'Old' };
      mockUserRepository.findByEmail.mockResolvedValueOnce(undefined);
      mockUserRepository.update.mockResolvedValueOnce({ ...existingUser, email: 'new@example.com' });

      const result = await authService.updateUser('123', { email: 'new@example.com' });

      expect(result).toBeDefined();
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', { email: 'new@example.com' });
    });

    it('должен выбрасывать ошибку если email уже существует у другого пользователя', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce({
        id: 'other-id',
        email: 'existing@example.com',
      });

      await expect(
        authService.updateUser('123', { email: 'existing@example.com' })
      ).rejects.toThrow('Пользователь с таким email уже существует');
    });
  });

  describe('deleteUser', () => {
    it('должен удалять пользователя', async () => {
      mockUserRepository.delete.mockResolvedValueOnce(true);

      const result = await authService.deleteUser('123');

      expect(result).toBe(true);
      expect(mockUserRepository.delete).toHaveBeenCalledWith('123');
    });
  });

  describe('changePassword', () => {
    it('должен менять пароль пользователя', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockUserRepository.updatePassword.mockResolvedValueOnce(mockUser);

      const result = await authService.changePassword('123', 'newpassword');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('123', 'newpassword');
    });
  });

  describe('setUserPassword', () => {
    it('должен устанавливать пароль пользователю', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      mockUserRepository.updatePassword.mockResolvedValueOnce(mockUser);

      const result = await authService.setUserPassword('123', 'newpassword');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith('123', 'newpassword');
    });
  });

  describe('toggleUserActive', () => {
    it('должен переключать статус активности пользователя', async () => {
      const mockUser = { id: '123', email: 'test@example.com', isActive: true };
      mockUserRepository.findById.mockResolvedValueOnce(mockUser);
      mockUserRepository.update.mockResolvedValueOnce({ ...mockUser, isActive: false });

      const result = await authService.toggleUserActive('123');

      expect(result).toEqual({ ...mockUser, isActive: false });
      expect(mockUserRepository.update).toHaveBeenCalledWith('123', { isActive: false });
    });

    it('должен возвращать undefined если пользователь не найден', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(undefined);

      const result = await authService.toggleUserActive('123');

      expect(result).toBeUndefined();
    });
  });
});
