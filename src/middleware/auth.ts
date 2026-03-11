import { Request, Response, NextFunction } from 'express';
import { AuthService, JwtPayload } from '../services/AuthService';
import { logger } from '../utils/logger';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Требуется аутентификация' });
    return;
  }

  const token = authHeader.substring(7);
  
  try {
    const payload = authService.verifyToken(token);

    if (!payload) {
      res.status(401).json({ error: 'Неверный токен' });
      return;
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch (error: any) {
    logger.error('Authentication error:', { error: error?.message || error });
    res.status(401).json({ error: 'Ошибка аутентификации' });
  }
};

export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    if (payload) {
      (req as AuthenticatedRequest).user = payload;
    }
  }

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ error: 'Требуется аутентификация' });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({ error: 'Недостаточно прав для выполнения этой операции' });
      return;
    }

    next();
  };
};

export const isAdmin = requireRole('admin');
export const isManager = requireRole('manager', 'admin');
export const isManagerOrAdmin = requireRole('manager', 'admin');
export const isAdminOrManager = requireRole('admin', 'manager');
