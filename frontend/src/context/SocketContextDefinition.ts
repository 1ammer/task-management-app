import { createContext } from 'react';
import type { Task } from '../services/api';

export interface SocketContextType {
  isConnected: boolean;
  connectionError: string | null;
  onTaskCreated: (callback: (task: Task) => void) => () => void;
  onTaskUpdated: (callback: (task: Task) => void) => () => void;
  onTaskDeleted: (callback: (taskId: string) => void) => () => void;
  joinTaskRoom: (taskId: string) => void;
  leaveTaskRoom: (taskId: string) => void;
  ping: () => void;
}

export const SocketContext = createContext<SocketContextType | null>(null); 