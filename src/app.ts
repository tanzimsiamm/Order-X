import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './shared/config/env';
import logger from './shared/utils/logger.util';
import { globalErrorHandler } from './shared/middlewares/globalErrorHandler';

const app: Application = express();

app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Rate Limiter
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later',
}));

// Stripe raw body
app.use('/api/payment/webhook/stripe', express.raw({ type: 'application/json' }));

// JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// Health
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    env: config.nodeEnv,
  });
});


// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
