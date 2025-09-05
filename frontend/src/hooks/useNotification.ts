import { useState, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

// Global notifications state
let globalNotifications: Notification[] = [];
let globalSetNotifications: ((notifications: Notification[]) => void) | null = null;

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Use global notifications if available
  if (globalSetNotifications === null) {
    globalSetNotifications = setNotifications;
    globalNotifications = notifications;
  }

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    globalNotifications = [...globalNotifications, newNotification];
    if (globalSetNotifications) {
      globalSetNotifications(globalNotifications);
    }
    
    // Auto remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    globalNotifications = globalNotifications.filter(notification => notification.id !== id);
    if (globalSetNotifications) {
      globalSetNotifications(globalNotifications);
    }
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    return addNotification({ type: 'success', message, duration });
  }, [addNotification]);

  const showError = useCallback((message: string, duration?: number) => {
    return addNotification({ type: 'error', message, duration });
  }, [addNotification]);

  const showInfo = useCallback((message: string, duration?: number) => {
    return addNotification({ type: 'info', message, duration });
  }, [addNotification]);

  const showWarning = useCallback((message: string, duration?: number) => {
    return addNotification({ type: 'warning', message, duration });
  }, [addNotification]);

  return {
    notifications: globalNotifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
};
