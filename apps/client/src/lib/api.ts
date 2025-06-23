import { ApiResponse, Provider } from '@service-peek/shared';

const API_BASE_URL = 'http://localhost:3001/api/v1';

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: unknown
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return result as ApiResponse<T>;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Integration API endpoints
 */
export const integrationApi = {
  // Get all providers
  getProviders: () => {
    return apiRequest<Provider[]>('/providers');
  },
  
  // Get a specific provider
  getProvider: (providerId: number) => {
    return apiRequest<Provider>(`/providers/${providerId}`);
  },
  
  // Create a new provider
  createProvider: (providerData: {
    provider_name: string;
    provider_ip: string;
    username: string;
    private_key_filename: string;
    ssh_port?: number;
  }) => {
    return apiRequest<Provider>('/providers', 'POST', providerData);
  },
  
  // Get provider instances (services)
  getProviderInstances: (providerId: number) => {
    return apiRequest<{ provider: Provider; containers: any[] }>(`/providers/${providerId}/instance`);
  },
  
  // Add services in bulk
  addServicesBulk: (providerId: number, serviceNames: string[]) => {
    return apiRequest<any[]>(`/providers/${providerId}/instance/bulk`, 'POST', {
      service_names: serviceNames,
    });
  },
  
  // Get services for a provider
  getServices: (providerId: number) => {
    return apiRequest<any[]>(`/providers/${providerId}/services`);
  },
  
  // Delete a provider
  deleteProvider: (providerId: number) => {
    return apiRequest<{ message: string }>(`/providers/${providerId}`, 'DELETE');
  },
  
  // Update a provider
  updateProvider: (providerId: number, providerData: {
    provider_name: string;
    provider_ip: string;
    username: string;
    private_key_filename: string;
    ssh_port?: number;
  }) => {
    return apiRequest<Provider>(`/providers/${providerId}`, 'PUT', providerData);
  },
};
