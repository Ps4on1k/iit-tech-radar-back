import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAIConfigTable1772500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_config',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            default: 'gen_random_uuid()',
          },
          {
            name: 'fieldName',
            type: 'varchar',
          },
          {
            name: 'displayName',
            type: 'varchar',
          },
          {
            name: 'enabled',
            type: 'boolean',
            default: false,
          },
          {
            name: 'prompt',
            type: 'text',
            default: "'Проведи анализ публичных доступных данных, сделай вывод и обнови это значение'",
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

    // Индекс для fieldName (уникальный)
    await queryRunner.createIndex(
      'ai_config',
      new TableIndex({
        name: 'IDX_AI_CONFIG_FIELD_NAME',
        columnNames: ['fieldName'],
        isUnique: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_config');
  }
}
