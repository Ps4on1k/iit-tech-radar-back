import 'dotenv/config';

// Валидация обязательных переменных окружения
function validateRequiredEnv() {
  const required = ['JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Отсутствуют обязательные переменные окружения: ${missing.join(', ')}`);
  }
}

validateRequiredEnv();

export const config = {
  port: process.env.PORT || 5000,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  dbMode: process.env.DB_MODE || 'mock',
};
