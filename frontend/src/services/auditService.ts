import { apiClient } from '@/lib/apiClient';

export interface AuditEvent {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  user_name?: string;
}

export interface AuditListResponse {
  items: AuditEvent[];
  total: number;
  page: number;
  page_size: number;
}

export const AuditService = {
  async listEvents(params?: {
    page?: number;
    page_size?: number;
    action?: string;
    user_id?: string;
    resource_type?: string;
  }): Promise<AuditListResponse> {
    return apiClient.get<AuditListResponse>('/audit', { params });
  }
};
