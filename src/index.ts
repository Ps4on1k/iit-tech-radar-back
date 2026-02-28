import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { techRadarRoutes, authRoutes, importRoutes } from './routes';
import { AppDataSource } from './database';

async function bootstrap() {
  const app = express();

  // Инициализация базы данных (если используется)
  if (config.dbMode === 'database') {
    try {
      await AppDataSource.initialize();
      console.log('База данных подключена');
    } catch (error) {
      console.error('Ошибка подключения к БД:', error);
    }
  } else {
    console.log('Режим работы: mock данные');
  }

  // Middleware
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/tech-radar', techRadarRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/import', importRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', dbMode: config.dbMode });
  });

  // Start server
  app.listen(config.port, () => {
    console.log(`Сервер запущен на порту ${config.port}`);
    console.log(`Режим БД: ${config.dbMode}`);
    console.log(`Frontend URL: ${config.frontendUrl}`);
    console.log('');
    console.log('Учетные записи (по умолчанию):');
    console.log('  Admin: admin@techradar.local / password123');
    console.log('  User:  user@techradar.local / password123');
    console.log('');
    console.log('Для создания пользователей выполните: npm run seed');
  });
}

bootstrap().catch(console.error);
