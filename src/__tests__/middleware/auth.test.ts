import { Request, Response, NextFunction } from 'express';
import {
  authenticate,
  optionalAuth,
  requireRole,
  isAdmin,
  isManager,
} from '../../middleware/auth';

// Моки для jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token: string) => {
    if (token === 'valid_token') {
      return {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };
    }
    if (token === 'user_token') {
      return {
        id: '456',
        email: 'user@example.com',
        firstName: 'User',
        lastName: 'Test',
        role: 'user',
      };
    }
    if (token === 'manager_token') {
      return {
        id: '789',
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'Test',
        role: 'manager',
      };
    }
    throw new Error('Invalid token');
  }),
}));

import jwt from 'jsonwebtoken';

describe('Middleware Auth', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('должен возвращать 401 если заголовок Authorization отсутствует', () => {
      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('должен возвращать 401 если заголовок не начинается с Bearer', () => {
      mockRequest.headers = { authorization: 'Basic token123' };

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
    });

    it('должен возвращать 401 если токен невалидный', () => {
      mockRequest.headers = { authorization: 'Bearer invalid_token' };
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Неверный токен' });
    });

    it('должен устанавливать user в request и вызывать next для валидного токена', () => {
      const mockPayload = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);
      mockRequest.headers = { authorization: 'Bearer valid_token' };

      // Нужно импортировать authenticate после мока config
      authenticate(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect((mockRequest as any).user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('должен вызывать next если заголовок Authorization отсутствует', () => {
      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('должен устанавливать user если токен валидный', () => {
      const mockPayload = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };
      (jwt.verify as jest.Mock).mockReturnValueOnce(mockPayload);
      mockRequest.headers = { authorization: 'Bearer valid_token' };

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect((mockRequest as any).user).toEqual(mockPayload);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('не должен устанавливать user если токен невалидный', () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      mockRequest.headers = { authorization: 'Bearer invalid_token' };

      optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect((mockRequest as any).user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('должен возвращать 401 если пользователь не аутентифицирован', () => {
      mockRequest.user = undefined;

      const middleware = requireRole('admin');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Требуется аутентификация' });
    });

    it('должен возвращать 403 если у пользователя нет нужной роли', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      };

      const middleware = requireRole('admin');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Недостаточно прав для выполнения этой операции',
      });
    });

    it('должен вызывать next если у пользователя есть нужная роль', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };

      const middleware = requireRole('admin');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('должен вызывать next если у пользователя есть одна из требуемых ролей', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'manager',
      };

      const middleware = requireRole('admin', 'manager');
      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('должен пропускать только пользователей с ролью admin', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };

      isAdmin(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('должен отклонять пользователей с ролью manager', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'manager',
      };

      isAdmin(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });

  describe('isManager', () => {
    it('должен пропускать пользователей с ролью manager', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'manager',
      };

      isManager(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('должен пропускать пользователей с ролью admin', () => {
      mockRequest.user = {
        id: '123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };

      isManager(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
