import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

// Основной лимитер для всех API endpoint'ов
// 100 запросов в минуту
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 100, // лимит запросов с одного IP
  message: { error: 'Слишком много запросов, попробуйте позже' },
  standardHeaders: true, // Возвращать информацию о лимитах в заголовках
  legacyHeaders: false, // Отключить заголовки X-RateLimit-*
}) as RateLimitRequestHandler;

// Строгий лимитер для login endpoint
// 5 попыток входа в минуту
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5, // 5 попыток
  message: { error: 'Слишком много попыток входа. Попробуйте через минуту' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Считать все запросы, включая успешные
}) as RateLimitRequestHandler;

// Лимитер для import endpoint
// 10 запросов в минуту
export const importLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 10, // 10 запросов
  message: { error: 'Слишком много запросов импорта. Попробуйте через минуту' },
  standardHeaders: true,
  legacyHeaders: false,
}) as RateLimitRequestHandler;

// Лимитер для создания/обновления технологий
// 30 запросов в минуту
export const techRadarWriteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 30, // 30 запросов
  message: { error: 'Слишком много операций записи. Попробуйте через минуту' },
  standardHeaders: true,
  legacyHeaders: false,
}) as RateLimitRequestHandler;
