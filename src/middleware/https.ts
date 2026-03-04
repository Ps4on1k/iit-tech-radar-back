import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для принудительного редиректа с HTTP на HTTPS
 * Используется только если включено через переменную окружения HTTPS_ENABLED=true
 */
export function enforceHttps(req: Request, res: Response, next: NextFunction): void {
  // HTTPS отключено по умолчанию
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  
  if (!httpsEnabled) {
    next();
    return;
  }

  // Пропускаем локальное развитие и тестирование
  if (process.env.NODE_ENV !== 'production') {
    next();
    return;
  }

  // Проверяем заголовок X-Forwarded-Proto (устанавливается прокси-сервером)
  const proto = req.get('X-Forwarded-Proto');
  
  if (proto && proto !== 'https') {
    res.redirect(301, `https://${req.get('Host')}${req.originalUrl}`);
    return;
  }

  // Если нет заголовка X-Forwarded-Proto, проверяем secure connection
  if (!req.secure && !req.get('X-Forwarded-Proto')) {
    res.redirect(301, `https://${req.get('Host')}${req.originalUrl}`);
    return;
  }

  next();
}

/**
 * Middleware для установки HTTPS заголовков безопасности
 * Работает только если HTTPS_ENABLED=true
 */
export function setSecureHeaders(req: Request, res: Response, next: NextFunction): void {
  const httpsEnabled = process.env.HTTPS_ENABLED === 'true';
  
  // Только для production с включенным HTTPS
  if (process.env.NODE_ENV === 'production' && httpsEnabled) {
    // HSTS - принудительное использование HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Предотвращение MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Защита от clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Защита от XSS
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  next();
}
