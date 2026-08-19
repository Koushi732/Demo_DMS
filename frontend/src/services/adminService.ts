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
    return []; // Optional for now
  },
  
  async getDocumentTypes(): Promise<any[]> {
    return []; // Optional for now
  },

  async getSystemSettings(): Promise<any> {
    return {
      companyName: 'Aureon Pharmaceuticals',
      sessionTimeoutMinutes: 30,
      passwordExpirationDays: 90,
      maxUploadSizeMb: 50,
      requireMfa: true,
      allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
    };
  },

  async updateSystemSettings(settings: any): Promise<any> {
    return settings;
  },

  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/auth/users');
  },

  async getDepartments(): Promise<Department[]> {
    return apiClient.get<Department[]>('/auth/departments');
  },

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return apiClient.get<WorkflowTemplate[]>('/workflows/templates');
  }
};
