import { useContext } from 'react';
import { SocketContext } from '../context/SocketContextDefinition';
import type { SocketContextType } from '../context/SocketContextDefinition';

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 