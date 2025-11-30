import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.util';
import config from '../config/env';
import logger from '../utils/logger.util';

let io: Server;
const userSockets = new Map<string, string>(); // userId -> socketId

/**
 * Initialize Socket.io server
 */
export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: config.frontend.url,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware for Socket.io
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);

      // Attach user data to socket
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      socket.data.role = decoded.role;

      next();
    } catch (error: any) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle connections
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    const email = socket.data.email;

    logger.info(`User connected: ${email} (${userId})`);

    // Store user's socket ID
    userSockets.set(userId, socket.id);

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to real-time server',
      userId,
      timestamp: new Date(),
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${email} (${userId})`);
      userSockets.delete(userId);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  });

  logger.info('Socket.io initialized successfully');

  return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  const socketId = userSockets.get(userId);

  if (socketId) {
    io.to(socketId).emit(event, data);
    logger.debug(`Event '${event}' emitted to user ${userId}`);
  } else {
    logger.warn(`User ${userId} not connected. Event '${event}' not sent.`);
  }
};

/**
 * Emit event to all connected users
 */
export const emitToAll = (event: string, data: any): void => {
  io.emit(event, data);
  logger.debug(`Event '${event}' emitted to all users`);
};

/**
 * Get connected users count
 */
export const getConnectedUsersCount = (): number => {
  return userSockets.size;
};

/**
 * Check if user is connected
 */
export const isUserConnected = (userId: string): boolean => {
  return userSockets.has(userId);
};

export { userSockets };