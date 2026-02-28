import { DataSource } from 'typeorm';
import { TechRadarEntity, User } from '../models';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tech_radar',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [TechRadarEntity, User],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: [],
});
