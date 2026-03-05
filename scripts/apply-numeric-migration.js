#!/usr/bin/env node
/**
 * Скрипт для применения миграции FixNumericPrecision
 * Запускается после деплоя на любую машину
 */

const { DataSource } = require('typeorm');
require('dotenv').config();

async function applyMigration() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tech_radar',
  });

  try {
    await ds.initialize();
    console.log('Connected to database');

    // Проверяем текущий тип данных
    const result = await ds.query(`
      SELECT column_name, numeric_precision, numeric_scale 
      FROM information_schema.columns 
      WHERE table_name = 'tech_radar' 
      AND column_name IN ('adoptionRate', 'popularityIndex')
    `);

    const needsMigration = result.some(row => 
      row.numeric_precision !== 5 || row.numeric_scale !== 4
    );

    if (needsMigration) {
      console.log('Applying migration: changing adoptionRate and popularityIndex to numeric(5,4)');
      await ds.query(`
        ALTER TABLE "tech_radar" 
        ALTER COLUMN "adoptionRate" TYPE numeric(5,4)
      `);
      await ds.query(`
        ALTER TABLE "tech_radar" 
        ALTER COLUMN "popularityIndex" TYPE numeric(5,4)
      `);
      console.log('Migration applied successfully');
    } else {
      console.log('Migration already applied: columns have correct type numeric(5,4)');
    }

    await ds.destroy();
    console.log('Done');
  } catch (error) {
    console.error('Error:', error.message);
    await ds.destroy();
    process.exit(1);
  }
}

applyMigration();
