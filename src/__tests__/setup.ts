// Установка переменных окружения для тестов
process.env.JWT_SECRET = 'test-secret';
process.env.PORT = '5000';
process.env.DB_MODE = 'mock';

// Mock для bcrypt
jest.mock('bcryptjs', () => ({
  hashSync: jest.fn((str: string) => `hashed_${str}`),
  compare: jest.fn((plain: string, hashed: string) => {
    return Promise.resolve(hashed === `hashed_${plain}`);
  }),
  genSaltSync: jest.fn(),
}));

// Mock для jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload: any) => `token_${JSON.stringify(payload)}`),
  verify: jest.fn((token: string) => {
    if (token.startsWith('token_')) {
      return JSON.parse(token.substring(6));
    }
    if (token === 'valid_token') {
      return {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
      };
    }
    if (token === 'manager_token') {
      return {
        id: 'manager-id',
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
      };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock для dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(() => ({
    parsed: {
      PORT: '5000',
      JWT_SECRET: 'test-secret',
      DB_MODE: 'mock',
    },
  })),
}));
