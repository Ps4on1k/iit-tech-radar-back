import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

/**
 * Миграция создает таблицу migration_snapshots для хранения истории завершенных миграций
 */
export class CreateMigrationSnapshotsTable1772700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу снапшотов завершенных миграций
    await queryRunner.createTable(
      new Table({
        name: 'migration_snapshots',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'tech_radar_id',
            type: 'uuid',
            isNullable: false,
            comment: 'Ссылка на технологию в tech_radar',
          },
          {
            name: 'tech_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            comment: 'Название технологии на момент завершения',
          },
          {
            name: 'version_before',
            type: 'varchar',
            length: '100',
            isNullable: false,
            comment: 'Версия технологии до миграции',
          },
          {
            name: 'version_after',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: 'Версия технологии после миграции',
          },
          {
            name: 'deadline',
            type: 'date',
            isNullable: true,
            comment: 'Дедлайн обновления',
          },
          {
            name: 'upgrade_path',
            type: 'text',
            isNullable: true,
            comment: 'Путь обновления (описание шагов)',
          },
          {
            name: 'recommended_alternatives',
            type: 'text',
            isNullable: true,
            comment: 'Рекомендованные альтернативы (JSON array)',
          },
          {
            name: 'priority',
            type: 'int',
            isNullable: false,
            default: '0',
            comment: 'Приоритет миграции',
          },
          {
            name: 'progress',
            type: 'int',
            isNullable: false,
            default: '100',
            comment: 'Финальный прогресс (всегда 100)',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: 'Дата завершения миграции',
          },
          {
            name: 'completed_by',
            type: 'uuid',
            isNullable: true,
            comment: 'ID пользователя, завершившего миграцию',
          },
        ],
      }),
      true
    );

    // Добавляем внешний ключ
    await queryRunner.createForeignKey(
      'migration_snapshots',
      new TableForeignKey({
        name: 'FK_MIGRATION_SNAPSHOTS_TECH_RADAR',
        columnNames: ['tech_radar_id'],
        referencedTableName: 'tech_radar',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Создаем индексы
    await queryRunner.createIndex(
      'migration_snapshots',
      new TableIndex({
        name: 'IDX_MIGRATION_SNAPSHOTS_TECH_RADAR_ID',
        columnNames: ['tech_radar_id'],
      })
    );

    await queryRunner.createIndex(
      'migration_snapshots',
      new TableIndex({
        name: 'IDX_MIGRATION_SNAPSHOTS_COMPLETED_AT',
        columnNames: ['completed_at'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('migration_snapshots', true);
  }
}
