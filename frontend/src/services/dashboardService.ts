import { apiClient } from '@/lib/apiClient';

export interface DashboardMetrics {
  total_documents: number;
  distribution: Record<string, number>;
  recent_activity: Array<{
    id: string;
    action: string;
    resource_type: string;
    details?: string;
    timestamp: string;
    user_id?: string;
  }>;
  periodic_review_queue: Array<{
    id: string;
    title: string;
    document_number: string;
    due_date: string;
  }>;
}

export const DashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    return apiClient.get<DashboardMetrics>('/dashboard/metrics');
  }
};
