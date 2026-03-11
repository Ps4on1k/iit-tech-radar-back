import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Миграция создает таблицу migration_metadata для хранения метаданных миграций
 * и VIEW для объединения с данными tech_radar
 * Отдельная таблица для связи с tech_radar по UUID ключу
 */
export class CreateMigrationMetadataTable1772600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу метаданных миграции
    await queryRunner.createTable(
      new Table({
        name: 'migration_metadata',
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
            isUnique: true,
            isNullable: false,
            comment: 'Ссылка на технологию в tech_radar',
          },
          {
            name: 'priority',
            type: 'int',
            isNullable: false,
            default: '0',
            comment: 'Приоритет миграции (порядок сортировки)',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            default: "'backlog'",
            comment: 'Статус миграции: backlog, planned, in_progress, completed',
          },
          {
            name: 'progress',
            type: 'int',
            isNullable: false,
            default: '0',
            comment: 'Прогресс выполнения (0-100)',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            name: 'FK_MIGRATION_METADATA_TECH_RADAR',
            columnNames: ['tech_radar_id'],
            referencedTableName: 'tech_radar',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
        indices: [
          {
            name: 'IDX_MIGRATION_METADATA_PRIORITY',
            columnNames: ['priority'],
          },
          {
            name: 'IDX_MIGRATION_METADATA_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_MIGRATION_METADATA_TECH_RADAR_ID',
            columnNames: ['tech_radar_id'],
          },
        ],
      }),
      true
    );

    // Создаем VIEW для объединения migration_metadata с tech_radar
    // VIEW возвращает все технологии с миграционными данными
    await queryRunner.query(`
      CREATE OR REPLACE VIEW migration_metadata_view AS
      SELECT 
        tr.id AS "techRadarId",
        tr.name AS "techName",
        tr.version AS "currentVersion",
        tr.versionToUpdate,
        tr.versionUpdateDeadline,
        tr.upgradePath,
        tr.recommendedAlternatives,
        COALESCE(mm.id, uuid_generate_v4()) AS "metadataId",
        COALESCE(mm.priority, 999999) AS "priority",
        COALESCE(mm.status, 'backlog') AS "status",
        COALESCE(mm.progress, 0) AS "progress",
        COALESCE(mm.created_at, NOW()) AS "createdAt",
        COALESCE(mm.updated_at, NOW()) AS "updatedAt",
        CASE WHEN mm.id IS NULL THEN false ELSE true END AS "hasMetadata"
      FROM tech_radar tr
      LEFT JOIN migration_metadata mm ON tr.id = mm.tech_radar_id
      WHERE 
        tr.versionToUpdate IS NOT NULL 
        OR tr.upgradePath IS NOT NULL 
        OR tr.recommendedAlternatives IS NOT NULL
      ORDER BY 
        CASE WHEN mm.id IS NULL THEN 1 ELSE 0 END,
        COALESCE(mm.priority, 999999) ASC
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropView('migration_metadata_view');
    await queryRunner.dropTable('migration_metadata', true);
  }
}
