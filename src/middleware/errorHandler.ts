import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';

/**
 * Глобальный middleware для обработки ошибок
 * Должен быть подключён после всех роутов
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Логирование ошибки (в будущем можно заменить на Winston)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    console.error('Error:', err.message);
  }

  // Если это наше HTTP исключение
  if (err instanceof HttpException) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
      code: err.code,
      ...(err as any).details && { details: (err as any).details },
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Обработка ошибок валидации class-validator
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 400,
      message: 'Ошибка валидации данных',
      details: err.details,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Обработка ошибок TypeORM
  if (err.name === 'QueryFailedError') {
    // Ошибка уникальности (PostgreSQL: 23505, SQLite: SQLITE_CONSTRAINT_UNIQUE)
    if (err.code === '23505' || err.errno === 19) {
      res.status(409).json({
        status: 409,
        message: 'Ресурс с такими данными уже существует',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
      return;
    }

    // Ошибка внешней ссылки
    if (err.code === '23503') {
      res.status(400).json({
        status: 400,
        message: 'Нарушение целостности данных',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
      return;
    }

    // Другие ошибки БД
    res.status(500).json({
      status: 500,
      message: 'Ошибка базы данных',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Обработка ошибок JSON парсинга
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      status: 400,
      message: 'Некорректный формат JSON',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }

  // Все остальные ошибки - 500
  res.status(500).json({
    status: 500,
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
