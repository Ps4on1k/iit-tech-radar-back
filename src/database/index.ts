import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: '.env' });

// Всегда используем glob pattern для entities (работает и в src, и в dist)
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tech_radar',
  synchronize: true, // Auto-create tables
  logging: false,
  // Используем glob pattern для entities - работает везде
  entities: [path.join(__dirname, '/../models/*.js')],
  migrations: [path.join(__dirname, '/migrations/*.{js,ts}')],
  subscribers: [],
});
