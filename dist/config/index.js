"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
exports.config = {
    port: process.env.PORT || 5000,
    jwt: {
        secret: process.env.JWT_SECRET || 'tech-radar-jwt-secret-key-for-development',
        expiresIn: '24h',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    dbMode: process.env.DB_MODE || 'mock',
};
//# sourceMappingURL=index.js.map