'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface NotificationCounts {
  chat: number;
  finance: number;
  invoices: number;
  sales: number;
  inventory: number;
  hr: number;
  crm: number;
  analytics: number;
  [key: string]: number;
}

interface NotificationContextType {
  counts: NotificationCounts;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (module: string, count?: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://wecrafttech.com/api';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<NotificationCounts>({
    chat: 0,
    finance: 0,
    invoices: 0,
    sales: 0,
    inventory: 0,
    hr: 0,
    crm: 0,
    analytics: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotificationCounts = async () => {
    const token = localStorage.getItem('auth_token');
    if (!user || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCounts({
          chat: data.unread_messages || 0,
          finance: data.pending_finance_approvals || 0,
          invoices: data.overdue_invoices || 0,
          sales: data.new_leads || 0,
          inventory: data.low_stock_alerts || 0,
          hr: data.pending_hr_requests || 0,
          crm: data.follow_up_reminders || 0,
          analytics: data.new_reports || 0,
        });
      } else {
        console.warn('Failed to fetch notification counts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      // Fallback to local storage or default values if API fails
      const savedCounts = localStorage.getItem('notificationCounts');
      if (savedCounts) {
        setCounts(JSON.parse(savedCounts));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotificationCounts();
  };

  const markAsRead = async (module: string, count: number = 1) => {
    const token = localStorage.getItem('auth_token');
    if (!user || !token) return;

    try {
      await fetch(`${API_BASE_URL}/api/notifications/mark-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ module, count }),
      });

      // Update local state immediately for responsiveness
      setCounts(prev => ({
        ...prev,
        [module]: Math.max(0, prev[module] - count),
      }));

      // Save to localStorage as backup
      const updatedCounts = { ...counts, [module]: Math.max(0, counts[module] - count) };
      localStorage.setItem('notificationCounts', JSON.stringify(updatedCounts));
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (user && token) {
      fetchNotificationCounts();
    }
  }, [user]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!user || !token) return;

    const interval = setInterval(fetchNotificationCounts, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Listen for focus events to refresh notifications when user returns to the app
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!user || !token) return;

    const handleFocus = () => {
      fetchNotificationCounts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const value: NotificationContextType = {
    counts,
    isLoading,
    refreshNotifications,
    markAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Hook for getting notification count for a specific module
export const useModuleNotifications = (moduleName: string) => {
  const { counts, markAsRead } = useNotifications();
  
  const normalizedModuleName = moduleName.toLowerCase().replace(/\s+/g, '');
  const count = counts[normalizedModuleName] || 0;
  
  const markAsReadForModule = (readCount?: number) => {
    markAsRead(normalizedModuleName, readCount);
  };

  return {
    count,
    markAsRead: markAsReadForModule,
  };
};