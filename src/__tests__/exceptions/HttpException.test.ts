import {
  HttpException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '../../exceptions/HttpException';

describe('HttpException', () => {
  describe('HttpException', () => {
    it('должен создавать исключение с правильными параметрами', () => {
      const exception = new HttpException(400, 'Test error', 'TEST_CODE');

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Test error');
      expect(exception.code).toBe('TEST_CODE');
      expect(exception.name).toBe('HttpException');
    });

    it('должен создавать исключение без code', () => {
      const exception = new HttpException(500, 'Server error');

      expect(exception.status).toBe(500);
      expect(exception.message).toBe('Server error');
      expect(exception.code).toBeUndefined();
    });
  });

  describe('NotFoundException', () => {
    it('должен создавать исключение с сообщением по умолчанию', () => {
      const exception = new NotFoundException();

      expect(exception.status).toBe(404);
      expect(exception.message).toBe('Ресурс не найден');
      expect(exception.name).toBe('NotFoundException');
    });

    it('должен создавать исключение с кастомным сообщением и кодом', () => {
      const exception = new NotFoundException('User not found', 'USER_NOT_FOUND');

      expect(exception.status).toBe(404);
      expect(exception.message).toBe('User not found');
      expect(exception.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('ForbiddenException', () => {
    it('должен создавать исключение с сообщением по умолчанию', () => {
      const exception = new ForbiddenException();

      expect(exception.status).toBe(403);
      expect(exception.message).toBe('Доступ запрещён');
      expect(exception.name).toBe('ForbiddenException');
    });

    it('должен создавать исключение с кастомным сообщением и кодом', () => {
      const exception = new ForbiddenException('Access denied', 'ACCESS_DENIED');

      expect(exception.status).toBe(403);
      expect(exception.message).toBe('Access denied');
      expect(exception.code).toBe('ACCESS_DENIED');
    });
  });

  describe('UnauthorizedException', () => {
    it('должен создавать исключение с сообщением по умолчанию', () => {
      const exception = new UnauthorizedException();

      expect(exception.status).toBe(401);
      expect(exception.message).toBe('Требуется аутентификация');
      expect(exception.name).toBe('UnauthorizedException');
    });

    it('должен создавать исключение с кастомным сообщением и кодом', () => {
      const exception = new UnauthorizedException('Token expired', 'TOKEN_EXPIRED');

      expect(exception.status).toBe(401);
      expect(exception.message).toBe('Token expired');
      expect(exception.code).toBe('TOKEN_EXPIRED');
    });
  });

  describe('BadRequestException', () => {
    it('должен создавать исключение с сообщением по умолчанию', () => {
      const exception = new BadRequestException();

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Ошибка валидации данных');
      expect(exception.name).toBe('BadRequestException');
      expect(exception.details).toBeUndefined();
    });

    it('должен создавать исключение с деталями валидации', () => {
      const details = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' },
      ];
      const exception = new BadRequestException('Validation failed', details, 'VALIDATION_ERROR');

      expect(exception.status).toBe(400);
      expect(exception.message).toBe('Validation failed');
      expect(exception.details).toEqual(details);
      expect(exception.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('ConflictException', () => {
    it('должен создавать исключение с сообщением по умолчанию', () => {
      const exception = new ConflictException();

      expect(exception.status).toBe(409);
      expect(exception.message).toBe('Конфликт данных');
      expect(exception.name).toBe('ConflictException');
    });

    it('должен создавать исключение с кастомным сообщением и кодом', () => {
      const exception = new ConflictException('Email already exists', 'EMAIL_EXISTS');

      expect(exception.status).toBe(409);
      expect(exception.message).toBe('Email already exists');
      expect(exception.code).toBe('EMAIL_EXISTS');
    });
  });

  describe('InternalServerErrorException', () => {
    it('должен создавать исключение с сообщением по умолчанию', () => {
      const exception = new InternalServerErrorException();

      expect(exception.status).toBe(500);
      expect(exception.message).toBe('Внутренняя ошибка сервера');
      expect(exception.name).toBe('InternalServerErrorException');
    });

    it('должен создавать исключение с кастомным сообщением и кодом', () => {
      const exception = new InternalServerErrorException('Database connection failed', 'DB_ERROR');

      expect(exception.status).toBe(500);
      expect(exception.message).toBe('Database connection failed');
      expect(exception.code).toBe('DB_ERROR');
    });
  });
});
