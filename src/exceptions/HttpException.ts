/**
 * Базовый класс для HTTP исключений
 */
export class HttpException extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = 'HttpException';
  }
}

/**
 * Исключение для ресурса который не найден (404)
 */
export class NotFoundException extends HttpException {
  constructor(message: string = 'Ресурс не найден', code?: string) {
    super(404, message, code);
    this.name = 'NotFoundException';
  }
}

/**
 * Исключение для запрещённых операций (403)
 */
export class ForbiddenException extends HttpException {
  constructor(message: string = 'Доступ запрещён', code?: string) {
    super(403, message, code);
    this.name = 'ForbiddenException';
  }
}

/**
 * Исключение для неавторизованных запросов (401)
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Требуется аутентификация', code?: string) {
    super(401, message, code);
    this.name = 'UnauthorizedException';
  }
}

/**
 * Исключение для ошибок валидации (400)
 */
export class BadRequestException extends HttpException {
  public readonly details?: any[];

  constructor(message: string = 'Ошибка валидации данных', details?: any[], code?: string) {
    super(400, message, code);
    this.details = details;
    this.name = 'BadRequestException';
  }
}

/**
 * Исключение для конфликтов (409)
 */
export class ConflictException extends HttpException {
  constructor(message: string = 'Конфликт данных', code?: string) {
    super(409, message, code);
    this.name = 'ConflictException';
  }
}

/**
 * Исключение для внутренних ошибок сервера (500)
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Внутренняя ошибка сервера', code?: string) {
    super(500, message, code);
    this.name = 'InternalServerErrorException';
  }
}
