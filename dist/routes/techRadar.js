"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TechRadarController_1 = require("../controllers/TechRadarController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new TechRadarController_1.TechRadarController();
// Публичные эндпоинты (с опциональной аутентификацией) - только чтение
router.get('/', auth_1.optionalAuth, controller.getAll.bind(controller));
router.get('/filtered', auth_1.optionalAuth, controller.getFiltered.bind(controller));
router.get('/search', auth_1.optionalAuth, controller.search.bind(controller));
router.get('/statistics', auth_1.optionalAuth, controller.getStatistics.bind(controller));
router.get('/category/:category', auth_1.optionalAuth, controller.getByCategory.bind(controller));
router.get('/type/:type', auth_1.optionalAuth, controller.getByType.bind(controller));
// Эндпоинты только для администратора - CRUD операции
router.get('/:id', auth_1.authenticate, auth_1.isAdmin, controller.getById.bind(controller));
router.post('/', auth_1.authenticate, auth_1.isAdmin, controller.create.bind(controller));
router.put('/:id', auth_1.authenticate, auth_1.isAdmin, controller.update.bind(controller));
router.delete('/:id', auth_1.authenticate, auth_1.isAdmin, controller.delete.bind(controller));
exports.default = router;
//# sourceMappingURL=techRadar.js.map