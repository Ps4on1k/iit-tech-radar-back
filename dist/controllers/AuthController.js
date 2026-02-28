"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const authService = new AuthService_1.AuthService();
class AuthController {
    constructor() {
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json({ error: 'Требуется email и пароль' });
                    return;
                }
                const result = await authService.login({ email, password });
                res.json({
                    token: result.token,
                    user: {
                        id: result.user.id,
                        email: result.user.email,
                        firstName: result.user.firstName,
                        lastName: result.user.lastName,
                        role: result.user.role,
                    },
                });
            }
            catch (error) {
                res.status(401).json({ error: error.message || 'Ошибка аутентификации' });
            }
        };
        this.me = async (req, res) => {
            const authReq = req;
            if (!authReq.user) {
                res.status(401).json({ error: 'Требуется аутентификация' });
                return;
            }
            res.json({
                user: {
                    id: authReq.user.id,
                    email: authReq.user.email,
                    firstName: authReq.user.firstName,
                    lastName: authReq.user.lastName,
                    role: authReq.user.role,
                },
            });
        };
        this.getUsers = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может просматривать пользователей' });
                    return;
                }
                const users = await authService.getAllUsers();
                // Не возвращаем пароли
                const safeUsers = users.map(({ password, createdAt, updatedAt, ...user }) => user);
                res.json(safeUsers);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении пользователей' });
            }
        };
        this.getUserById = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может просматривать пользователей' });
                    return;
                }
                const id = String(req.params.id);
                const user = await authService.getUserById(id);
                if (!user) {
                    res.status(404).json({ error: 'Пользователь не найден' });
                    return;
                }
                const { password, ...safeUser } = user;
                res.json(safeUser);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении пользователя' });
            }
        };
        this.createUser = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может создавать пользователей' });
                    return;
                }
                const { email, password, firstName, lastName, role } = req.body;
                if (!email || !password || !firstName || !lastName) {
                    res.status(400).json({ error: 'Требуется email, пароль, имя и фамилия' });
                    return;
                }
                const user = await authService.createUser({
                    email,
                    password,
                    firstName,
                    lastName,
                    role: role || 'user',
                });
                const { password: _, ...safeUser } = user;
                res.status(201).json(safeUser);
            }
            catch (error) {
                res.status(error.message.includes('email') ? 409 : 500).json({ error: error.message });
            }
        };
        this.updateUser = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может редактировать пользователей' });
                    return;
                }
                const id = String(req.params.id);
                const { email, firstName, lastName, role, isActive } = req.body;
                const updated = await authService.updateUser(id, {
                    email,
                    firstName,
                    lastName,
                    role,
                    isActive,
                });
                if (!updated) {
                    res.status(404).json({ error: 'Пользователь не найден' });
                    return;
                }
                const { password: _, ...safeUser } = updated;
                res.json(safeUser);
            }
            catch (error) {
                res.status(error.message.includes('email') ? 409 : 500).json({ error: error.message });
            }
        };
        this.deleteUser = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может удалять пользователей' });
                    return;
                }
                const id = String(req.params.id);
                // Нельзя удалить самого себя
                if (id === authReq.user.id) {
                    res.status(400).json({ error: 'Нельзя удалить самого себя' });
                    return;
                }
                const deleted = await authService.deleteUser(id);
                if (!deleted) {
                    res.status(404).json({ error: 'Пользователь не найден' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при удалении пользователя' });
            }
        };
        this.changePassword = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user) {
                    res.status(401).json({ error: 'Требуется аутентификация' });
                    return;
                }
                const { currentPassword, newPassword } = req.body;
                if (!currentPassword || !newPassword) {
                    res.status(400).json({ error: 'Требуется текущий и новый пароль' });
                    return;
                }
                // Проверяем текущий пароль
                const validUser = await authService.validateUser(authReq.user.email, currentPassword);
                if (!validUser) {
                    res.status(401).json({ error: 'Неверный текущий пароль' });
                    return;
                }
                await authService.changePassword(authReq.user.id, newPassword);
                res.json({ message: 'Пароль успешно изменен' });
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при смене пароля' });
            }
        };
        // Админ может сменить пароль любому пользователю
        this.setUserPassword = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может менять пароли' });
                    return;
                }
                const id = String(req.params.id);
                const { newPassword } = req.body;
                if (!newPassword) {
                    res.status(400).json({ error: 'Требуется новый пароль' });
                    return;
                }
                const user = await authService.getUserById(id);
                if (!user) {
                    res.status(404).json({ error: 'Пользователь не найден' });
                    return;
                }
                await authService.setUserPassword(id, newPassword);
                res.json({ message: 'Пароль успешно изменен' });
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при смене пароля' });
            }
        };
        // Блокировка/разблокировка пользователя (toggle)
        this.toggleUserActive = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может управлять статусом пользователей' });
                    return;
                }
                const id = String(req.params.id);
                // Нельзя заблокировать самого себя
                if (id === authReq.user.id) {
                    res.status(400).json({ error: 'Нельзя изменить свой собственный статус' });
                    return;
                }
                const user = await authService.toggleUserActive(id);
                if (!user) {
                    res.status(404).json({ error: 'Пользователь не найден' });
                    return;
                }
                const { password: _, ...safeUser } = user;
                res.json({
                    ...safeUser,
                    isActive: user.isActive,
                });
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при изменении статуса пользователя' });
            }
        };
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map