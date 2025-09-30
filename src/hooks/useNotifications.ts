import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// 🚀 Database-backed Notification Types
export interface DatabaseNotification {
  id: number;
  uuid: string;
  tenant_id: number;
  user_id: number | null;
  type: 'success' | 'warning' | 'error' | 'info';
  priority: 'critical' | 'high' | 'normal' | 'low';
  category: string;
  title: string;
  message: string;
  action: string | null;
  action_url: string | null;
  is_read: boolean;
  is_persistent: boolean;
  read_at: string | null;
  expires_at: string | null;
  related_type: string | null;
  related_id: number | null;
  metadata: any;
  source: string;
  source_identifier: string | null;
  source_ip: string | null;
  created_at: string;
  updated_at: string;
  time_ago?: string;
  action_button?: {
    text: string;
    url: string;
    type: string;
  } | null;
}

export interface NotificationStats {
  total_notifications: number;
  unread_count: number;
  critical_unread: number;
  by_type: Record<string, number>;
  by_category: Record<string, number>;
  recent_activity: number;
}

export interface NotificationFilters {
  type?: 'success' | 'warning' | 'error' | 'info';
  priority?: 'critical' | 'high' | 'normal' | 'low';
  category?: string;
  is_read?: boolean;
  days?: number;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface CreateNotificationData {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  priority?: 'critical' | 'high' | 'normal' | 'low';
  category?: string;
  action?: string;
  action_url?: string;
  is_persistent?: boolean;
  expires_at?: string;
  related_type?: string;
  related_id?: number;
  metadata?: any;
  source?: string;
  source_identifier?: string;
}

// 🔔 Get notifications with filters and pagination
export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/notifications?${params.toString()}`);
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
}

// 📊 Get notification statistics
export function useNotificationStats() {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const response = await api.get('/notifications/stats');
      return (response as any).data.data as NotificationStats;
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000,
  });
}

// 🔢 Get unread notification count
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['unread-notification-count'],
    queryFn: async () => {
      const response = await api.get('/notifications/unread-count');
      return (response as any).data.count as number;
    },
    staleTime: 10000, // 10 seconds - more frequent for badge updates
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// 📝 Create a new notification
export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNotificationData) => {
      const response = await api.post('/notifications', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}

// ✅ Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await api.put(`/notifications/${uuid}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 📖 Mark notification as unread
export function useMarkNotificationAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await api.put(`/notifications/${uuid}/unread`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// ✅✅ Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 🗑️ Delete a notification
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      const response = await api.delete(`/notifications/${uuid}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 🗑️🗑️ Delete all notifications
export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/notifications/all');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 📦 Create product notification
export function useCreateProductNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: number;
      type: 'success' | 'warning' | 'error' | 'info';
      title: string;
      message: string;
      action?: string;
      action_url?: string;
      metadata?: any;
    }) => {
      const response = await api.post('/notifications/product', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 📊 Create stock notification
export function useCreateStockNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      product_id: number;
      type: 'warning' | 'error';
      title: string;
      message: string;
      current_stock?: number;
      min_stock_level?: number;
      metadata?: any;
    }) => {
      const response = await api.post('/notifications/stock', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 💳 Create transaction notification
export function useCreateTransactionNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      transaction_id: number;
      type: 'success' | 'warning' | 'error' | 'info';
      title: string;
      message: string;
      amount?: number;
      customer_name?: string;
      metadata?: any;
    }) => {
      const response = await api.post('/notifications/transaction', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] });
    },
  });
}

// 🚀 Helper hook for triggering notifications from inventory operations
export function useTriggerNotification() {
  const createNotification = useCreateNotification();
  const createProductNotification = useCreateProductNotification();
  const createStockNotification = useCreateStockNotification();
  const createTransactionNotification = useCreateTransactionNotification();

  const triggerNotification = async (
    type: 'success' | 'warning' | 'error' | 'info',
    title: string,
    message: string,
    action?: string,
    data?: any
  ) => {
    const notificationData: CreateNotificationData = {
      type,
      title,
      message,
      action,
      priority: type === 'error' ? 'critical' : type === 'warning' ? 'high' : 'normal',
      category: data?.action || 'general',
      is_persistent: ['error', 'warning'].includes(type),
      metadata: data,
    };

    // Route to specific notification types based on data
    if (data?.product_id && (data?.action === 'create' || data?.action === 'update' || data?.action === 'delete')) {
      return await createProductNotification.mutateAsync({
        product_id: data.product_id,
        type,
        title,
        message,
        action,
        metadata: data,
      });
    } else if (data?.product_id && (data?.action === 'restock' || data?.action === 'low_stock')) {
      return await createStockNotification.mutateAsync({
        product_id: data.product_id,
        type: type === 'error' ? 'error' : 'warning',
        title,
        message,
        current_stock: data.stock || data.new_stock,
        min_stock_level: data.min_stock,
        metadata: data,
      });
    } else if (data?.transaction_id || data?.action === 'sale') {
      return await createTransactionNotification.mutateAsync({
        transaction_id: data.transaction_id || Date.now(),
        type,
        title,
        message,
        amount: data.total_amount,
        customer_name: data.customer_name,
        metadata: data,
      });
    } else {
      // Generic notification
      return await createNotification.mutateAsync(notificationData);
    }
  };

  return {
    triggerNotification,
    isLoading: createNotification.isPending || createProductNotification.isPending || 
               createStockNotification.isPending || createTransactionNotification.isPending,
  };
} 