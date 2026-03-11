import { MigrationStatus } from '../models/MigrationMetadataEntity';

/**
 * DTO для создания метаданных миграции
 */
export class CreateMigrationMetadataDto {
  /**
   * UUID технологии TechRadar
   */
  techRadarId!: string;

  /**
   * Приоритет миграции (опционально, по умолчанию 0)
   */
  priority?: number;

  /**
   * Статус миграции (опционально, по умолчанию backlog)
   */
  status?: MigrationStatus;

  /**
   * Прогресс выполнения (опционально, по умолчанию 0)
   */
  progress?: number;
}

/**
 * DTO для обновления метаданных миграции
 */
export class UpdateMigrationMetadataDto {
  /**
   * Приоритет миграции
   */
  priority?: number;

  /**
   * Статус миграции
   */
  status?: MigrationStatus;

  /**
   * Прогресс выполнения (0-100)
   */
  progress?: number;
}

/**
 * DTO для массового обновления приоритетов
 */
export class UpdateMigrationPrioritiesDto {
  /**
   * Массив объектов с id и приоритетом
   */
  items!: Array<{
    id: string;
    priority: number;
  }>;
}

/**
 * DTO для ответа с объединенными данными миграции (из VIEW)
 */
export class MigrationMetadataViewDto {
  /**
   * UUID технологии TechRadar
   */
  techRadarId!: string;

  /**
   * Название технологии
   */
  techName!: string;

  /**
   * Текущая версия
   */
  currentVersion!: string;

  /**
   * Версия для обновления
   */
  versionToUpdate?: string;

  /**
   * Дедлайн обновления
   */
  versionUpdateDeadline?: string;

  /**
   * Путь обновления
   */
  upgradePath?: string;

  /**
   * Рекомендованные альтернативы (JSON array)
   */
  recommendedAlternatives?: string;

  /**
   * UUID метаданных (генерируется если нет записи)
   */
  metadataId!: string;

  /**
   * Приоритет миграции
   */
  priority!: number;

  /**
   * Статус миграции
   */
  status!: MigrationStatus;

  /**
   * Прогресс выполнения
   */
  progress!: number;

  /**
   * Дата создания
   */
  createdAt!: Date;

  /**
   * Дата обновления
   */
  updatedAt!: Date;

  /**
   * Есть ли запись в migration_metadata
   */
  hasMetadata!: boolean;
}
