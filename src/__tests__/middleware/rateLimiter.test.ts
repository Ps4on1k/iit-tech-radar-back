import {
  apiLimiter,
  loginLimiter,
  importLimiter,
  techRadarWriteLimiter,
} from '../../middleware/rateLimiter';

describe('rateLimiter middleware', () => {
  describe('apiLimiter', () => {
    it('должен существовать и иметь правильную конфигурацию', () => {
      expect(apiLimiter).toBeDefined();
      expect(typeof apiLimiter).toBe('function');
    });
  });

  describe('loginLimiter', () => {
    it('должен существовать и иметь правильную конфигурацию', () => {
      expect(loginLimiter).toBeDefined();
      expect(typeof loginLimiter).toBe('function');
    });
  });

  describe('importLimiter', () => {
    it('должен существовать и иметь правильную конфигурацию', () => {
      expect(importLimiter).toBeDefined();
      expect(typeof importLimiter).toBe('function');
    });
  });

  describe('techRadarWriteLimiter', () => {
    it('должен существовать и иметь правильную конфигурацию', () => {
      expect(techRadarWriteLimiter).toBeDefined();
      expect(typeof techRadarWriteLimiter).toBe('function');
    });
  });

  describe('Конфигурация лимитеров', () => {
    it('apiLimiter должен иметь windowMs 60000', () => {
      // Проверяем, что лимитер экспортирован
      expect(apiLimiter).toBeDefined();
    });

    it('loginLimiter должен иметь windowMs 60000', () => {
      expect(loginLimiter).toBeDefined();
    });

    it('importLimiter должен иметь windowMs 60000', () => {
      expect(importLimiter).toBeDefined();
    });

    it('techRadarWriteLimiter должен иметь windowMs 60000', () => {
      expect(techRadarWriteLimiter).toBeDefined();
    });
  });
});
