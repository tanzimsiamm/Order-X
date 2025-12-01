import express, { Application, Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import config from './shared/config/env';
import logger from './shared/utils/logger.util';
import { globalErrorHandler } from './shared/middlewares/globalErrorHandler';
import { initializeSocket } from './shared/socket/socket';

// Import routes
import authRoutes from './modules/auth/auth.route';
import orderRoutes from './modules/order/order.route';
import paymentRoutes from './modules/payment/payment.route';
import chatbotRoutes from './modules/chatbot/chatbot.route';
import adminRoutes from './modules/admin/admin.route';

const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.frontend.url,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middlewares
// IMPORTANT: Raw body for Stripe webhooks
app.use(
  '/api/payment/webhook/stripe',
  express.raw({ type: 'application/json' })
);

// JSON body parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

// Start server
const PORT = config.port;
const HOST = '0.0.0.0'; // Important for Docker

httpServer.listen(PORT, HOST, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Socket.io enabled`);
  logger.info(`💳 Payment webhooks ready`);
  logger.info(`🤖 AI Chatbot ready`);
  logger.info(`🌐 CORS enabled for: ${config.frontend.url}`);

  if (config.nodeEnv === 'development') {
    logger.info(`📝 API Documentation: http://localhost:${PORT}/health`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
  // Close server gracefully
  httpServer.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Process terminated');
  });
});

export default app;