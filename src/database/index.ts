import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Определяем режим: development (ts-node) или production (compiled)
const isDevelopment = process.env.NODE_ENV !== 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tech_radar',
  synchronize: isDevelopment, // Auto-create tables в dev режиме
  logging: isDevelopment,
  // В dev режиме используем ts-node с явными импортами, в production - compiled JS
  entities: isDevelopment
    ? [require('../models/User').User, require('../models/TechRadarEntity').TechRadarEntity]
    : [__dirname + '/../models/*.js'],
  migrations: isDevelopment
    ? [__dirname + '/migrations/*.ts']
    : [__dirname + '/migrations/*.js'],
  subscribers: [],
});
