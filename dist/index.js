"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const routes_1 = require("./routes");
const database_1 = require("./database");
async function bootstrap() {
    const app = (0, express_1.default)();
    // Инициализация базы данных (если используется)
    if (config_1.config.dbMode === 'database') {
        try {
            await database_1.AppDataSource.initialize();
            console.log('База данных подключена');
        }
        catch (error) {
            console.error('Ошибка подключения к БД:', error);
        }
    }
    else {
        console.log('Режим работы: mock данные');
    }
    // Middleware
    app.use((0, cors_1.default)({
        origin: config_1.config.frontendUrl,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Routes
    app.use('/api/tech-radar', routes_1.techRadarRoutes);
    app.use('/api/auth', routes_1.authRoutes);
    app.use('/api/import', routes_1.importRoutes);
    // Health check
    app.get('/health', (req, res) => {
        res.json({ status: 'ok', dbMode: config_1.config.dbMode });
    });
    // Start server
    app.listen(config_1.config.port, () => {
        console.log(`Сервер запущен на порту ${config_1.config.port}`);
        console.log(`Режим БД: ${config_1.config.dbMode}`);
        console.log(`Frontend URL: ${config_1.config.frontendUrl}`);
        console.log('');
        console.log('Учетные записи (по умолчанию):');
        console.log('  Admin: admin@techradar.local / password123');
        console.log('  User:  user@techradar.local / password123');
        console.log('');
        console.log('Для создания пользователей выполните: npm run seed');
    });
}
bootstrap().catch(console.error);
//# sourceMappingURL=index.js.map