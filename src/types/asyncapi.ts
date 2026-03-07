/**
 * AsyncAPI типы для обмена сообщениями через RabbitMQ
 * Соответствуют спецификации asyncapi.yaml
 */

/**
 * Конфигурация AI для поля
 */
export interface AIFieldConfig {
  enabled?: boolean;
  prompt?: string;
  required?: boolean;
  priority?: number;
  fallbackValue?: any;
}

/**
 * Конфигурация AI для полей TechRadar
 */
export interface AIConfig {
  /** Общий промпт для всего запроса */
  prompt?: string;
  /** Конфигурация для конкретных полей */
  fields?: Record<string, AIFieldConfig>;
}

/**
 * Сущность TechRadar
 */
export interface TechRadarEntity {
  id?: string;
  name?: string;
  version?: string;
  versionReleaseDate?: string;
  type?: 'фреймворк' | 'библиотека' | 'язык программирования' | 'инструмент' | 'framework' | 'library' | 'programming language' | 'tool';
  subtype?: string;
  category?: 'adopt' | 'trial' | 'assess' | 'hold' | 'drop';
  description?: string;
  firstAdded?: string;
  lastUpdated?: string;
  owner?: string;
  stakeholders?: string[];
  dependencies?: Array<{ name: string; version: string; optional?: boolean }>;
  maturity?: 'experimental' | 'active' | 'stable' | 'deprecated' | 'end-of-life';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  license?: string;
  usageExamples?: string[];
  documentationUrl?: string;
  internalGuideUrl?: string;
  adoptionRate?: number;
  recommendedAlternatives?: string[];
  relatedTechnologies?: string[];
  endOfLifeDate?: string;
  supportStatus?: 'active' | 'limited' | 'end-of-life' | 'community-only';
  upgradePath?: string;
  performanceImpact?: 'low' | 'medium' | 'high';
  resourceRequirements?: {
    cpu?: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    memory?: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
    storage?: 'минимальные' | 'низкие' | 'средние' | 'высокие';
  };
  securityVulnerabilities?: string[];
  complianceStandards?: string[];
  communitySize?: number;
  contributionFrequency?: 'frequent' | 'regular' | 'occasional' | 'rare' | 'none';
  popularityIndex?: number;
  compatibility?: {
    os?: string[];
    browsers?: string[];
    frameworks?: string[];
  };
  costFactor?: 'free' | 'paid' | 'subscription' | 'enterprise';
  vendorLockIn?: boolean;
  businessCriticality?: 'low' | 'medium' | 'high' | 'critical';
  versionToUpdate?: string;
  versionUpdateDeadline?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Запрос на обновление полей технологии (Single Request)
 */
export interface UpdateRequest {
  /** Уникальный ID запроса */
  correlationId: string;
  /** ID технологии для обновления */
  technologyId: string;
  /** AI конфигурация для полей */
  aiConfig?: AIConfig;
  /** Поля для обновления с новыми значениями */
  fieldsToUpdate?: Record<string, any>;
  /** Текущие данные технологии */
  currentData?: TechRadarEntity;
  /** Причина обновления */
  reason?: string;
  /** Триггер обновления */
  trigger?: string;
  /** Приоритет обработки */
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

/**
 * Запрос на массовое обновление
 */
export interface BulkUpdateRequest {
  /** Уникальный ID массового запроса */
  correlationId: string;
  /** Список запросов на обновление */
  requests: Array<{
    technologyId: string;
    aiConfig?: AIConfig;
    fieldsToUpdate?: Record<string, any>;
    currentData?: TechRadarEntity;
  }>;
  /** Режим выполнения */
  mode?: 'parallel' | 'sequential';
  /** Максимальное количество параллельных задач */
  maxConcurrency?: number;
  /** Общая AI конфигурация для всех запросов */
  aiConfig?: AIConfig;
}

/**
 * Поле, которое не удалось обновить
 */
export interface FailedField {
  fieldName: string;
  reason: string;
  originalValue?: any;
}

/**
 * Ответ на запрос обновления (Single Response)
 */
export interface UpdateResponse {
  /** ID исходного запроса */
  correlationId: string;
  /** ID обновленной технологии */
  technologyId: string;
  /** Статус выполнения */
  status: 'success' | 'partial' | 'error';
  /** Обновленные поля */
  updatedFields: Record<string, any>;
  /** Поля, которые не удалось обновить */
  failedFields: FailedField[];
  /** Сообщение от AI агента */
  aiMessage?: string;
  /** Использованные источники данных */
  sources?: string[];
  /** Детали ошибки */
  error?: {
    code: string;
    message: string;
  };
  /** Время обработки в мс */
  processingTimeMs?: number;
}

/**
 * Результат массового обновления
 */
export interface BulkUpdateResult {
  technologyId: string;
  status: 'success' | 'error';
  response?: UpdateResponse;
  error?: string;
}

/**
 * Ответ на массовый запрос
 */
export interface BulkUpdateResponse {
  /** ID исходного запроса */
  correlationId: string;
  /** Общий статус выполнения */
  status: 'success' | 'partial' | 'error';
  /** Результаты по каждому запросу */
  results: BulkUpdateResult[];
  /** Сводная статистика */
  summary: {
    total: number;
    success: number;
    failed: number;
  };
  /** Общее время выполнения в мс */
  totalExecutionTimeMs?: number;
}

/**
 * Тип сообщения для обработки
 */
export type RequestMessage = UpdateRequest | BulkUpdateRequest;
export type ResponseMessage = UpdateResponse | BulkUpdateResponse;
