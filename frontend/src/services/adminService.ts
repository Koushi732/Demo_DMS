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
  steps: unknown[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface DocumentType {
  id: string;
  name: string;
  prefix: string;
  category: string;
  description?: string;
}

export const AdminService = {
  async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>('/auth/roles');
  },
  
  async getPermissions(): Promise<Permission[]> {
    return []; // Out of scope for current permissions model
  },
  
  async getDocumentTypes(): Promise<DocumentType[]> {
    return apiClient.get<DocumentType[]>('/documents/types');
  },

  async getSystemSettings(): Promise<SystemSettings> {
    return apiClient.get<SystemSettings>('/dashboard/settings');
  },

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    return apiClient.put<SystemSettings>('/dashboard/settings', settings);
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
