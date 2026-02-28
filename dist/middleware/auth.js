"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.requireRole = exports.optionalAuth = exports.authenticate = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Требуется аутентификация' });
        return;
    }
    const token = authHeader.substring(7);
    const payload = authService.verifyToken(token);
    if (!payload) {
        res.status(401).json({ error: 'Неверный токен' });
        return;
    }
    req.user = payload;
    next();
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const payload = authService.verifyToken(token);
        if (payload) {
            req.user = payload;
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireRole = (...roles) => {
    return (req, res, next) => {
        const authReq = req;
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
exports.requireRole = requireRole;
exports.isAdmin = (0, exports.requireRole)('admin');
//# sourceMappingURL=auth.js.map