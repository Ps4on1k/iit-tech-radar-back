import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Миграция очищает таблицу migration_snapshots от некорректных записей
 * (созданных до введения проверки статуса completed)
 */
export class CleanupMigrationSnapshots1772800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Очищаем таблицу снапшотов
    await queryRunner.query(`TRUNCATE TABLE migration_snapshots`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Down не требуется - данные уже удалены
  }
}
