import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

let io: SocketServer;

export const initWebSocket = (httpServer: HttpServer) => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: '*', // TODO: restrict to frontend origin in production
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string };
      socket.data.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`🔌 Client connected via WebSocket [User: ${userId}]`);

    // Join a room specific to the user so we can emit targeted notifications
    socket.join(`user:${userId}`);

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected [User: ${userId}]`);
    });
  });

  logger.info('✅ WebSocket server initialized');
  return io;
};

export const getIO = (): SocketServer => {
  if (!io) {
    throw new Error('WebSocket Server not initialized!');
  }
  return io;
};

/**
 * Emit a notification to a specific user
 */
export const notifyUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  } else {
    logger.warn('WebSocket not initialized. Cannot emit event:', event);
  }
};
