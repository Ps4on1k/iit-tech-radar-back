/**
 * Скрипт для создания тестовых записей аудита
 * Используется для тестирования очистки журнала аудита
 */

import { AppDataSource } from './src/database';
import { AuditLogEntity } from './src/models/AuditLogEntity';

async function createTestAuditLogs() {
  try {
    await AppDataSource.initialize();
    console.log('База данных подключена');

    const repository = AppDataSource.getRepository(AuditLogEntity);

    // Создаём записи с разными датами
    const testLogs: Partial<AuditLogEntity>[] = [];

    // 5 записей возрастом 20 дней
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - 20);
      testLogs.push({
        action: 'LOGIN',
        entity: 'Auth',
        status: 'SUCCESS',
        timestamp: date,
        details: JSON.stringify({ test: true, old: true }),
      });
    }

    // 5 записей возрастом 30 дней
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      testLogs.push({
        action: 'CREATE',
        entity: 'TechRadar',
        status: 'SUCCESS',
        timestamp: date,
        details: JSON.stringify({ test: true, veryOld: true }),
      });
    }

    // 5 записей возрастом 5 дней (не должны удалиться)
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() - 5);
      testLogs.push({
        action: 'UPDATE',
        entity: 'User',
        status: 'SUCCESS',
        timestamp: date,
        details: JSON.stringify({ test: true, recent: true }),
      });
    }

    const saved = await repository.save(testLogs);
    console.log(`Создано ${saved.length} тестовых записей аудита:`);
    console.log(`- 5 записей возрастом 20 дней`);
    console.log(`- 5 записей возрастом 30 дней`);
    console.log(`- 5 записей возрастом 5 дней (не будут удалены)`);

    await AppDataSource.destroy();
    console.log('Готово!');
  } catch (error: any) {
    console.error('Ошибка:', error.message);
    process.exit(1);
  }
}

createTestAuditLogs();
