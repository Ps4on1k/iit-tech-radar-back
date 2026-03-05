import { validateDto } from '../../middleware/validateDto';
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

// Тестовый DTO
class TestDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}

describe('validateDto middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('должен проходить валидацию с корректными данными', async () => {
    mockReq.body = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('должен заменять body на экземпляр DTO', async () => {
    mockReq.body = {
      name: 'John Doe',
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body).toBeInstanceOf(TestDto);
  });

  it('должен отклонять некорректный email', async () => {
    mockReq.body = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123',
    };

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ошибка валидации данных',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
        }),
      ]),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен отклонять пустое имя', async () => {
    mockReq.body = {
      name: '',
      email: 'test@example.com',
      password: 'password123',
    };

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ошибка валидации данных',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'name',
        }),
      ]),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен отклонять короткий пароль', async () => {
    mockReq.body = {
      name: 'John Doe',
      email: 'test@example.com',
      password: '123',
    };

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ошибка валидации данных',
      details: expect.arrayContaining([
        expect.objectContaining({
          field: 'password',
        }),
      ]),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен отклонять несколько полей с ошибками', async () => {
    mockReq.body = {
      name: '',
      email: 'invalid',
      password: '123',
    };

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ошибка валидации данных',
      details: expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен отклонять отсутствующие обязательные поля', async () => {
    mockReq.body = {};

    const middleware = validateDto(TestDto);
    await middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Ошибка валидации данных',
      details: expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ]),
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
