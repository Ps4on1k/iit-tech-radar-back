import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { Router } from 'express';

/**
 * Базовый контроллер с общими методами
 * Предоставляет единую обработку ошибок и вспомогательные методы
 */
export abstract class BaseController {
  /**
   * Получение экземпляра Router
   */
  protected getRouter(): Router {
    return Router();
  }

  /**
   * Обработка ошибок в контроллере
   * Автоматически определяет тип ошибки и возвращает соответствующий статус
   */
  protected handleError(res: Response, error: unknown, defaultMessage: string = 'Ошибка при выполнении операции'): void {
    if (error instanceof HttpException) {
      res.status(error.status).json({
        status: error.status,
        message: error.message,
        code: error.code,
      });
      return;
    }

    if (error instanceof Error) {
      console.error(`[${this.constructor.name}] ${error.message}`, error.stack);
      res.status(500).json({
        status: 500,
        message: process.env.NODE_ENV === 'development' ? error.message : defaultMessage,
      });
      return;
    }

    console.error(`[${this.constructor.name}] Неизвестная ошибка:`, error);
    res.status(500).json({
      status: 500,
      message: defaultMessage,
    });
  }

  /**
   * Обёртка для async методов контроллера
   * Автоматически обрабатывает ошибки
   */
  protected wrapAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        this.handleError(res, error);
      });
    };
  }

  /**
   * Отправка успешного ответа
   */
  protected sendSuccess<T>(res: Response, data: T, status: number = 200): void {
    res.status(status).json(data);
  }

  /**
   * Отправка ответа с созданным ресурсом
   */
  protected sendCreated<T>(res: Response, data: T): void {
    res.status(201).json(data);
  }

  /**
   * Отправка ответа об удалении
   */
  protected sendNoContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Отправка ошибки "не найдено"
   */
  protected sendNotFound(res: Response, message: string = 'Ресурс не найден'): void {
    res.status(404).json({
      status: 404,
      message,
    });
  }

  /**
   * Отправка ошибки "неверный запрос"
   */
  protected sendBadRequest(res: Response, message: string = 'Неверный запрос', details?: any[]): void {
    res.status(400).json({
      status: 400,
      message,
      ...(details && { details }),
    });
  }

  /**
   * Отправка ошибки "запрещено"
   */
  protected sendForbidden(res: Response, message: string = 'Доступ запрещён'): void {
    res.status(403).json({
      status: 403,
      message,
    });
  }

  /**
   * Отправка ошибки "не авторизован"
   */
  protected sendUnauthorized(res: Response, message: string = 'Требуется аутентификация'): void {
    res.status(401).json({
      status: 401,
      message,
    });
  }

  /**
   * Отправка ошибки "конфликт"
   */
  protected sendConflict(res: Response, message: string = 'Конфликт данных'): void {
    res.status(409).json({
      status: 409,
      message,
    });
  }
}
