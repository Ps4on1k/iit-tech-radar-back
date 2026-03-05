import { errorHandler } from '../../middleware/errorHandler';
import { HttpException } from '../../exceptions/HttpException';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('HttpException handling', () => {
    it('должен обрабатывать HttpException', () => {
      const error = new HttpException(400, 'Bad request', 'BAD_REQUEST');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Bad request',
        code: 'BAD_REQUEST',
      });
    });

    it('должен обрабатывать HttpException с деталями', () => {
      const error = new HttpException(400, 'Validation error', 'VALIDATION_ERROR');
      (error as any).details = [{ field: 'email', message: 'Invalid' }];
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          details: [{ field: 'email', message: 'Invalid' }],
        })
      );
    });
  });

  describe('ValidationError handling', () => {
    it('должен обрабатывать ошибку валидации class-validator', () => {
      const error: any = {
        name: 'ValidationError',
        message: 'Validation failed',
        details: [{ field: 'email', message: 'Invalid email' }],
      };
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Ошибка валидации данных',
        details: [{ field: 'email', message: 'Invalid email' }],
      });
    });
  });

  describe('QueryFailedError handling', () => {
    it('должен обрабатывать ошибку уникальности PostgreSQL', () => {
      const error: any = {
        name: 'QueryFailedError',
        code: '23505',
        message: 'Duplicate key',
      };
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 409,
        message: 'Ресурс с такими данными уже существует',
      });
    });

    it('должен обрабатывать ошибку уникальности SQLite', () => {
      const error: any = {
        name: 'QueryFailedError',
        errno: 19,
        message: 'UNIQUE constraint failed',
      };
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 409,
        message: 'Ресурс с такими данными уже существует',
      });
    });

    it('должен обрабатывать ошибку внешней ссылки', () => {
      const error: any = {
        name: 'QueryFailedError',
        code: '23503',
        message: 'Foreign key violation',
      };
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Нарушение целостности данных',
      });
    });

    it('должен обрабатывать другие ошибки БД', () => {
      const error: any = {
        name: 'QueryFailedError',
        code: 'OTHER',
        message: 'Database error',
      };
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Ошибка базы данных',
      });
    });
  });

  describe('SyntaxError handling', () => {
    it('должен обрабатывать ошибку парсинга JSON', () => {
      const error: any = new SyntaxError('Unexpected token');
      error.body = true;
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Некорректный формат JSON',
      });
    });
  });

  describe('Unknown error handling', () => {
    it('должен обрабатывать неизвестные ошибки как 500', () => {
      const error = new Error('Unknown error');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Unknown error',
      });
    });

    it('должен использовать сообщение по умолчанию для ошибок без message', () => {
      const error: any = {};
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Внутренняя ошибка сервера',
      });
    });
  });

  describe('Development mode stack trace', () => {
    it('должен включать stack trace в development режиме', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('не должен включать stack trace в production режиме', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      const response = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
