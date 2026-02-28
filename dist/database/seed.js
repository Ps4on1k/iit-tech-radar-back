"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("./index");
const User_1 = require("../models/User");
dotenv.config({ path: '.env' });
async function seed() {
    try {
        await index_1.AppDataSource.initialize();
        console.log('База данных подключена');
        const userRepository = index_1.AppDataSource.getRepository(User_1.User);
        // Проверяем, есть ли уже пользователи
        const existingAdmin = await userRepository.findOne({ where: { email: 'admin@techradar.local' } });
        const existingUser = await userRepository.findOne({ where: { email: 'user@techradar.local' } });
        if (existingAdmin && existingUser) {
            console.log('Пользователи уже существуют. Сид не требуется.');
            await index_1.AppDataSource.destroy();
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const admin = userRepository.create({
            email: 'admin@techradar.local',
            password: hashedPassword,
            firstName: 'Админ',
            lastName: 'Админов',
            role: 'admin',
            isActive: true,
        });
        const user = userRepository.create({
            email: 'user@techradar.local',
            password: hashedPassword,
            firstName: 'Пользователь',
            lastName: 'Пользователей',
            role: 'user',
            isActive: true,
        });
        if (!existingAdmin) {
            await userRepository.save(admin);
            console.log('Создан администратор: admin@techradar.local');
        }
        if (!existingUser) {
            await userRepository.save(user);
            console.log('Создан пользователь: user@techradar.local');
        }
        console.log('Сид завершен успешно');
        await index_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('Ошибка при сиде:', error);
        process.exit(1);
    }
}
seed();
//# sourceMappingURL=seed.js.map