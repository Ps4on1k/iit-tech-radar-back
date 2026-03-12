import { AppDataSource } from '../database';

/**
 * Скрипт для обновления VIEW migration_metadata_view
 * Запуск: npm run update-view
 */
async function updateView() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    
    console.log('Создание VIEW migration_metadata_view...');
    
    // Сначала удалим VIEW если существует
    await queryRunner.query('DROP VIEW IF EXISTS migration_metadata_view');
    
    await queryRunner.query(`
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
    
    console.log('VIEW успешно создан!');
    
    // Проверим что VIEW работает
    const result = await queryRunner.query('SELECT * FROM migration_metadata_view LIMIT 1');
    if (result.length > 0) {
      console.log('VIEW работает, первая запись:', JSON.stringify(result[0], null, 2));
    }
  } catch (error) {
    console.error('Ошибка создания VIEW:', error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

updateView();
