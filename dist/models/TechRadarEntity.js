"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechRadarEntity = void 0;
const typeorm_1 = require("typeorm");
let TechRadarEntity = class TechRadarEntity {
};
exports.TechRadarEntity = TechRadarEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar'),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "versionReleaseDate", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['фреймворк', 'библиотека', 'язык программирования', 'инструмент'],
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['фронтенд', 'бэкенд', 'мобильная разработка', 'инфраструктура', 'аналитика', 'DevOps', 'SaaS', 'библиотека'],
        nullable: true,
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "subtype", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['adopt', 'trial', 'assess', 'hold', 'drop'],
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('date'),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "firstAdded", void 0);
__decorate([
    (0, typeorm_1.Column)('date', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "lastUpdated", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "stakeholders", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "dependencies", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['experimental', 'active', 'stable', 'deprecated', 'end-of-life'],
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "maturity", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['low', 'medium', 'high', 'critical'],
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar'),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "license", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "usageExamples", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "documentationUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "internalGuideUrl", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 2, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TechRadarEntity.prototype, "adoptionRate", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "recommendedAlternatives", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "relatedTechnologies", void 0);
__decorate([
    (0, typeorm_1.Column)('date', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "endOfLifeDate", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['active', 'limited', 'end-of-life', 'community-only'],
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "supportStatus", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { nullable: true }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "upgradePath", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['low', 'medium', 'high'],
        nullable: true,
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "performanceImpact", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], TechRadarEntity.prototype, "resourceRequirements", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "securityVulnerabilities", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], TechRadarEntity.prototype, "complianceStandards", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { nullable: true }),
    __metadata("design:type", Number)
], TechRadarEntity.prototype, "communitySize", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['frequent', 'regular', 'occasional', 'rare', 'none'],
        nullable: true,
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "contributionFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 2, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], TechRadarEntity.prototype, "popularityIndex", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-json', { nullable: true }),
    __metadata("design:type", Object)
], TechRadarEntity.prototype, "compatibility", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['free', 'paid', 'subscription', 'enterprise'],
        nullable: true,
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "costFactor", void 0);
__decorate([
    (0, typeorm_1.Column)('boolean', { default: false }),
    __metadata("design:type", Boolean)
], TechRadarEntity.prototype, "vendorLockIn", void 0);
__decorate([
    (0, typeorm_1.Column)('enum', {
        enum: ['low', 'medium', 'high', 'critical'],
    }),
    __metadata("design:type", String)
], TechRadarEntity.prototype, "businessCriticality", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TechRadarEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TechRadarEntity.prototype, "updatedAt", void 0);
exports.TechRadarEntity = TechRadarEntity = __decorate([
    (0, typeorm_1.Entity)('tech_radar')
], TechRadarEntity);
//# sourceMappingURL=TechRadarEntity.js.map