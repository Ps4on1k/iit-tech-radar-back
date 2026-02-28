"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new AuthController_1.AuthController();
// Публичные эндпоинты
router.post('/login', controller.login.bind(controller));
// Защищенные эндпоинты
router.get('/me', auth_1.authenticate, controller.me.bind(controller));
// Эндпоинты только для администратора
router.get('/users', auth_1.authenticate, auth_1.isAdmin, controller.getUsers.bind(controller));
router.get('/users/:id', auth_1.authenticate, auth_1.isAdmin, controller.getUserById.bind(controller));
router.post('/users', auth_1.authenticate, auth_1.isAdmin, controller.createUser.bind(controller));
router.put('/users/:id', auth_1.authenticate, auth_1.isAdmin, controller.updateUser.bind(controller));
router.delete('/users/:id', auth_1.authenticate, auth_1.isAdmin, controller.deleteUser.bind(controller));
router.post('/users/:id/password', auth_1.authenticate, auth_1.isAdmin, controller.setUserPassword.bind(controller));
router.post('/users/:id/toggle-status', auth_1.authenticate, auth_1.isAdmin, controller.toggleUserActive.bind(controller));
// Смена пароля (любой авторизованный может сменить свой пароль)
router.post('/change-password', auth_1.authenticate, controller.changePassword.bind(controller));
exports.default = router;
//# sourceMappingURL=auth.js.map