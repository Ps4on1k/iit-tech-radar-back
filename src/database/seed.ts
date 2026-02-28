import 'reflect-metadata';
import * as dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { AppDataSource } from './index';
import { User } from '../models/User';

dotenv.config({ path: '.env' });

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('База данных подключена');

    const userRepository = AppDataSource.getRepository(User);

    // Проверяем, есть ли уже пользователи
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@techradar.local' } });
    const existingUser = await userRepository.findOne({ where: { email: 'user@techradar.local' } });

    if (existingAdmin && existingUser) {
      console.log('Пользователи уже существуют. Сид не требуется.');
      await AppDataSource.destroy();
      return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = userRepository.create({
      email: 'admin@techradar.local',
      password: hashedPassword,
      firstName: 'Админ',
      lastName: 'Админов',
      role: 'admin',
      isActive: true,
    });

    const user = userRepository.create({
      email: 'user@techradar.local',
      password: hashedPassword,
      firstName: 'Пользователь',
      lastName: 'Пользователей',
      role: 'user',
      isActive: true,
    });

    if (!existingAdmin) {
      await userRepository.save(admin);
      console.log('Создан администратор: admin@techradar.local');
    }

    if (!existingUser) {
      await userRepository.save(user);
      console.log('Создан пользователь: user@techradar.local');
    }

    console.log('Сид завершен успешно');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Ошибка при сиде:', error);
    process.exit(1);
  }
}

seed();
