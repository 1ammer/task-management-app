import React, { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import socketService from '../services/socketService';
import type { Task } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { SocketContext } from '../context/SocketContextDefinition';
import type { SocketContextType } from '../context/SocketContextDefinition';

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Setup socket connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socketService.connect(token);
        
        // Check initial connection status
        setIsConnected(socketService.isConnected());
      }
    } else {
      socketService.disconnect();
      setIsConnected(false);
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  // Setup connection status listeners
  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected event received');
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected event received:', reason);
      setIsConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.log('Socket connection error event received:', error.message);
      setIsConnected(false);
      setConnectionError(error.message);
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleConnectError);

    // Check connection status periodically
    const interval = setInterval(() => {
      const connected = socketService.isConnected();
      if (connected !== isConnected) {
        console.log('Connection status changed to:', connected);
        setIsConnected(connected);
      }
    }, 5000);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleConnectError);
      clearInterval(interval);
    };
  }, [isConnected]);

  const onTaskCreated = useCallback((callback: (task: Task) => void) => {
    const handler = (data: { task: Task }) => callback(data.task);
    socketService.on('task-created', handler);
    return () => socketService.off('task-created', handler);
  }, []);

  const onTaskUpdated = useCallback((callback: (task: Task) => void) => {
    const handler = (data: { task: Task }) => callback(data.task);
    socketService.on('task-updated', handler);
    return () => socketService.off('task-updated', handler);
  }, []);

  const onTaskDeleted = useCallback((callback: (taskId: string) => void) => {
    const handler = (data: { taskId: string }) => callback(data.taskId);
    socketService.on('task-deleted', handler);
    return () => socketService.off('task-deleted', handler);
  }, []);

  const joinTaskRoom = useCallback((taskId: string) => {
    socketService.joinTaskRoom(taskId);
  }, []);

  const leaveTaskRoom = useCallback((taskId: string) => {
    socketService.leaveTaskRoom(taskId);
  }, []);

  const ping = useCallback(() => {
    socketService.ping();
  }, []);

  const value: SocketContextType = {
    isConnected,
    connectionError,
    onTaskCreated,
    onTaskUpdated,
    onTaskDeleted,
    joinTaskRoom,
    leaveTaskRoom,
    ping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

