import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { DbService } from './dbService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

export class SocketService {
  private static instance: SocketService;
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private db: DbService;
  private serverStartTime: Date;

  private constructor() {
    this.db = DbService.getInstance();
    this.serverStartTime = new Date();
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      path: '/socket.io', // Explicitly set the default Socket.IO path
    });

    // Log the server configuration for debugging
    logger.info(`Socket.IO server initialized with path: /socket.io`);
    logger.info(`CORS origin: ${process.env.CLIENT_URL || "http://localhost:5173"}`);

    this.setupMiddleware();
    this.setupEventHandlers();
    
    // Update server start time on initialization
    this.serverStartTime = new Date();
    
    logger.info('Socket.IO server fully initialized and ready');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        
        // Verify user exists in database
        const user = await this.db.users.findById(decoded.id);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.userEmail = user.email;
        
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      logger.info(`User connected: ${socket.userEmail} (${socket.id})`);

      // Track connected user
      this.addConnectedUser(socket.userId!, socket.id);

      // Join user to their personal room for targeted messages
      socket.join(`user:${socket.userId}`);
      
      // Send server info to client on connection
      socket.emit('server-info', {
        serverStartTime: this.serverStartTime,
        serverUptime: Date.now() - this.serverStartTime.getTime(),
        connectedUsers: this.getConnectedUsersCount(),
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`User disconnected: ${socket.userEmail} (${socket.id}) - ${reason}`);
        this.removeConnectedUser(socket.userId!, socket.id);
      });

      // Handle connection status requests
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle task room joins (optional: for task-specific updates)
      socket.on('join-task', (taskId: string) => {
        socket.join(`task:${taskId}`);
        logger.info(`User ${socket.userEmail} joined task room: ${taskId}`);
      });

      socket.on('leave-task', (taskId: string) => {
        socket.leave(`task:${taskId}`);
        logger.info(`User ${socket.userEmail} left task room: ${taskId}`);
      });
      
      // Handle client reconnection check
      socket.on('check-connection', () => {
        socket.emit('connection-confirmed', {
          userId: socket.userId,
          socketId: socket.id,
          serverTime: new Date(),
        });
      });
    });
  }

  private addConnectedUser(userId: string, socketId: string): void {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, new Set());
    }
    this.connectedUsers.get(userId)!.add(socketId);
    
    // Emit online status to all connected sockets of this user
    this.emitToUser(userId, 'connection-status', { online: true });
  }

  private removeConnectedUser(userId: string, socketId: string): void {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
        // User is completely offline
        this.emitToUser(userId, 'connection-status', { online: false });
      }
    }
  }

  // Task-related real-time events
  public emitTaskCreated(task: any): void {
    if (!this.io) return;
    
    logger.info(`Emitting task created: ${task.id} to user ${task.userId}`);
    
    // Emit to task creator
    this.emitToUser(task.userId, 'task-created', { task });
    
  }

  public emitTaskUpdated(task: any): void {
    if (!this.io) return;
    
    logger.info(`Emitting task updated: ${task.id} to user ${task.userId}`);
    
    // Emit to task owner
    this.emitToUser(task.userId, 'task-updated', { task });
    
    // Emit to task room (useful for shared tasks)
    this.io.to(`task:${task.id}`).emit('task-updated', { task });
  }

  public emitTaskDeleted(taskId: string, userId: string): void {
    if (!this.io) return;
    
    logger.info(`Emitting task deleted: ${taskId} to user ${userId}`);
    
    // Emit to task owner
    this.emitToUser(userId, 'task-deleted', { taskId });
    
    // Emit to task room
    this.io.to(`task:${taskId}`).emit('task-deleted', { taskId });
  }

  // Helper method to emit to all sockets of a specific user
  private emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Helper method to emit to all connected clients
  public broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Get connection status
  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.size > 0;
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getSocketIO(): SocketIOServer | null {
    return this.io;
  }
}

export default SocketService.getInstance();
