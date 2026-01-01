import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Stack } from '@mui/material';
import type { AlertColor } from '@mui/material';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'warning' | 'info' | 'error'; // Added error to match MUI, danger mapped to error
  duration?: number; // Milliseconds
}

interface NotificationContextType {
  showNotification: (message: string, type?: Notification['type'], duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: Notification['type'] = 'info', duration: number = 3000) => {
    const id = uuidv4();
    // Map 'danger' to 'error' for MUI
    const muiType = type === 'danger' ? 'error' : type;
    
    const newNotification: Notification = { id, message, type: muiType, duration };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const value = {
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastNotification notifications={notifications} setNotifications={setNotifications} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface ToastNotificationProps {
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ notifications, setNotifications }) => {
    const handleClose = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <Stack
            spacing={2}
            sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 2000,
                maxWidth: '400px',
            }}
        >
            {notifications.map((notification) => (
                <Alert 
                    key={notification.id} 
                    severity={notification.type as AlertColor} 
                    onClose={() => handleClose(notification.id)}
                    variant="filled"
                    elevation={6}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            ))}
        </Stack>
    );
};