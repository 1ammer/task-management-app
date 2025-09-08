import { io, Socket } from 'socket.io-client';
import type { Task } from './api';

export interface SocketEvents {
  'task-created': (data: { task: Task }) => void;
  'task-updated': (data: { task: Task }) => void;
  'task-deleted': (data: { taskId: string }) => void;
  'connection-status': (data: { online: boolean }) => void;
  'connect': () => void;
  'disconnect': (reason: string) => void;
  'reconnect': (attemptNumber: number) => void;
  'reconnect_attempt': (attemptNumber: number) => void;
  'reconnect_error': (error: Error) => void;
  'reconnect_failed': () => void;
  'connect_error': (error: Error) => void;
  'pong': () => void;
  'server-info': (data: { serverStartTime: Date, serverUptime: number, connectedUsers: number }) => void;
  'connection-confirmed': (data: { userId: string, socketId: string, serverTime: Date }) => void;
}

// Use a type that is compatible with all event callbacks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private token: string | null = null;
  private reconnectTimer: number | null = null;

  public connect(token: string): void {
    this.token = token;
    
    if (this.socket?.connected) {
      return;
    }

    const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';


    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      upgrade: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      timeout: 20000,
      path: '/socket.io',
    });

    this.setupEventHandlers();
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.listeners.clear();
    this.reconnectAttempts = 0;
    this.token = null;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      this.emit('connect');
      
      // Reset any reconnect timers
      if (this.reconnectTimer) {
        window.clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Check connection with server
      this.checkConnection();
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from server:', reason);
      this.emit('disconnect', reason);
      
      // If the server initiated the disconnect, try to reconnect
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.attemptReconnect();
      }
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      this.emit('connect_error', error);
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('reconnect_failed');
        this.disconnect();
      } else {
        this.attemptReconnect();
      }
    });
    
    // Additional reconnection events
    this.socket.io.on('reconnect', (attempt: number) => {
      console.log(`Reconnected on attempt ${attempt}`);
      this.emit('reconnect', attempt);
    });
    
    this.socket.io.on('reconnect_attempt', (attempt: number) => {
      console.log(`Reconnection attempt ${attempt}`);
      this.emit('reconnect_attempt', attempt);
    });
    
    this.socket.io.on('reconnect_error', (error: Error) => {
      console.error('Reconnection error:', error);
      this.emit('reconnect_error', error);
    });
    
    this.socket.io.on('reconnect_failed', () => {
      console.error('Failed to reconnect');
      this.emit('reconnect_failed');
    });

    // Task-related events
    this.socket.on('task-created', (data: { task: Task }) => {
      console.log('Task created:', data.task);
      this.emit('task-created', data);
    });

    this.socket.on('task-updated', (data: { task: Task }) => {
      console.log('Task updated:', data.task);
      this.emit('task-updated', data);
    });

    this.socket.on('task-deleted', (data: { taskId: string }) => {
      console.log('Task deleted:', data.taskId);
      this.emit('task-deleted', data);
    });

    this.socket.on('connection-status', (data: { online: boolean }) => {
      console.log('Connection status:', data.online);
      this.emit('connection-status', data);
    });

    this.socket.on('pong', () => {
      this.emit('pong');
      // Dispatch a custom event for components to listen to
      window.dispatchEvent(new CustomEvent('socket:pong'));
    });

    this.socket.on('server-info', (data: { serverStartTime: string, serverUptime: number, connectedUsers: number }) => {
      console.log('Server info received:', data);
      // Convert string date to Date object
      const serverInfo = {
        ...data,
        serverStartTime: new Date(data.serverStartTime)
      };
      this.emit('server-info', serverInfo);
    });
    
    this.socket.on('connection-confirmed', (data: { userId: string, socketId: string, serverTime: string }) => {
      console.log('Connection confirmed:', data);
      // Convert string date to Date object
      const connectionData = {
        ...data,
        serverTime: new Date(data.serverTime)
      };
      this.emit('connection-confirmed', connectionData);
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = window.setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      
      if (this.token && !this.socket?.connected) {
        // Clean up existing socket if any
        if (this.socket) {
          this.socket.disconnect();
          this.socket = null;
        }
        
        // Reconnect with stored token
        this.connect(this.token);
      }
    }, this.reconnectInterval);
  }

  public on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, ...args: unknown[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in socket event callback for ${event}:`, error);
        }
      });
    }
  }

  public joinTaskRoom(taskId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-task', taskId);
    }
  }

  public leaveTaskRoom(taskId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-task', taskId);
    }
  }

  public ping(): void {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  public isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  public isInitialized(): boolean {
    return !!this.socket;
  }

  public getConnectionId(): string | undefined {
    return this.socket?.id;
  }

  public checkConnection(): void {
    if (this.socket?.connected) {
      this.socket.emit('check-connection');
    }
  }
}

export default new SocketService();

