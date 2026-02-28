"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ImportController_1 = require("../controllers/ImportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new ImportController_1.ImportController();
// Все эндпоинты требуют аутентификации и роли admin
router.use(auth_1.authenticate, auth_1.isAdmin);
// Импорт технологий
router.post('/tech-radar', controller.importTechRadar.bind(controller));
// Экспорт технологий
router.get('/tech-radar', controller.exportTechRadar.bind(controller));
// Валидация данных перед импортом
router.post('/tech-radar/validate', controller.validateImport.bind(controller));
exports.default = router;
//# sourceMappingURL=import.js.map