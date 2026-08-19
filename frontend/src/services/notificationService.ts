import { apiClient } from '@/lib/apiClient';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface NotificationListResponse {
  items: Notification[];
  unread_count: number;
}

export const NotificationService = {
  async getNotifications(): Promise<NotificationListResponse> {
    return apiClient.get<NotificationListResponse>('/notifications');
  },

  async markAllAsRead(): Promise<{status: string}> {
    return apiClient.post<{status: string}>('/notifications/read');
  },

  async markAsRead(id: string): Promise<{status: string}> {
    return apiClient.post<{status: string}>(`/notifications/${id}/read`);
  }
};
