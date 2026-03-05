import { enforceHttps, setSecureHeaders } from '../../middleware/https';
import { Request, Response, NextFunction } from 'express';

describe('https middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      secure: false,
      get: jest.fn(),
      originalUrl: '/api/test',
    };
    mockRes = {
      redirect: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('enforceHttps', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.HTTPS_ENABLED = 'true';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.HTTPS_ENABLED = undefined;
    });

    it('должен вызывать next если HTTPS_ENABLED=false', () => {
      process.env.HTTPS_ENABLED = 'false';
      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('должен вызывать next в development режиме', () => {
      process.env.NODE_ENV = 'development';
      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('должен перенаправлять на HTTPS если X-Forwarded-Proto !== https', () => {
      (mockReq.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'X-Forwarded-Proto') return 'http';
        if (header === 'Host') return 'example.com';
        return null;
      });

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith(301, 'https://example.com/api/test');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('должен вызывать next если X-Forwarded-Proto === https', () => {
      (mockReq.get as jest.Mock).mockImplementation((header: string) => {
        if (header === 'X-Forwarded-Proto') return 'https';
        return null;
      });

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });

    it('должен перенаправлять если не secure и нет X-Forwarded-Proto', () => {
      (mockReq as any).secure = false;
      (mockReq.get as jest.Mock).mockReturnValue(null);

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.redirect).toHaveBeenCalledWith(301, expect.stringContaining('https://'));
    });

    it('должен вызывать next если secure', () => {
      (mockReq as any).secure = true;
      (mockReq.get as jest.Mock).mockReturnValue(null);

      enforceHttps(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.redirect).not.toHaveBeenCalled();
    });
  });

  describe('setSecureHeaders', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.HTTPS_ENABLED = 'true';
    });

    afterEach(() => {
      process.env.NODE_ENV = 'test';
      process.env.HTTPS_ENABLED = undefined;
    });

    it('должен устанавливать заголовки безопасности в production с HTTPS', () => {
      setSecureHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Referrer-Policy',
        'strict-origin-when-cross-origin'
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('не должен устанавливать заголовки в development', () => {
      process.env.NODE_ENV = 'development';

      setSecureHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('не должен устанавливать заголовки если HTTPS_ENABLED=false', () => {
      process.env.HTTPS_ENABLED = 'false';

      setSecureHeaders(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
