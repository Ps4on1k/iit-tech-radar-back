import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Миграция добавляет поле owner_id в таблицы migration_metadata и migration_snapshots
 * для отслеживания владельца миграции
 */
export class AddOwnerIdToMigrationTables1773000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем owner_id в migration_metadata
    await queryRunner.addColumn(
      'migration_metadata',
      new TableColumn({
        name: 'owner_id',
        type: 'uuid',
        isNullable: true,
        comment: 'ID пользователя - владельца миграции',
      })
    );

    // Добавляем внешний ключ для owner_id в migration_metadata
    await queryRunner.createForeignKey(
      'migration_metadata',
      new TableForeignKey({
        name: 'FK_MIGRATION_METADATA_OWNER',
        columnNames: ['owner_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    // Добавляем owner_id в migration_snapshots
    await queryRunner.addColumn(
      'migration_snapshots',
      new TableColumn({
        name: 'owner_id',
        type: 'uuid',
        isNullable: true,
        comment: 'ID пользователя - владельца миграции (на момент завершения)',
      })
    );

    // Добавляем внешний ключ для owner_id в migration_snapshots
    await queryRunner.createForeignKey(
      'migration_snapshots',
      new TableForeignKey({
        name: 'FK_MIGRATION_SNAPSHOTS_OWNER',
        columnNames: ['owner_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешние ключи
    await queryRunner.dropForeignKey('migration_snapshots', 'FK_MIGRATION_SNAPSHOTS_OWNER');
    await queryRunner.dropForeignKey('migration_metadata', 'FK_MIGRATION_METADATA_OWNER');

    // Удаляем колонки owner_id
    await queryRunner.dropColumn('migration_snapshots', 'owner_id');
    await queryRunner.dropColumn('migration_metadata', 'owner_id');
  }
}
