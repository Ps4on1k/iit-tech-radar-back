/**
 * Констаннты и enum значения для Tech Radar
 * Единый источник истины для всех типов и валидаций
 */

// Типы технологий
export const TECH_RADAR_TYPES = ['фреймворк', 'библиотека', 'язык программирования', 'инструмент'] as const;
export type TechRadarType = typeof TECH_RADAR_TYPES[number];

// Подтипы технологий
export const TECH_RADAR_SUBTYPES = [
  'фронтенд',
  'бэкенд',
  'мобильная разработка',
  'инфраструктура',
  'аналитика',
  'DevOps',
  'SaaS',
  'библиотека',
  'data engineering',
  'AI',
  'observability',
  'базы данных',
  'тестирование',
  'автотесты',
  'нагрузочные тесты',
  'безопасность',
  'очереди',
  'desktop',
  'прочее',
] as const;
export type TechRadarSubtype = typeof TECH_RADAR_SUBTYPES[number];

// Категории радара
export const TECH_RADAR_CATEGORIES = ['adopt', 'trial', 'assess', 'hold', 'drop'] as const;
export type TechRadarCategory = typeof TECH_RADAR_CATEGORIES[number];

// Уровни зрелости
export const TECH_RADAR_MATURITY = ['experimental', 'active', 'stable', 'deprecated', 'end-of-life'] as const;
export type TechRadarMaturity = typeof TECH_RADAR_MATURITY[number];

// Уровни риска
export const TECH_RADAR_RISK_LEVEL = ['low', 'medium', 'high', 'critical'] as const;
export type TechRadarRiskLevel = typeof TECH_RADAR_RISK_LEVEL[number];

// Статусы поддержки
export const TECH_RADAR_SUPPORT_STATUS = ['active', 'limited', 'end-of-life', 'community-only'] as const;
export type TechRadarSupportStatus = typeof TECH_RADAR_SUPPORT_STATUS[number];

// Уровни производительности
export const TECH_RADAR_PERFORMANCE_IMPACT = ['low', 'medium', 'high'] as const;
export type TechRadarPerformanceImpact = typeof TECH_RADAR_PERFORMANCE_IMPACT[number];

// Частота участия
export const TECH_RADAR_CONTRIBUTION_FREQUENCY = ['frequent', 'regular', 'occasional', 'rare', 'none'] as const;
export type TechRadarContributionFrequency = typeof TECH_RADAR_CONTRIBUTION_FREQUENCY[number];

// Типы стоимости
export const TECH_RADAR_COST_FACTOR = ['free', 'paid', 'subscription', 'enterprise'] as const;
export type TechRadarCostFactor = typeof TECH_RADAR_COST_FACTOR[number];

// Бизнес-критичность
export const TECH_RADAR_BUSINESS_CRITICALITY = ['low', 'medium', 'high', 'critical'] as const;
export type TechRadarBusinessCriticality = typeof TECH_RADAR_BUSINESS_CRITICALITY[number];

// Требования к CPU
export const TECH_RADAR_CPU = ['низкие', 'средние', 'высокие', 'очень высокие'] as const;
export type TechRadarCpu = typeof TECH_RADAR_CPU[number];

// Требования к памяти
export const TECH_RADAR_MEMORY = ['низкие', 'средние', 'высокие', 'очень высокие'] as const;
export type TechRadarMemory = typeof TECH_RADAR_MEMORY[number];

// Требования к хранилищу
export const TECH_RADAR_STORAGE = ['минимальные', 'низкие', 'средние', 'высокие'] as const;
export type TechRadarStorage = typeof TECH_RADAR_STORAGE[number];

// Вспомогательные функции для валидации
export function isValidTechRadarType(value: string): value is TechRadarType {
  return TECH_RADAR_TYPES.includes(value as TechRadarType);
}

export function isValidTechRadarSubtype(value: string): value is TechRadarSubtype {
  return TECH_RADAR_SUBTYPES.includes(value as TechRadarSubtype);
}

export function isValidTechRadarCategory(value: string): value is TechRadarCategory {
  return TECH_RADAR_CATEGORIES.includes(value as TechRadarCategory);
}

export function isValidTechRadarMaturity(value: string): value is TechRadarMaturity {
  return TECH_RADAR_MATURITY.includes(value as TechRadarMaturity);
}

export function isValidTechRadarRiskLevel(value: string): value is TechRadarRiskLevel {
  return TECH_RADAR_RISK_LEVEL.includes(value as TechRadarRiskLevel);
}

export function isValidTechRadarSupportStatus(value: string): value is TechRadarSupportStatus {
  return TECH_RADAR_SUPPORT_STATUS.includes(value as TechRadarSupportStatus);
}

export function isValidTechRadarPerformanceImpact(value: string): value is TechRadarPerformanceImpact {
  return TECH_RADAR_PERFORMANCE_IMPACT.includes(value as TechRadarPerformanceImpact);
}

export function isValidTechRadarContributionFrequency(value: string): value is TechRadarContributionFrequency {
  return TECH_RADAR_CONTRIBUTION_FREQUENCY.includes(value as TechRadarContributionFrequency);
}

export function isValidTechRadarCostFactor(value: string): value is TechRadarCostFactor {
  return TECH_RADAR_COST_FACTOR.includes(value as TechRadarCostFactor);
}

export function isValidTechRadarBusinessCriticality(value: string): value is TechRadarBusinessCriticality {
  return TECH_RADAR_BUSINESS_CRITICALITY.includes(value as TechRadarBusinessCriticality);
}

export function isValidTechRadarCpu(value: string): value is TechRadarCpu {
  return TECH_RADAR_CPU.includes(value as TechRadarCpu);
}

export function isValidTechRadarMemory(value: string): value is TechRadarMemory {
  return TECH_RADAR_MEMORY.includes(value as TechRadarMemory);
}

export function isValidTechRadarStorage(value: string): value is TechRadarStorage {
  return TECH_RADAR_STORAGE.includes(value as TechRadarStorage);
}
