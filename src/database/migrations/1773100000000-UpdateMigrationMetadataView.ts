import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Миграция обновляет VIEW migration_metadata_view
 * Добавляет поля owner_id и owner_name
 */
export class UpdateMigrationMetadataView1773100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Обновляем VIEW для объединения migration_metadata с tech_radar
    // Добавляем LEFT JOIN с users для получения имени владельца
    await queryRunner.query(`
      DROP VIEW IF EXISTS migration_metadata_view;
      CREATE VIEW migration_metadata_view AS
      SELECT
        tr.id AS "techRadarId",
        tr.name AS "techName",
        tr.version AS "currentVersion",
        tr."versionToUpdate",
        tr."versionUpdateDeadline",
        tr."upgradePath",
        tr."recommendedAlternatives",
        COALESCE(mm.id, uuid_generate_v4()) AS "metadataId",
        COALESCE(mm.priority, 999999) AS "priority",
        COALESCE(mm.status, 'backlog') AS "status",
        COALESCE(mm.progress, 0) AS "progress",
        mm.owner_id AS "ownerId",
        COALESCE(u."firstName" || ' ' || u."lastName", u.email) AS "ownerName",
        COALESCE(mm."createdAt", NOW()) AS "createdAt",
        COALESCE(mm."updatedAt", NOW()) AS "updatedAt",
        CASE WHEN mm.id IS NULL THEN false ELSE true END AS "hasMetadata"
      FROM tech_radar tr
      LEFT JOIN migration_metadata mm ON tr.id = mm.tech_radar_id
      LEFT JOIN "users" u ON mm.owner_id = u.id
      WHERE
        tr."versionToUpdate" IS NOT NULL
        OR tr."upgradePath" IS NOT NULL
        OR tr."recommendedAlternatives" IS NOT NULL
      ORDER BY
        CASE WHEN mm.id IS NULL THEN 1 ELSE 0 END,
        COALESCE(mm.priority, 999999) ASC
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем VIEW к исходному состоянию (без owner)
    await queryRunner.query(`
      DROP VIEW IF EXISTS migration_metadata_view;
      CREATE VIEW migration_metadata_view AS
      SELECT
        tr.id AS "techRadarId",
        tr.name AS "techName",
        tr.version AS "currentVersion",
        tr."versionToUpdate",
        tr."versionUpdateDeadline",
        tr."upgradePath",
        tr."recommendedAlternatives",
        COALESCE(mm.id, uuid_generate_v4()) AS "metadataId",
        COALESCE(mm.priority, 999999) AS "priority",
        COALESCE(mm.status, 'backlog') AS "status",
        COALESCE(mm.progress, 0) AS "progress",
        COALESCE(mm."createdAt", NOW()) AS "createdAt",
        COALESCE(mm."updatedAt", NOW()) AS "updatedAt",
        CASE WHEN mm.id IS NULL THEN false ELSE true END AS "hasMetadata"
      FROM tech_radar tr
      LEFT JOIN migration_metadata mm ON tr.id = mm.tech_radar_id
      WHERE
        tr."versionToUpdate" IS NOT NULL
        OR tr."upgradePath" IS NOT NULL
        OR tr."recommendedAlternatives" IS NOT NULL
      ORDER BY
        CASE WHEN mm.id IS NULL THEN 1 ELSE 0 END,
        COALESCE(mm.priority, 999999) ASC
    `);
  }
}
