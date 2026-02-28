"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseUserRepository = void 0;
exports.createUserRepository = createUserRepository;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const database_1 = require("../database");
class DatabaseUserRepository {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(User_1.User);
    }
    async findByEmail(email) {
        const result = await this.repository.findOne({ where: { email } });
        return result ?? undefined;
    }
    async findById(id) {
        const result = await this.repository.findOne({ where: { id } });
        return result ?? undefined;
    }
    async findAll() {
        return this.repository.find();
    }
    async create(userData) {
        const user = this.repository.create(userData);
        return this.repository.save(user);
    }
    async update(id, userData) {
        await this.repository.update(id, userData);
        return this.findById(id);
    }
    async delete(id) {
        const result = await this.repository.delete(id);
        return (result.affected ?? 0) > 0;
    }
    async updatePassword(id, newPassword) {
        return this.update(id, { password: bcryptjs_1.default.hashSync(newPassword, 10) });
    }
    async findByEmailExcludeId(email, excludeId) {
        const result = await this.repository.findOne({ where: { email, id: excludeId } });
        return result ?? undefined;
    }
}
exports.DatabaseUserRepository = DatabaseUserRepository;
// Фабрика для создания репозитория
function createUserRepository() {
    return new DatabaseUserRepository();
}
//# sourceMappingURL=UserRepository.js.map