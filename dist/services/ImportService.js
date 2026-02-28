"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportService = void 0;
const database_1 = require("../database");
const TechRadarEntity_1 = require("../models/TechRadarEntity");
// Валидация enum значений
const VALID_TYPES = ['фреймворк', 'библиотека', 'язык программирования', 'инструмент'];
const VALID_SUBTYPES = ['фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 'DevOps', 'SaaS', 'библиотека'];
const VALID_CATEGORIES = ['adopt', 'trial', 'assess', 'hold', 'drop'];
const VALID_MATURITY = ['experimental', 'active', 'stable', 'deprecated', 'end-of-life'];
const VALID_RISK_LEVEL = ['low', 'medium', 'high', 'critical'];
const VALID_SUPPORT_STATUS = ['active', 'limited', 'end-of-life', 'community-only'];
const VALID_PERFORMANCE_IMPACT = ['low', 'medium', 'high'];
const VALID_CONTRIBUTION_FREQUENCY = ['frequent', 'regular', 'occasional', 'rare', 'none'];
const VALID_COST_FACTOR = ['free', 'paid', 'subscription', 'enterprise'];
const VALID_BUSINESS_CRITICALITY = ['low', 'medium', 'high', 'critical'];
const VALID_CPU = ['низкие', 'средние', 'высокие', 'очень высокие'];
const VALID_MEMORY = ['низкие', 'средние', 'высокие', 'очень высокие'];
const VALID_STORAGE = ['минимальные', 'низкие', 'средние', 'высокие'];
class ImportService {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(TechRadarEntity_1.TechRadarEntity);
    }
    /**
     * Валидация одной сущности TechRadar
     */
    validateEntity(entity, index) {
        // Проверка обязательных полей
        const requiredFields = ['id', 'name', 'version', 'type', 'category', 'firstAdded', 'owner', 'maturity', 'riskLevel', 'license', 'supportStatus', 'businessCriticality'];
        for (const field of requiredFields) {
            if (entity[field] === undefined || entity[field] === null || entity[field] === '') {
                return {
                    index,
                    id: entity.id,
                    message: `Отсутствует обязательное поле: ${field}`,
                };
            }
        }
        // Проверка типов данных
        if (typeof entity.id !== 'string') {
            return { index, id: entity.id, message: 'Поле id должно быть строкой' };
        }
        if (typeof entity.name !== 'string') {
            return { index, id: entity.id, message: 'Поле name должно быть строкой' };
        }
        if (typeof entity.version !== 'string') {
            return { index, id: entity.id, message: 'Поле version должно быть строкой' };
        }
        // Валидация enum полей с защитой от SQL инъекций (строго заданные значения)
        if (entity.type && !VALID_TYPES.includes(entity.type)) {
            return { index, id: entity.id, message: `Недопустимое значение type: ${entity.type}` };
        }
        if (entity.subtype && !VALID_SUBTYPES.includes(entity.subtype)) {
            return { index, id: entity.id, message: `Недопустимое значение subtype: ${entity.subtype}` };
        }
        if (entity.category && !VALID_CATEGORIES.includes(entity.category)) {
            return { index, id: entity.id, message: `Недопустимое значение category: ${entity.category}` };
        }
        if (entity.maturity && !VALID_MATURITY.includes(entity.maturity)) {
            return { index, id: entity.id, message: `Недопустимое значение maturity: ${entity.maturity}` };
        }
        if (entity.riskLevel && !VALID_RISK_LEVEL.includes(entity.riskLevel)) {
            return { index, id: entity.id, message: `Недопустимое значение riskLevel: ${entity.riskLevel}` };
        }
        if (entity.supportStatus && !VALID_SUPPORT_STATUS.includes(entity.supportStatus)) {
            return { index, id: entity.id, message: `Недопустимое значение supportStatus: ${entity.supportStatus}` };
        }
        if (entity.performanceImpact && !VALID_PERFORMANCE_IMPACT.includes(entity.performanceImpact)) {
            return { index, id: entity.id, message: `Недопустимое значение performanceImpact: ${entity.performanceImpact}` };
        }
        if (entity.contributionFrequency && !VALID_CONTRIBUTION_FREQUENCY.includes(entity.contributionFrequency)) {
            return { index, id: entity.id, message: `Недопустимое значение contributionFrequency: ${entity.contributionFrequency}` };
        }
        if (entity.costFactor && !VALID_COST_FACTOR.includes(entity.costFactor)) {
            return { index, id: entity.id, message: `Недопустимое значение costFactor: ${entity.costFactor}` };
        }
        if (entity.businessCriticality && !VALID_BUSINESS_CRITICALITY.includes(entity.businessCriticality)) {
            return { index, id: entity.id, message: `Недопустимое значение businessCriticality: ${entity.businessCriticality}` };
        }
        // Валидация resourceRequirements
        if (entity.resourceRequirements) {
            if (entity.resourceRequirements.cpu && !VALID_CPU.includes(entity.resourceRequirements.cpu)) {
                return { index, id: entity.id, message: `Недопустимое значение resourceRequirements.cpu: ${entity.resourceRequirements.cpu}` };
            }
            if (entity.resourceRequirements.memory && !VALID_MEMORY.includes(entity.resourceRequirements.memory)) {
                return { index, id: entity.id, message: `Недопустимое значение resourceRequirements.memory: ${entity.resourceRequirements.memory}` };
            }
            if (entity.resourceRequirements.storage && !VALID_STORAGE.includes(entity.resourceRequirements.storage)) {
                return { index, id: entity.id, message: `Недопустимое значение resourceRequirements.storage: ${entity.resourceRequirements.storage}` };
            }
        }
        // Валидация числовых полей
        if (entity.adoptionRate !== undefined && entity.adoptionRate !== null) {
            if (typeof entity.adoptionRate !== 'number' || entity.adoptionRate < 0 || entity.adoptionRate > 1) {
                return { index, id: entity.id, message: 'adoptionRate должно быть числом от 0 до 1' };
            }
        }
        if (entity.popularityIndex !== undefined && entity.popularityIndex !== null) {
            if (typeof entity.popularityIndex !== 'number' || entity.popularityIndex < 0 || entity.popularityIndex > 1) {
                return { index, id: entity.id, message: 'popularityIndex должно быть числом от 0 до 1' };
            }
        }
        if (entity.communitySize !== undefined && entity.communitySize !== null) {
            if (typeof entity.communitySize !== 'number' || entity.communitySize < 0) {
                return { index, id: entity.id, message: 'communitySize должно быть неотрицательным числом' };
            }
        }
        // Валидация массивов
        const arrayFields = ['stakeholders', 'usageExamples', 'recommendedAlternatives', 'relatedTechnologies', 'securityVulnerabilities', 'complianceStandards'];
        for (const field of arrayFields) {
            if (entity[field] !== undefined && !Array.isArray(entity[field])) {
                return { index, id: entity.id, message: `Поле ${field} должно быть массивом` };
            }
        }
        // Валидация dependencies (массив объектов)
        if (entity.dependencies !== undefined && entity.dependencies !== null) {
            if (!Array.isArray(entity.dependencies)) {
                return { index, id: entity.id, message: 'dependencies должно быть массивом' };
            }
            for (let i = 0; i < entity.dependencies.length; i++) {
                const dep = entity.dependencies[i];
                if (!dep || typeof dep !== 'object') {
                    return { index, id: entity.id, message: `Зависимость [${i}] должна быть объектом` };
                }
                if (typeof dep.name !== 'string' || typeof dep.version !== 'string') {
                    return { index, id: entity.id, message: `Зависимость [${i}] должна иметь name и version (строки)` };
                }
            }
        }
        // Валидация compatibility (объект)
        if (entity.compatibility !== undefined && entity.compatibility !== null) {
            if (typeof entity.compatibility !== 'object' || Array.isArray(entity.compatibility)) {
                return { index, id: entity.id, message: 'compatibility должно быть объектом' };
            }
            const compatFields = ['os', 'browsers', 'frameworks'];
            for (const field of compatFields) {
                if (entity.compatibility[field] !== undefined && !Array.isArray(entity.compatibility[field])) {
                    return { index, id: entity.id, message: `compatibility.${field} должно быть массивом` };
                }
            }
        }
        // Валидация vendorLockIn (boolean)
        if (entity.vendorLockIn !== undefined && typeof entity.vendorLockIn !== 'boolean') {
            return { index, id: entity.id, message: 'vendorLockIn должно быть булевым значением' };
        }
        // Валидация дат (формат YYYY-MM-DD)
        const dateFields = ['versionReleaseDate', 'firstAdded', 'lastUpdated', 'endOfLifeDate'];
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        for (const field of dateFields) {
            if (entity[field] !== undefined && entity[field] !== null && entity[field] !== '') {
                if (typeof entity[field] !== 'string' || !dateRegex.test(entity[field])) {
                    return { index, id: entity.id, message: `Поле ${field} должно быть в формате YYYY-MM-DD` };
                }
            }
        }
        // Валидация URL полей
        const urlFields = ['documentationUrl', 'internalGuideUrl'];
        const urlRegex = /^https?:\/\/.+/;
        for (const field of urlFields) {
            if (entity[field] !== undefined && entity[field] !== null && entity[field] !== '') {
                if (typeof entity[field] !== 'string' || !urlRegex.test(entity[field])) {
                    return { index, id: entity.id, message: `Поле ${field} должно быть корректным URL` };
                }
            }
        }
        return null;
    }
    /**
     * Импорт технологий из JSON массива
     * Использует параметризованные запросы TypeORM для защиты от SQL инъекций
     */
    async importTechRadar(data, options) {
        const result = {
            success: true,
            imported: 0,
            skipped: 0,
            errors: [],
        };
        if (!Array.isArray(data)) {
            return {
                success: false,
                imported: 0,
                skipped: 0,
                errors: [{ index: -1, message: 'Данные должны быть массивом' }],
            };
        }
        const skipExisting = options?.skipExisting ?? false;
        const updateExisting = options?.updateExisting ?? false;
        // Предварительная проверка всех записей
        for (let i = 0; i < data.length; i++) {
            const error = this.validateEntity(data[i], i);
            if (error) {
                result.errors.push(error);
            }
        }
        // Если есть критические ошибки валидации, прерываем импорт
        if (result.errors.length > 0 && result.errors.some(e => e.message.includes('должно быть массивом'))) {
            result.success = false;
            return result;
        }
        // Импорт валидных записей с использованием транзакции
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (let i = 0; i < data.length; i++) {
                const entity = data[i];
                // Пропускаем записи с ошибками валидации
                if (result.errors.some(e => e.index === i)) {
                    result.skipped++;
                    continue;
                }
                try {
                    // Проверяем существование записи
                    const existing = await queryRunner.manager.findOne(TechRadarEntity_1.TechRadarEntity, {
                        where: { id: entity.id },
                    });
                    if (existing) {
                        if (skipExisting) {
                            result.skipped++;
                            continue;
                        }
                        if (updateExisting) {
                            // Обновляем существующую запись (TypeORM использует параметризованные запросы)
                            await queryRunner.manager.update(TechRadarEntity_1.TechRadarEntity, entity.id, entity);
                            result.imported++;
                            continue;
                        }
                    }
                    // Создаем новую запись (TypeORM использует параметризованные запросы)
                    const techRadarEntity = queryRunner.manager.create(TechRadarEntity_1.TechRadarEntity, entity);
                    await queryRunner.manager.save(TechRadarEntity_1.TechRadarEntity, techRadarEntity);
                    result.imported++;
                }
                catch (error) {
                    result.errors.push({
                        index: i,
                        id: entity.id,
                        message: error.message || 'Ошибка при сохранении записи',
                    });
                }
            }
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            result.success = false;
            result.errors.push({
                index: -1,
                message: `Ошибка транзакции: ${error.message}`,
            });
        }
        finally {
            await queryRunner.release();
        }
        return result;
    }
    /**
     * Экспорт всех технологий в JSON
     */
    async exportTechRadar() {
        return this.repository.find();
    }
}
exports.ImportService = ImportService;
//# sourceMappingURL=ImportService.js.map