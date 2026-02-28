"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechRadarController = void 0;
const config_1 = require("../config");
const services_1 = require("../services");
const database_1 = require("../database");
const models_1 = require("../models");
let techRadarRepo;
let validationService;
if (config_1.config.dbMode === 'database') {
    const repository = database_1.AppDataSource.getRepository(models_1.TechRadarEntity);
    techRadarRepo = new services_1.DatabaseTechRadarRepository(repository);
    validationService = new services_1.TechRadarValidationService();
}
else {
    techRadarRepo = new services_1.MockTechRadarRepository();
    validationService = new services_1.TechRadarValidationService();
}
class TechRadarController {
    constructor() {
        this.getAll = async (req, res) => {
            try {
                const data = await techRadarRepo.findAll();
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении данных' });
            }
        };
        this.getById = async (req, res) => {
            try {
                const id = String(req.params.id);
                const data = await techRadarRepo.findById(id);
                if (!data) {
                    res.status(404).json({ error: 'Технология не найдена' });
                    return;
                }
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении данных' });
            }
        };
        this.getFiltered = async (req, res) => {
            try {
                const query = req.query;
                const filters = {};
                const category = query.category;
                const type = query.type;
                const subtype = query.subtype;
                const maturity = query.maturity;
                const search = query.search;
                const sortBy = query.sortBy;
                const sortOrder = query.sortOrder;
                if (category && typeof category === 'string')
                    filters.category = category;
                if (type && typeof type === 'string')
                    filters.type = type;
                if (subtype && typeof subtype === 'string')
                    filters.subtype = subtype;
                if (maturity && typeof maturity === 'string')
                    filters.maturity = maturity;
                if (search && typeof search === 'string')
                    filters.search = search;
                let data = await techRadarRepo.findFiltered(filters);
                // Сортировка
                if (sortBy && typeof sortBy === 'string') {
                    const field = sortBy;
                    const order = sortOrder === 'desc' ? -1 : 1;
                    data = data.sort((a, b) => {
                        const aVal = a[field];
                        const bVal = b[field];
                        if (aVal === undefined || bVal === undefined)
                            return 0;
                        if (typeof aVal === 'string' && typeof bVal === 'string') {
                            return order * aVal.localeCompare(bVal);
                        }
                        if (typeof aVal === 'number' && typeof bVal === 'number') {
                            return order * (aVal - bVal);
                        }
                        return 0;
                    });
                }
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при фильтрации данных' });
            }
        };
        this.getStatistics = async (req, res) => {
            try {
                const stats = await techRadarRepo.getStatistics();
                res.json(stats);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении статистики' });
            }
        };
        this.getByCategory = async (req, res) => {
            try {
                const category = String(req.params.category);
                const data = await techRadarRepo.findByCategory(category);
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении данных' });
            }
        };
        this.getByType = async (req, res) => {
            try {
                const type = String(req.params.type);
                const data = await techRadarRepo.findByType(type);
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при получении данных' });
            }
        };
        this.search = async (req, res) => {
            try {
                const q = req.query.q;
                if (!q || (typeof q !== 'string')) {
                    res.status(400).json({ error: 'Требуется параметр поиска q' });
                    return;
                }
                const data = await techRadarRepo.search(q);
                res.json(data);
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при поиске' });
            }
        };
        this.create = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может создавать технологии' });
                    return;
                }
                const entity = req.body;
                // Валидация схемы
                const validationResult = validationService.validate(entity, false);
                if (!validationResult.valid) {
                    res.status(400).json({
                        error: 'Ошибка валидации данных',
                        details: validationResult.errors,
                    });
                    return;
                }
                const saved = await techRadarRepo.save(entity);
                res.status(201).json(saved);
            }
            catch (error) {
                res.status(500).json({ error: `Ошибка при создании записи: ${error.message}` });
            }
        };
        this.update = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может редактировать технологии' });
                    return;
                }
                const id = String(req.params.id);
                const updateData = req.body;
                // Проверка существования записи
                const existing = await techRadarRepo.findById(id);
                if (!existing) {
                    res.status(404).json({ error: 'Технология не найдена' });
                    return;
                }
                // Валидация схемы (isUpdate=true для частичной валидации)
                const validationResult = validationService.validate(updateData, true);
                if (!validationResult.valid) {
                    res.status(400).json({
                        error: 'Ошибка валидации данных',
                        details: validationResult.errors,
                    });
                    return;
                }
                // Проверка что ID в теле совпадает с ID в пути (если указан)
                if (updateData.id && updateData.id !== id) {
                    res.status(400).json({ error: 'ID в теле запроса должен совпадать с ID в пути' });
                    return;
                }
                const entity = { ...existing, ...updateData, id };
                const updated = await techRadarRepo.save(entity);
                res.json(updated);
            }
            catch (error) {
                res.status(500).json({ error: `Ошибка при обновлении записи: ${error.message}` });
            }
        };
        this.delete = async (req, res) => {
            try {
                const authReq = req;
                if (!authReq.user || authReq.user.role !== 'admin') {
                    res.status(403).json({ error: 'Только администратор может удалять технологии' });
                    return;
                }
                const id = String(req.params.id);
                const deleted = await techRadarRepo.delete(id);
                if (!deleted) {
                    res.status(404).json({ error: 'Технология не найдена' });
                    return;
                }
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: 'Ошибка при удалении записи' });
            }
        };
    }
}
exports.TechRadarController = TechRadarController;
//# sourceMappingURL=TechRadarController.js.map