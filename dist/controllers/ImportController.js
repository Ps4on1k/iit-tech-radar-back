"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportController = void 0;
const ImportService_1 = require("../services/ImportService");
let importService;
// Проверяем, что БД инициализирована
function getImportService() {
    if (!importService) {
        importService = new ImportService_1.ImportService();
    }
    return importService;
}
class ImportController {
    constructor() {
        /**
         * Импорт технологий из JSON
         * POST /api/import/tech-radar
         * Body: массив объектов TechRadar
         * Query params:
         *  - skipExisting=true - пропускать существующие записи
         *  - updateExisting=true - обновлять существующие записи
         */
        this.importTechRadar = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может импортировать данные' });
                    return;
                }
                const data = req.body;
                const skipExisting = req.query.skipExisting === 'true';
                const updateExisting = req.query.updateExisting === 'true';
                if (!data) {
                    res.status(400).json({ error: 'Требуется тело запроса с данными для импорта' });
                    return;
                }
                const service = getImportService();
                const result = await service.importTechRadar(data, { skipExisting, updateExisting });
                if (!result.success) {
                    res.status(400).json({
                        message: 'Импорт завершен с ошибками',
                        result,
                    });
                    return;
                }
                res.status(200).json({
                    message: 'Импорт успешно завершен',
                    result,
                });
            }
            catch (error) {
                res.status(500).json({ error: `Ошибка импорта: ${error.message}` });
            }
        };
        /**
         * Экспорт всех технологий в JSON
         * GET /api/import/tech-radar
         */
        this.exportTechRadar = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может экспортировать данные' });
                    return;
                }
                const service = getImportService();
                const data = await service.exportTechRadar();
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: `Ошибка экспорта: ${error.message}` });
            }
        };
        /**
         * Предварительная валидация данных перед импортом
         * POST /api/import/tech-radar/validate
         */
        this.validateImport = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может валидировать данные' });
                    return;
                }
                const data = req.body;
                if (!data) {
                    res.status(400).json({ error: 'Требуется тело запроса с данными для валидации' });
                    return;
                }
                if (!Array.isArray(data)) {
                    res.status(400).json({ error: 'Данные должны быть массивом' });
                    return;
                }
                // Создаем временный сервис для валидации
                const service = new ImportService_1.ImportService();
                // Валидируем каждую запись
                const errors = [];
                const validCount = data.length;
                // Используем приватный метод валидации через создание тестовой записи
                for (let i = 0; i < data.length; i++) {
                    const entity = data[i];
                    // Проверка обязательных полей
                    const requiredFields = ['id', 'name', 'version', 'type', 'category', 'firstAdded', 'owner', 'maturity', 'riskLevel', 'license', 'supportStatus', 'businessCriticality'];
                    for (const field of requiredFields) {
                        if (entity[field] === undefined || entity[field] === null || entity[field] === '') {
                            errors.push({
                                index: i,
                                id: entity.id,
                                field,
                                message: `Отсутствует обязательное поле: ${field}`,
                            });
                        }
                    }
                }
                res.json({
                    valid: errors.length === 0,
                    totalRecords: data.length,
                    validRecords: validCount - errors.length,
                    invalidRecords: errors.length,
                    errors,
                });
            }
            catch (error) {
                res.status(500).json({ error: `Ошибка валидации: ${error.message}` });
            }
        };
    }
}
exports.ImportController = ImportController;
//# sourceMappingURL=ImportController.js.map