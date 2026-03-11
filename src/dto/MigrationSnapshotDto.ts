/**
 * DTO для создания снапшота миграции
 */
export class CreateMigrationSnapshotDto {
  /**
   * UUID технологии TechRadar
   */
  techRadarId!: string;

  /**
   * Название технологии
   */
  techName!: string;

  /**
   * Версия технологии до миграции
   */
  versionBefore!: string;

  /**
   * Версия технологии после миграции
   */
  versionAfter?: string;

  /**
   * Дедлайн обновления
   */
  deadline?: string;

  /**
   * Путь обновления
   */
  upgradePath?: string;

  /**
   * Рекомендованные альтернативы
   */
  recommendedAlternatives?: string;

  /**
   * Приоритет миграции
   */
  priority?: number;

  /**
   * ID пользователя, завершившего миграцию
   */
  completedBy?: string;
}

/**
 * DTO для ответа со снапшотом миграции
 */
export class MigrationSnapshotDto {
  /**
   * UUID снапшота
   */
  id!: string;

  /**
   * UUID технологии TechRadar
   */
  techRadarId!: string;

  /**
   * Название технологии
   */
  techName!: string;

  /**
   * Версия технологии до миграции
   */
  versionBefore!: string;

  /**
   * Версия технологии после миграции
   */
  versionAfter?: string;

  /**
   * Дедлайн обновления
   */
  deadline?: string;

  /**
   * Путь обновления
   */
  upgradePath?: string;

  /**
   * Рекомендованные альтернативы
   */
  recommendedAlternatives?: string;

  /**
   * Приоритет миграции
   */
  priority!: number;

  /**
   * Прогресс (всегда 100)
   */
  progress!: number;

  /**
   * Дата завершения миграции
   */
  completedAt!: Date;

  /**
   * ID пользователя, завершившего миграцию
   */
  completedBy?: string;
}
