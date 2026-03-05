import { BaseController } from '../../controllers/BaseController';
import { HttpException } from '../../exceptions/HttpException';

// Тестовый контроллер для тестирования BaseController
class TestController extends BaseController {
  public testHandleError(res: any, error: unknown, defaultMessage?: string) {
    this.handleError(res, error, defaultMessage);
  }

  public testWrapAsync(fn: any) {
    return this.wrapAsync(fn);
  }

  public testSendSuccess(res: any, data: any, status?: number) {
    this.sendSuccess(res, data, status);
  }

  public testSendCreated(res: any, data: any) {
    this.sendCreated(res, data);
  }

  public testSendNoContent(res: any) {
    this.sendNoContent(res);
  }

  public testSendNotFound(res: any, message?: string) {
    this.sendNotFound(res, message);
  }

  public testSendBadRequest(res: any, message?: string, details?: any[]) {
    this.sendBadRequest(res, message, details);
  }

  public testSendForbidden(res: any, message?: string) {
    this.sendForbidden(res, message);
  }

  public testSendUnauthorized(res: any, message?: string) {
    this.sendUnauthorized(res, message);
  }

  public testSendConflict(res: any, message?: string) {
    this.sendConflict(res, message);
  }
}

describe('BaseController', () => {
  let controller: TestController;
  let mockRes: any;

  beforeEach(() => {
    controller = new TestController();
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('handleError', () => {
    it('должен обрабатывать HttpException', () => {
      const error = new HttpException(400, 'Test error', 'TEST_CODE');
      controller.testHandleError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Test error',
        code: 'TEST_CODE',
      });
    });

    it('должен обрабатывать обычную Error в development режиме', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      controller.testHandleError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Test error',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('должен обрабатывать обычную Error в production режиме', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');
      controller.testHandleError(mockRes, error, 'Default message');

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Default message',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('должен обрабатывать неизвестные ошибки', () => {
      const error = 'String error';
      controller.testHandleError(mockRes, error);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 500,
        message: 'Ошибка при выполнении операции',
      });
    });
  });

  describe('sendSuccess', () => {
    it('должен отправлять успешный ответ со статусом 200', () => {
      const data = { id: 1, name: 'Test' };
      controller.testSendSuccess(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(data);
    });

    it('должен отправлять успешный ответ с кастомным статусом', () => {
      const data = { id: 1 };
      controller.testSendSuccess(mockRes, data, 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(data);
    });
  });

  describe('sendCreated', () => {
    it('должен отправлять ответ 201', () => {
      const data = { id: 1 };
      controller.testSendCreated(mockRes, data);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(data);
    });
  });

  describe('sendNoContent', () => {
    it('должен отправлять ответ 204', () => {
      controller.testSendNoContent(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });
  });

  describe('sendNotFound', () => {
    it('должен отправлять 404 с сообщением по умолчанию', () => {
      controller.testSendNotFound(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        message: 'Ресурс не найден',
      });
    });

    it('должен отправлять 404 с кастомным сообщением', () => {
      controller.testSendNotFound(mockRes, 'Custom not found');

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 404,
        message: 'Custom not found',
      });
    });
  });

  describe('sendBadRequest', () => {
    it('должен отправлять 400 с сообщением по умолчанию', () => {
      controller.testSendBadRequest(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Неверный запрос',
      });
    });

    it('должен отправлять 400 с кастомным сообщением и деталями', () => {
      const details = [{ field: 'email', message: 'Invalid email' }];
      controller.testSendBadRequest(mockRes, 'Custom error', details);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 400,
        message: 'Custom error',
        details,
      });
    });
  });

  describe('sendForbidden', () => {
    it('должен отправлять 403 с сообщением по умолчанию', () => {
      controller.testSendForbidden(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 403,
        message: 'Доступ запрещён',
      });
    });

    it('должен отправлять 403 с кастомным сообщением', () => {
      controller.testSendForbidden(mockRes, 'Custom forbidden');

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 403,
        message: 'Custom forbidden',
      });
    });
  });

  describe('sendUnauthorized', () => {
    it('должен отправлять 401 с сообщением по умолчанию', () => {
      controller.testSendUnauthorized(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 401,
        message: 'Требуется аутентификация',
      });
    });

    it('должен отправлять 401 с кастомным сообщением', () => {
      controller.testSendUnauthorized(mockRes, 'Custom unauthorized');

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 401,
        message: 'Custom unauthorized',
      });
    });
  });

  describe('sendConflict', () => {
    it('должен отправлять 409 с сообщением по умолчанию', () => {
      controller.testSendConflict(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 409,
        message: 'Конфликт данных',
      });
    });

    it('должен отправлять 409 с кастомным сообщением', () => {
      controller.testSendConflict(mockRes, 'Custom conflict');

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 409,
        message: 'Custom conflict',
      });
    });
  });

  describe('wrapAsync', () => {
    it('должен успешно выполнять async функцию', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const wrappedFn = controller.testWrapAsync(asyncFn);

      const mockReq = {};
      const mockNext = jest.fn();

      await wrappedFn(mockReq as any, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('должен обрабатывать ошибки async функции', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = controller.testWrapAsync(asyncFn);

      const mockReq = {};
      const mockNext = jest.fn();

      await wrappedFn(mockReq as any, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
