import { AppDataSource } from '../database';

/**
 * Скрипт для проверки структуры таблицы tech_radar
 */
async function checkTableStructure() {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  
  try {
    await queryRunner.connect();
    
    console.log('Проверка структуры таблицы tech_radar...');
    
    const result = await queryRunner.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'tech_radar'
      AND column_name IN ('versionToUpdate', 'version_to_update', 'versionUpdateDeadline', 'version_update_deadline', 'upgradePath', 'upgrade_path', 'recommendedAlternatives', 'recommended_alternatives')
      ORDER BY column_name
    `);
    
    console.log('Найденные колонки:');
    result.forEach((row: any) => {
      console.log(`  ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
    });
    
    // Также проверим VIEW
    console.log('\nПроверка VIEW migration_metadata_view...');
    const viewExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_name = 'migration_metadata_view'
      )
    `);
    
    if (viewExists[0].exists) {
      console.log('VIEW существует');
      
      // Попробуем сделать простой SELECT
      try {
        const testQuery = await queryRunner.query('SELECT * FROM migration_metadata_view LIMIT 1');
        console.log('VIEW работает, первая запись:', JSON.stringify(testQuery[0], null, 2));
      } catch (err: any) {
        console.error('Ошибка при SELECT из VIEW:', err.message);
      }
    } else {
      console.log('VIEW НЕ существует');
    }
    
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

checkTableStructure();
