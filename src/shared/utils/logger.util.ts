import winston from 'winston';
import config from '../config/env';
import safeStringify from 'fast-safe-stringify';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Safe console format
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let safeMeta = '';

    if (Object.keys(meta).length > 0) {
      safeMeta = safeStringify(meta); // 🔥 circular-safe stringify
    }

    let safeMessage =
      typeof message === 'object' ? safeStringify(message) : message;

    return `${timestamp} [${level}]: ${safeMessage} ${safeMeta}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: config.nodeEnv === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: config.nodeEnv === 'development' ? consoleFormat : logFormat,
    }),

    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),

    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

export default logger;
