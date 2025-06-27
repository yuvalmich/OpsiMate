import { ApiResponse, Provider, Service, ServiceWithProvider, DiscoveredService } from '@service-peek/shared';
import { SavedView } from '@/types/SavedView';

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
    console.log(`API Request: ${method} ${url}`, data ? { data } : '');
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText || 'Unknown error'}`,
      };
    }
    
    const result = await response.json();
    console.log(`API Response (${method} ${url}):`, result);
    return result as ApiResponse<T>;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error(`API Error (${method} ${endpoint}):`, errorMessage, error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Integration API endpoints
 */
/**
 * Views API endpoints
 */
export const viewsApi = {
  // Get all views for the current user
  getViews: () => {
    return apiRequest<SavedView[]>('/views');
  },
  
  // Get a specific view
  getView: (viewId: string) => {
    return apiRequest<SavedView>(`/views/${viewId}`);
  },
  
  // Save a view (create or update)
  saveView: (view: SavedView) => {
    return apiRequest<SavedView>('/views', 'POST', view);
  },
  
  // Delete a view
  deleteView: (viewId: string) => {
    return apiRequest<{message: string}>(`/views/${viewId}`, 'DELETE');
  },
  
  // Set active view
  setActiveView: (viewId: string) => {
    return apiRequest<{message: string}>(`/views/active/${viewId}`, 'POST');
  },
  
  // Get active view ID
  getActiveViewId: () => {
    return apiRequest<{activeViewId: string | null}>('/views/active');
  },
};

/**
 * Integration API endpoints
 */
export const integrationApi = {
  // Provider APIs
  
  // Get all providers
  getProviders: async () => {
    try {
      const response = await apiRequest<{providers: any[]}>('/providers');
      
      // The server already returns camelCase, so no transformation needed
      if (response.success && response.data && response.data.providers) {
        const transformedProviders = response.data.providers.map((provider: any) => ({
          id: provider.id,
          name: provider.name,
          providerIp: provider.providerIp,
          username: provider.username,
          privateKeyFilename: provider.privateKeyFilename,
          SSHPort: provider.SSHPort,
          createdAt: provider.createdAt,
          providerType: provider.providerType
        }));
        
        return {
          success: response.success,
          data: { providers: transformedProviders }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching providers:', error);
      return { success: false, error: 'Failed to fetch providers' };
    }
  },
  
  // Get a specific provider
  getProvider: (providerId: number) => {
    return apiRequest<Provider>(`/providers/${providerId}`);
  },
  
  // Create a new provider
  createProvider: (providerData: {
    name: string;
    providerIp: string;
    username: string;
    privateKeyFilename: string;
    SSHPort?: number;
    providerType: string;
  }) => {
    return apiRequest<Provider>('/providers', 'POST', providerData);
  },
  
  // Get provider instances (services)
  getProviderInstances: (providerId: number) => {
    return apiRequest<DiscoveredService[]>(`/providers/${providerId}/discover-services`);
  },
  
  // Add services in bulk
  addServicesBulk: (providerId: number, serviceNames: string[]) => {
    return apiRequest<any[]>(`/providers/${providerId}/instance/bulk`, 'POST', {
      service_names: serviceNames,
    });
  },
  
  // Get services for a provider
  getProviderServices: (providerId: number) => {
    return apiRequest<any[]>(`/providers/${providerId}/services`);
  },
  
  // Delete a provider
  deleteProvider: (providerId: number) => {
    return apiRequest<void>(`/providers/${providerId}`, 'DELETE');
  },
  
  // Update a provider
  updateProvider: (providerId: number, providerData: {
    name: string;
    providerIp: string;
    username: string;
    privateKeyFilename: string;
    SSHPort?: number;
    providerType: string;
  }) => {
    // Convert camelCase to snake_case for the API
    const convertedData = {
      provider_name: providerData.name,
      provider_ip: providerData.providerIp,
      username: providerData.username,
      private_key_filename: providerData.privateKeyFilename,
      ssh_port: providerData.SSHPort,
      provider_type: providerData.providerType
    };
    return apiRequest<Provider>(`/providers/${providerId}`, 'PUT', convertedData);
  },
  
  // Service APIs
  
  // Get all services with provider details
  getAllServices: () => {
    return apiRequest<ServiceWithProvider[]>('/services');
  },
  
  // Get a specific service with provider details
  getServiceById: (serviceId: number) => {
    return apiRequest<ServiceWithProvider>(`/services/${serviceId}`);
  },
  
  // Create a new service
  createService: (serviceData: {
    providerId: number;
    name: string;
    serviceIp?: string;
    serviceStatus?: string;
    serviceType: 'MANUAL' | 'DOCKER' | 'SYSTEMD';
    containerDetails?: {
      id?: string;
      image?: string;
      created?: string;
    };
  }) => {
    return apiRequest<ServiceWithProvider>('/services', 'POST', {
      providerId: serviceData.providerId,
      name: serviceData.name,
      serviceType: serviceData.serviceType,
      ...(serviceData.serviceIp && { serviceIp: serviceData.serviceIp }),
      ...(serviceData.serviceStatus && { serviceStatus: serviceData.serviceStatus }),
      ...(serviceData.containerDetails && { containerDetails: serviceData.containerDetails })
    });
  },
  
  // Update a service
  updateService: (serviceId: number, serviceData: Partial<{
    provider_id: number;
    service_name: string;
    service_ip: string;
    service_status: string;
    service_type: string;
    container_details: {
      id?: string;
      image?: string;
      created?: string;
    };
  }>) => {
    return apiRequest<ServiceWithProvider>(`/services/${serviceId}`, 'PUT', serviceData);
  },
  
  // Delete a service
  deleteService: (serviceId: number) => {
    console.log('API deleteService called with ID:', serviceId);
    return apiRequest<void>(`/services/${serviceId}`, 'DELETE');
  },
};
