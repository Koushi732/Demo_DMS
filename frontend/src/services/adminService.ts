import { apiClient } from '@/lib/apiClient';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  position: string;
  is_active: boolean;
  department: { id: string; name: string } | null;
  roles: Array<{ id: string; name: string }>;
}

export interface SystemSettings {
  companyName: string;
  systemUrl: string;
  supportEmail: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  head_user_id: string | null;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system_role: boolean;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: any[];
}

export const AdminService = {
  async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>('/auth/roles');
  },
  
  async getPermissions(): Promise<any[]> {
    return []; // Out of scope for current permissions model
  },
  
  async getDocumentTypes(): Promise<any[]> {
    return apiClient.get<any[]>('/documents/types');
  },

  async getSystemSettings(): Promise<any> {
    return apiClient.get<any>('/dashboard/settings');
  },

  async updateSystemSettings(settings: any): Promise<any> {
    return apiClient.put<any>('/dashboard/settings', settings);
  },

  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/auth/users');
  },

  async getDepartments(): Promise<Department[]> {
    return apiClient.get<Department[]>('/auth/departments');
  },

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return apiClient.get<WorkflowTemplate[]>('/templates');
  }
};
