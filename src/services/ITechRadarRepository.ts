import { TechRadarEntity } from '../models/TechRadarEntity';

/**
 * Интерфейс репозитория для работы с технологиями Tech Radar
 * Позволяет легко переключаться между источниками данных (Mock, Database, Cache, etc.)
 */
export interface ITechRadarRepository {
  /** Получить все технологии */
  findAll(): Promise<TechRadarEntity[]>;

  /** Получить технологию по ID */
  findById(id: string): Promise<TechRadarEntity | undefined>;

  /** Получить технологии по категории */
  findByCategory(category: string): Promise<TechRadarEntity[]>;

  /** Получить технологии по типу */
  findByType(type: string): Promise<TechRadarEntity[]>;

  /** Получить технологии по подтипу */
  findBySubtype(subtype: string): Promise<TechRadarEntity[]>;

  /** Поиск технологий по названию или описанию */
  search(query: string): Promise<TechRadarEntity[]>;

  /** Получить технологии с фильтрами */
  findFiltered(filters: {
    category?: string;
    type?: string;
    subtype?: string;
    maturity?: string;
    search?: string;
  }): Promise<TechRadarEntity[]>;

  /** Сохранить технологию (создать или обновить) */
  save(entity: TechRadarEntity): Promise<TechRadarEntity>;

  /** Удалить технологию по ID */
  delete(id: string): Promise<boolean>;

  /** Получить статистику по технологиям */
  getStatistics(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
    bySubtype: Record<string, number>;
  }>;
}
