import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class AddRelatedTechRadarTables1772450000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Таблица отзывов (reviews)
    await queryRunner.createTable(
      new Table({
        name: 'tech_radar_reviews',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'techRadarId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'rating',
            type: 'int',
            default: 5,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'authorName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Индекс для reviews
    await queryRunner.createIndex(
      'tech_radar_reviews',
      new TableIndex({
        name: 'IDX_TECH_RADAR_REVIEWS_TECH_RADAR_ID',
        columnNames: ['techRadarId'],
      })
    );

    // Таблица тегов (tags)
    await queryRunner.createTable(
      new Table({
        name: 'tech_radar_tags',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'techRadarId',
            type: 'uuid',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Уникальный индекс для tags (techRadarId + name)
    await queryRunner.createIndex(
      'tech_radar_tags',
      new TableIndex({
        name: 'IDX_TECH_RADAR_TAGS_UNIQUE',
        columnNames: ['techRadarId', 'name'],
        isUnique: true,
      })
    );

    // Таблица вложений (attachments)
    await queryRunner.createTable(
      new Table({
        name: 'tech_radar_attachments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'techRadarId',
            type: 'uuid',
          },
          {
            name: 'fileName',
            type: 'varchar',
          },
          {
            name: 'originalName',
            type: 'varchar',
          },
          {
            name: 'mimeType',
            type: 'varchar',
          },
          {
            name: 'size',
            type: 'int',
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'uploadedBy',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Индекс для attachments
    await queryRunner.createIndex(
      'tech_radar_attachments',
      new TableIndex({
        name: 'IDX_TECH_RADAR_ATTACHMENTS_TECH_RADAR_ID',
        columnNames: ['techRadarId'],
      })
    );

    // Таблица истории изменений (history)
    await queryRunner.createTable(
      new Table({
        name: 'tech_radar_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'techRadarId',
            type: 'uuid',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'action',
            type: 'varchar',
          },
          {
            name: 'previousValues',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'newValues',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Индекс для history
    await queryRunner.createIndex(
      'tech_radar_history',
      new TableIndex({
        name: 'IDX_TECH_RADAR_HISTORY_TECH_RADAR_ID',
        columnNames: ['techRadarId'],
      })
    );

    // Внешние ключи
    await queryRunner.createForeignKey(
      'tech_radar_reviews',
      new TableForeignKey({
        name: 'FK_TECH_RADAR_REVIEWS_TECH_RADAR',
        columnNames: ['techRadarId'],
        referencedTableName: 'tech_radar',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'tech_radar_tags',
      new TableForeignKey({
        name: 'FK_TECH_RADAR_TAGS_TECH_RADAR',
        columnNames: ['techRadarId'],
        referencedTableName: 'tech_radar',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'tech_radar_attachments',
      new TableForeignKey({
        name: 'FK_TECH_RADAR_ATTACHMENTS_TECH_RADAR',
        columnNames: ['techRadarId'],
        referencedTableName: 'tech_radar',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'tech_radar_history',
      new TableForeignKey({
        name: 'FK_TECH_RADAR_HISTORY_TECH_RADAR',
        columnNames: ['techRadarId'],
        referencedTableName: 'tech_radar',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешние ключи
    await queryRunner.dropForeignKey('tech_radar_reviews', 'FK_TECH_RADAR_REVIEWS_TECH_RADAR');
    await queryRunner.dropForeignKey('tech_radar_tags', 'FK_TECH_RADAR_TAGS_TECH_RADAR');
    await queryRunner.dropForeignKey('tech_radar_attachments', 'FK_TECH_RADAR_ATTACHMENTS_TECH_RADAR');
    await queryRunner.dropForeignKey('tech_radar_history', 'FK_TECH_RADAR_HISTORY_TECH_RADAR');

    // Удаляем таблицы
    await queryRunner.dropTable('tech_radar_reviews');
    await queryRunner.dropTable('tech_radar_tags');
    await queryRunner.dropTable('tech_radar_attachments');
    await queryRunner.dropTable('tech_radar_history');
  }
}
