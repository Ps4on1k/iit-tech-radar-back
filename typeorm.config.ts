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
  synchronize: false,
  logging: false,
  // В dev режиме используем ts-node с явными импортами, в production - compiled JS
  entities: isDevelopment
    ? [require('./src/models/User').User, require('./src/models/TechRadarEntity').TechRadarEntity]
    : [__dirname + '/dist/models/*.js'],
  migrations: isDevelopment
    ? ['src/database/migrations/*.ts']
    : [__dirname + '/dist/database/migrations/*.js'],
  subscribers: [],
});
