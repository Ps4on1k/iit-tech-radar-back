"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechRadarValidationService = void 0;
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
class TechRadarValidationService {
    constructor() {
        this.repository = database_1.AppDataSource.getRepository(TechRadarEntity_1.TechRadarEntity);
    }
    /**
     * Валидация сущности TechRadar при создании/обновлении
     */
    validate(entity, isUpdate = false) {
        const errors = [];
        const entityAny = entity;
        // Для обновления некоторые поля не обязательны
        if (!isUpdate) {
            const requiredFields = ['id', 'name', 'version', 'type', 'category', 'firstAdded', 'owner', 'maturity', 'riskLevel', 'license', 'supportStatus', 'businessCriticality'];
            for (const field of requiredFields) {
                if (entityAny[field] === undefined || entityAny[field] === null || entityAny[field] === '') {
                    errors.push({ field, message: `Отсутствует обязательное поле: ${field}` });
                }
            }
        }
        // Проверка типов данных для предоставленных полей
        if (entity.id !== undefined && typeof entity.id !== 'string') {
            errors.push({ field: 'id', message: 'Поле id должно быть строкой' });
        }
        if (entity.name !== undefined && typeof entity.name !== 'string') {
            errors.push({ field: 'name', message: 'Поле name должно быть строкой' });
        }
        if (entity.version !== undefined && typeof entity.version !== 'string') {
            errors.push({ field: 'version', message: 'Поле version должно быть строкой' });
        }
        if (entity.owner !== undefined && typeof entity.owner !== 'string') {
            errors.push({ field: 'owner', message: 'Поле owner должно быть строкой' });
        }
        if (entity.license !== undefined && typeof entity.license !== 'string') {
            errors.push({ field: 'license', message: 'Поле license должно быть строкой' });
        }
        if (entity.description !== undefined && typeof entity.description !== 'string') {
            errors.push({ field: 'description', message: 'Поле description должно быть строкой' });
        }
        if (entity.upgradePath !== undefined && typeof entity.upgradePath !== 'string') {
            errors.push({ field: 'upgradePath', message: 'Поле upgradePath должно быть строкой' });
        }
        // Валидация enum полей
        if (entity.type !== undefined && !VALID_TYPES.includes(entity.type)) {
            errors.push({ field: 'type', message: `Недопустимое значение type: ${entity.type}` });
        }
        if (entity.subtype !== undefined && !VALID_SUBTYPES.includes(entity.subtype)) {
            errors.push({ field: 'subtype', message: `Недопустимое значение subtype: ${entity.subtype}` });
        }
        if (entity.category !== undefined && !VALID_CATEGORIES.includes(entity.category)) {
            errors.push({ field: 'category', message: `Недопустимое значение category: ${entity.category}` });
        }
        if (entity.maturity !== undefined && !VALID_MATURITY.includes(entity.maturity)) {
            errors.push({ field: 'maturity', message: `Недопустимое значение maturity: ${entity.maturity}` });
        }
        if (entity.riskLevel !== undefined && !VALID_RISK_LEVEL.includes(entity.riskLevel)) {
            errors.push({ field: 'riskLevel', message: `Недопустимое значение riskLevel: ${entity.riskLevel}` });
        }
        if (entity.supportStatus !== undefined && !VALID_SUPPORT_STATUS.includes(entity.supportStatus)) {
            errors.push({ field: 'supportStatus', message: `Недопустимое значение supportStatus: ${entity.supportStatus}` });
        }
        if (entity.performanceImpact !== undefined && !VALID_PERFORMANCE_IMPACT.includes(entity.performanceImpact)) {
            errors.push({ field: 'performanceImpact', message: `Недопустимое значение performanceImpact: ${entity.performanceImpact}` });
        }
        if (entity.contributionFrequency !== undefined && !VALID_CONTRIBUTION_FREQUENCY.includes(entity.contributionFrequency)) {
            errors.push({ field: 'contributionFrequency', message: `Недопустимое значение contributionFrequency: ${entity.contributionFrequency}` });
        }
        if (entity.costFactor !== undefined && !VALID_COST_FACTOR.includes(entity.costFactor)) {
            errors.push({ field: 'costFactor', message: `Недопустимое значение costFactor: ${entity.costFactor}` });
        }
        if (entity.businessCriticality !== undefined && !VALID_BUSINESS_CRITICALITY.includes(entity.businessCriticality)) {
            errors.push({ field: 'businessCriticality', message: `Недопустимое значение businessCriticality: ${entity.businessCriticality}` });
        }
        // Валидация resourceRequirements
        if (entity.resourceRequirements !== undefined) {
            if (entity.resourceRequirements.cpu && !VALID_CPU.includes(entity.resourceRequirements.cpu)) {
                errors.push({ field: 'resourceRequirements.cpu', message: `Недопустимое значение cpu: ${entity.resourceRequirements.cpu}` });
            }
            if (entity.resourceRequirements.memory && !VALID_MEMORY.includes(entity.resourceRequirements.memory)) {
                errors.push({ field: 'resourceRequirements.memory', message: `Недопустимое значение memory: ${entity.resourceRequirements.memory}` });
            }
            if (entity.resourceRequirements.storage && !VALID_STORAGE.includes(entity.resourceRequirements.storage)) {
                errors.push({ field: 'resourceRequirements.storage', message: `Недопустимое значение storage: ${entity.resourceRequirements.storage}` });
            }
        }
        // Валидация числовых полей
        if (entity.adoptionRate !== undefined && entity.adoptionRate !== null) {
            if (typeof entity.adoptionRate !== 'number' || entity.adoptionRate < 0 || entity.adoptionRate > 1) {
                errors.push({ field: 'adoptionRate', message: 'adoptionRate должно быть числом от 0 до 1' });
            }
        }
        if (entity.popularityIndex !== undefined && entity.popularityIndex !== null) {
            if (typeof entity.popularityIndex !== 'number' || entity.popularityIndex < 0 || entity.popularityIndex > 1) {
                errors.push({ field: 'popularityIndex', message: 'popularityIndex должно быть числом от 0 до 1' });
            }
        }
        if (entity.communitySize !== undefined && entity.communitySize !== null) {
            if (typeof entity.communitySize !== 'number' || entity.communitySize < 0) {
                errors.push({ field: 'communitySize', message: 'communitySize должно быть неотрицательным числом' });
            }
        }
        // Валидация массивов
        const arrayFields = ['stakeholders', 'usageExamples', 'recommendedAlternatives', 'relatedTechnologies', 'securityVulnerabilities', 'complianceStandards'];
        for (const field of arrayFields) {
            if (entityAny[field] !== undefined && !Array.isArray(entityAny[field])) {
                errors.push({ field, message: `Поле ${field} должно быть массивом` });
            }
        }
        // Валидация dependencies
        if (entity.dependencies !== undefined && entity.dependencies !== null) {
            if (!Array.isArray(entity.dependencies)) {
                errors.push({ field: 'dependencies', message: 'dependencies должно быть массивом' });
            }
            else {
                for (let i = 0; i < entity.dependencies.length; i++) {
                    const dep = entity.dependencies[i];
                    if (!dep || typeof dep !== 'object') {
                        errors.push({ field: `dependencies[${i}]`, message: 'Зависимость должна быть объектом' });
                    }
                    else if (typeof dep.name !== 'string' || typeof dep.version !== 'string') {
                        errors.push({ field: `dependencies[${i}]`, message: 'Зависимость должна иметь name и version (строки)' });
                    }
                }
            }
        }
        // Валидация compatibility
        if (entity.compatibility !== undefined && entity.compatibility !== null) {
            if (typeof entity.compatibility !== 'object' || Array.isArray(entity.compatibility)) {
                errors.push({ field: 'compatibility', message: 'compatibility должно быть объектом' });
            }
            else {
                const compatFields = ['os', 'browsers', 'frameworks'];
                for (const field of compatFields) {
                    if (entity.compatibility[field] !== undefined && !Array.isArray(entity.compatibility[field])) {
                        errors.push({ field: `compatibility.${field}`, message: `compatibility.${field} должно быть массивом` });
                    }
                }
            }
        }
        // Валидация vendorLockIn
        if (entity.vendorLockIn !== undefined && typeof entity.vendorLockIn !== 'boolean') {
            errors.push({ field: 'vendorLockIn', message: 'vendorLockIn должно быть булевым значением' });
        }
        // Валидация дат
        const dateFields = ['versionReleaseDate', 'firstAdded', 'lastUpdated', 'endOfLifeDate'];
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        for (const field of dateFields) {
            const fieldValue = entityAny[field];
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                if (typeof fieldValue !== 'string' || !dateRegex.test(fieldValue)) {
                    errors.push({ field, message: `Поле ${field} должно быть в формате YYYY-MM-DD` });
                }
            }
        }
        // Валидация URL
        const urlFields = ['documentationUrl', 'internalGuideUrl'];
        const urlRegex = /^https?:\/\/.+/;
        for (const field of urlFields) {
            const fieldValue = entityAny[field];
            if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
                if (typeof fieldValue !== 'string' || !urlRegex.test(fieldValue)) {
                    errors.push({ field, message: `Поле ${field} должно быть корректным URL` });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Проверка существования сущности по ID
     */
    async existsById(id) {
        const count = await this.repository.count({ where: { id } });
        return count > 0;
    }
}
exports.TechRadarValidationService = TechRadarValidationService;
//# sourceMappingURL=TechRadarValidationService.js.map