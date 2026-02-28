"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const UserRepository_1 = require("./UserRepository");
class AuthService {
    constructor() {
        this.userRepository = (0, UserRepository_1.createUserRepository)();
    }
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        }
        catch {
            return null;
        }
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.isActive) {
            return null;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
    }
    async login(credentials) {
        const user = await this.validateUser(credentials.email, credentials.password);
        if (!user) {
            throw new Error('Неверный email или пароль');
        }
        const token = this.generateToken(user);
        return {
            user,
            token,
        };
    }
    async getUserById(id) {
        return this.userRepository.findById(id);
    }
    async getAllUsers() {
        return this.userRepository.findAll();
    }
    async createUser(userData) {
        // Проверка на уникальный email
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error('Пользователь с таким email уже существует');
        }
        const hashedPassword = bcryptjs_1.default.hashSync(userData.password, 10);
        return this.userRepository.create({
            ...userData,
            password: hashedPassword,
            isActive: true,
        });
    }
    async updateUser(id, userData) {
        // Проверка на уникальный email (исключая текущего пользователя)
        if (userData.email) {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser && existingUser.id !== id) {
                throw new Error('Пользователь с таким email уже существует');
            }
        }
        return this.userRepository.update(id, userData);
    }
    async deleteUser(id) {
        return this.userRepository.delete(id);
    }
    async changePassword(userId, newPassword) {
        return this.userRepository.updatePassword(userId, newPassword);
    }
    async setUserPassword(userId, newPassword) {
        // Админ может установить пароль пользователю без проверки старого
        return this.userRepository.updatePassword(userId, newPassword);
    }
    async toggleUserActive(id) {
        const user = await this.userRepository.findById(id);
        if (!user)
            return undefined;
        return this.userRepository.update(id, { isActive: !user.isActive });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map