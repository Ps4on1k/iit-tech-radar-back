import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для валидации DTO
 * @param dtoClass - Класс DTO для валидации
 */
export function validateDto<T extends object>(dtoClass: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToClass(dtoClass, req.body);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        field: error.property,
        message: Object.values(error.constraints || {}).join(', '),
      }));
      res.status(400).json({
        error: 'Ошибка валидации данных',
        details: formattedErrors,
      });
      return;
    }

    // Добавляем валидированный DTO в request
    req.body = dto;
    next();
  };
}
