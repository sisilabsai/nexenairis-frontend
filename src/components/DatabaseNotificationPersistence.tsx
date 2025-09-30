'use client';

import { useEffect } from 'react';

interface NotificationData {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action?: string;
  data?: any;
}

// 🚀 Simple database persistence hook - doesn't interfere with existing notification system
export function useNotificationPersistence() {
  
  const saveToDatabase = async (notification: NotificationData) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          action: notification.action,
          category: 'inventory',
          is_persistent: true,
          priority: notification.type === 'error' ? 'critical' : 
                   notification.type === 'warning' ? 'high' : 'normal',
          metadata: notification.data
        })
      });
    } catch (error) {
      console.log('Database persistence failed (local notifications still work):', error);
    }
  };

  return { saveToDatabase };
}

// 🚀 Simple database notification viewer
export function DatabaseNotificationViewer() {
  // This can be used later to view persistent notifications
  return null;
} 