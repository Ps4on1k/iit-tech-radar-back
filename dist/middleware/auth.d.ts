import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../services/AuthService';
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireRole: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map