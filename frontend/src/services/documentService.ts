import { apiClient } from '@/lib/apiClient';

export interface DocumentType {
  id: string;
  name: string;
  prefix: string;
  category: string;
  description?: string;
}

export interface DocumentStats {
  total_documents: number;
  effective_documents: number;
  pending_reviews: number;
  overdue_reviews: number;
}

export interface DocumentVersion {
  id: string;
  version_number: number;
  filename: string;
  mime_type?: string;
  size_bytes?: number;
  status?: string;
  change_reason?: string;
  created_by?: string;
  created_at?: string;
}

export interface DocumentMetadata {
  id: string;
  key: string;
  value?: string;
  is_ai_generated: boolean;
  verified_by?: string;
  verified_at?: string;
}

export interface WorkflowStepInstance {
  id: string;
  step_order: number;
  step_name: string;
  assigned_to_id?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  due_date?: string;
  completed_at?: string;
  comments?: string;
}

export interface WorkflowInstance {
  id: string;
  document_id: string;
  template_id?: string;
  started_by_id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completed_at?: string;
  steps: WorkflowStepInstance[];
}

export interface DocumentResponse {
  id: string;
  document_number: string;
  title: string;
  description?: string;
  status: string;
  classification?: string;
  tags?: string[];
  processing_status?: string;
  organization_id: string;
  owner_id: string;
  department_id?: string;
  document_type_id?: string;
  folder_id?: string;
  effective_date?: string;
  next_review_date?: string;
  created_at: string;
  updated_at: string;
  current_version?: DocumentVersion;
  document_type?: DocumentType;
  department?: { id: string; name: string };
  owner?: { id: string; first_name: string; last_name: string; email: string };
}

export interface DocumentListResponse {
  items: DocumentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export const DocumentService = {
  async getStats(): Promise<DocumentStats> {
    return apiClient.get<DocumentStats>('/documents/stats');
  },

  async listDocuments(params?: { 
    page?: number; 
    page_size?: number; 
    status?: string;
    department_id?: string;
    document_type_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<DocumentListResponse> {
    return apiClient.get<DocumentListResponse>('/documents', { params });
  },

  async getDocument(id: string): Promise<DocumentResponse> {
    return apiClient.get<DocumentResponse>(`/documents/${id}`);
  },

  async updateDocument(id: string, data: Partial<DocumentResponse>): Promise<DocumentResponse> {
    return apiClient.patch<DocumentResponse>(`/documents/${id}`, data);
  },

  async archiveDocument(id: string): Promise<void> {
    return apiClient.delete<void>(`/documents/${id}`);
  },

  async createDocument(data: Record<string, unknown>): Promise<DocumentResponse> {
    return apiClient.post<DocumentResponse>('/documents', data);
  },

  async createRevision(id: string): Promise<DocumentResponse> {
    return apiClient.post<DocumentResponse>(`/documents/${id}/revision`);
  },

  async continueVersion(id: string): Promise<DocumentResponse> {
    return apiClient.post<DocumentResponse>(`/documents/${id}/continue`);
  },

  async markObsolete(id: string): Promise<DocumentResponse> {
    return apiClient.post<DocumentResponse>(`/documents/${id}/obsolete`);
  },

  async uploadVersion(id: string, file: File, changeReason?: string): Promise<{ version: DocumentVersion; preview_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (changeReason) {
      formData.append('change_reason', changeReason);
    }
    
    // apiClient will automatically omit Content-Type header so the browser sets it with the boundary for FormData
    return apiClient.post<{ version: DocumentVersion; preview_url: string }>(`/documents/${id}/versions`, formData);
  },

  async getVersions(id: string): Promise<DocumentVersion[]> {
    return apiClient.get<DocumentVersion[]>(`/documents/${id}/versions`);
  },

  async getPreviewUrl(id: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`/documents/${id}/preview-url`);
  },

  async getMetadata(id: string): Promise<DocumentMetadata[]> {
    return apiClient.get<DocumentMetadata[]>(`/documents/${id}/metadata`);
  },

  async updateMetadata(id: string, entries: Array<{ key: string; value?: string; is_ai_generated?: boolean }>): Promise<DocumentMetadata[]> {
    return apiClient.put<DocumentMetadata[]>(`/documents/${id}/metadata`, entries);
  },

  async getDocumentTypes(): Promise<DocumentType[]> {
    return apiClient.get<DocumentType[]>('/documents/types');
  },

  async getWorkflow(documentId: string): Promise<WorkflowInstance> {
    return apiClient.get<WorkflowInstance>(`/documents/${documentId}/workflow`);
  },

  async startWorkflow(documentId: string, templateId?: string): Promise<WorkflowInstance> {
    return apiClient.post<WorkflowInstance>(`/documents/${documentId}/workflow/start`, { template_id: templateId });
  },

  async submitReview(stepId: string, action: 'APPROVE' | 'REJECT', comments?: string): Promise<WorkflowStepInstance> {
    return apiClient.post<WorkflowStepInstance>(`/workflows/steps/${stepId}/review`, { action, comments });
  },

  async searchDocuments(params: {
    search?: string;
    page?: number;
    page_size?: number;
    status?: string;
    department_id?: string;
    document_type_id?: string;
  }): Promise<DocumentListResponse> {
    return apiClient.get<DocumentListResponse>('/documents', { params });
  },

  async getSummary(documentId: string): Promise<{ summary: string }> {
    return apiClient.get<{ summary: string }>(`/documents/${documentId}/summary`);
  },

  async getExtractedMetadata(documentId: string): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>(`/documents/${documentId}/extract-metadata`);
  },

  async askQuestion(documentId: string, question: string): Promise<{ answer: string }> {
    return apiClient.post<{ answer: string }>(`/documents/${documentId}/ask`, { question });
  },

  async getShares(documentId: string): Promise<unknown[]> {
    return apiClient.get<unknown[]>(`/documents/${documentId}/shares`);
  },

  async createShare(documentId: string, data: Record<string, unknown>): Promise<unknown> {
    return apiClient.post<unknown>(`/documents/${documentId}/shares`, data);
  },

  async getProcessingStatus(documentId: string): Promise<{ status: string, message?: string }> {
    return apiClient.get<{ status: string, message?: string }>(`/documents/${documentId}/processing`);
  }
};
