/**
 * Тестовый скрипт для проверки RabbitMQ подключения из backend
 * Запуск: npx ts-node src/scripts/test-rabbitmq.ts
 */

import { RabbitMQService } from '../services/RabbitMQService';
import { UpdateRequest, AIConfig } from '../types/asyncapi';

const rabbitMQConfig = {
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: parseInt(process.env.RABBITMQ_PORT || '5672'),
  username: process.env.RABBITMQ_USER || 'guest',
  password: process.env.RABBITMQ_PASSWORD || 'guest',
  vhost: process.env.RABBITMQ_VHOST || '/',
  requestQueue: process.env.RABBITMQ_REQUEST_QUEUE || 'techradar.requests',
  responseQueue: process.env.RABBITMQ_RESPONSE_QUEUE || 'techradar.responses'
};

async function testRabbitMQ() {
  const rabbitMQService = new RabbitMQService(rabbitMQConfig);

  try {
    console.log('📡 Подключение к RabbitMQ...');
    console.log('Config:', {
      host: rabbitMQConfig.host,
      port: rabbitMQConfig.port,
      vhost: rabbitMQConfig.vhost,
      requestQueue: rabbitMQConfig.requestQueue,
      responseQueue: rabbitMQConfig.responseQueue
    });

    await rabbitMQService.connect();
    console.log('✅ RabbitMQ подключен');

    // Проверяем статус
    const status = rabbitMQService.getStatus();
    console.log('\n📊 Статус:', status);

    // Формируем тестовый запрос
    const testRequest: UpdateRequest = {
      correlationId: '',
      technologyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      aiConfig: {
        prompt: 'Проанализируй технологию и обнови версию, зрелость и уровень риска',
        fields: {
          version: { enabled: true, required: true },
          maturity: { enabled: true, priority: 2 },
          riskLevel: { enabled: true, priority: 3 }
        }
      } as AIConfig,
      currentData: {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        name: 'React',
        version: '18.1.0',
        type: 'framework',
        category: 'adopt',
        maturity: 'active',
        riskLevel: 'low'
      },
      reason: 'Test from backend',
      trigger: 'manual-test',
      priority: 'normal'
    };

    console.log('\n📤 Отправка тестового запроса...');
    const correlationId = await rabbitMQService.sendRequest(testRequest);
    console.log('✅ Запрос отправлен, correlationId:', correlationId);

    // Подписка на ответы
    console.log('\n📥 Подписка на ответы...');
    await rabbitMQService.subscribeToResponses(async (response, corrId) => {
      console.log('\n✅ Получен ответ:');
      console.log('Correlation ID:', corrId);
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(response, null, 2));
    });

    console.log('Ожидание ответа (30 секунд)...');

    // Ждем 30 секунд для получения ответа
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('\n🎉 Тест завершен');

  } catch (error: any) {
    console.error('❌ Ошибка:', error.message);
    throw error;
  } finally {
    console.log('\n🔌 Закрытие соединения...');
    await rabbitMQService.close();
    console.log('Соединение закрыто');
  }
}

testRabbitMQ()
  .then(() => {
    console.log('\n✨ Готово!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Тест завершен с ошибкой:', error.message);
    process.exit(1);
  });
