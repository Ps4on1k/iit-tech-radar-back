import winston from 'winston';

// Уровни логирования
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Форматирование логов
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Транспорт для консоли (development)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

// Транспорт для файлов (production)
const fileTransport = new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error',
  maxsize: 10485760, // 10MB
  maxFiles: 5,
});

const infoFileTransport = new winston.transports.File({
  filename: 'logs/info.log',
  level: 'info',
  maxsize: 10485760, // 10MB
  maxFiles: 5,
});

// Создание логгера
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports: [
    consoleTransport,
    fileTransport,
    infoFileTransport,
  ],
  // Не выходить из процесса при ошибках
  exitOnError: false,
});

// Stream для Morgan (HTTP логи)
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};
