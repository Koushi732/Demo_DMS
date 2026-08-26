import { createClient } from './supabase/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getAuthHeader(): Promise<HeadersInit> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    return {
      'Authorization': `Bearer ${session.access_token}`
    };
  }
  return {};
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export const apiClient = {
  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...restOptions } = options;
    
    // Build URL with query params
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const authHeader = await getAuthHeader();
    const headers = {
      ...authHeader,
      ...customHeaders,
    };

    // Auto-set Content-Type if body is JSON and not FormData
    if (restOptions.body && !(restOptions.body instanceof FormData) && !(headers as Record<string, string>)['Content-Type']) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers,
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        let errorData: unknown = null;
        try {
          errorData = await response.json();
          if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' 
              ? errorData.detail 
              : JSON.stringify(errorData.detail);
          }
        } catch (_) {
          // Response is not JSON
        }
        throw new ApiError(response.status, errorMessage, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error(error instanceof Error ? error.message : 'Network request failed');
    }
  },

  async get<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  },

  async post<T>(endpoint: string, data?: unknown, options?: Omit<FetchOptions, 'method'>) {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.fetch<T>(endpoint, { ...options, method: 'POST', body });
  },

  async put<T>(endpoint: string, data?: unknown, options?: Omit<FetchOptions, 'method'>) {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.fetch<T>(endpoint, { ...options, method: 'PUT', body });
  },

  async patch<T>(endpoint: string, data?: unknown, options?: Omit<FetchOptions, 'method'>) {
    const body = data instanceof FormData ? data : data ? JSON.stringify(data) : undefined;
    return this.fetch<T>(endpoint, { ...options, method: 'PATCH', body });
  },

  async delete<T>(endpoint: string, options?: Omit<FetchOptions, 'method' | 'body'>) {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
};
