import { ApiResponse, Provider, Service, ServiceWithProvider, DiscoveredService, Tag, Integration, IntegrationType } from '@service-peek/shared';
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
 * Provider API endpoints
 */
export const providerApi = {
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
          providerIP: provider.providerIP,
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
    providerIP: string;
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
    providerIP: string;
    username: string;
    privateKeyFilename: string;
    SSHPort?: number;
    providerType: string;
  }) => {
    // Send data in camelCase format as expected by the server schema
    return apiRequest<Provider>(`/providers/${providerId}`, 'PUT', providerData);
  },

  // Test provider connection
  testProviderConnection: (providerData: {
    name: string;
    providerIP: string;
    username: string;
    privateKeyFilename: string;
    SSHPort?: number;
    providerType: string;
  }) => {
    return apiRequest<{ isValidConnection: boolean }>(
      '/providers/test-connection',
      'POST',
      providerData
    );
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
    serviceIP?: string;
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
      ...(serviceData.serviceIP && { serviceIP: serviceData.serviceIP }),
      ...(serviceData.serviceStatus && { serviceStatus: serviceData.serviceStatus }),
      ...(serviceData.containerDetails && { containerDetails: serviceData.containerDetails })
    });
  },

  // Update a service
  updateService: (serviceId: number, serviceData: Partial<{
    providerId: number;
    name: string;
    serviceIP: string;
    serviceStatus: string;
    serviceType: string;
    containerDetails: {
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

  // Start a service
  startService: (serviceId: number) => {
    console.log('API startService called with ID:', serviceId);
    return apiRequest<ServiceWithProvider>(`/services/${serviceId}/start`, 'POST');
  },

  // Stop a service
  stopService: (serviceId: number) => {
    console.log('API stopService called with ID:', serviceId);
    return apiRequest<ServiceWithProvider>(`/services/${serviceId}/stop`, 'POST');
  },

  // Get service logs
  getServiceLogs: (serviceId: number) => {
    console.log('API getServiceLogs called with ID:', serviceId);
    // Make sure we're using the correct path
    return apiRequest<string[]>(`/services/${serviceId}/logs`, 'GET');
  },

  // Tag APIs

  // Get all tags
  getAllTags: () => {
    return apiRequest<Tag[]>('/tags');
  },

  // Get a specific tag
  getTagById: (tagId: number) => {
    return apiRequest<Tag>(`/tags/${tagId}`);
  },

  // Create a new tag
  createTag: (tagData: { name: string; color: string }) => {
    return apiRequest<Tag>('/tags', 'POST', tagData);
  },

  // Update a tag
  updateTag: (tagId: number, tagData: Partial<{ name: string; color: string }>) => {
    return apiRequest<Tag>(`/tags/${tagId}`, 'PUT', tagData);
  },

  // Delete a tag
  deleteTag: (tagId: number) => {
    return apiRequest<void>(`/tags/${tagId}`, 'DELETE');
  },

  // Add tag to service
  addTagToService: (serviceId: number, tagId: number) => {
    return apiRequest<{ message: string }>(`/services/${serviceId}/tags`, 'POST', { tagId });
  },

  // Remove tag from service
  removeTagFromService: (serviceId: number, tagId: number) => {
    return apiRequest<{ message: string }>(`/services/${serviceId}/tags/${tagId}`, 'DELETE');
  },

  // Get tags for a service
  getServiceTags: (serviceId: number) => {
    return apiRequest<Tag[]>(`/services/${serviceId}/tags`);
  },
};

/**
 * Integration API endpoints
 */
export const integrationApi = {
  // Get all integrations
  getIntegrations: async () => {
    try {
      const response = await apiRequest<{integrations: Integration[]}>('/integrations');
      return response;
    } catch (error) {
      console.error('Error getting integrations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Create a new integration
  createIntegration: async (integrationData: {
    name: string;
    type: IntegrationType;
    externalUrl: string;
    credentials: Record<string, any>;
  }) => {
    try {
      const response = await apiRequest<Integration>('/integrations', 'POST', integrationData);
      return response;
    } catch (error) {
      console.error('Error creating integration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Update an integration
  updateIntegration: async (integrationId: number, integrationData: {
    name: string;
    type: IntegrationType;
    externalUrl: string;
    credentials: Record<string, any>;
  }) => {
    try {
      const response = await apiRequest<Integration>(`/integrations/${integrationId}`, 'PUT', integrationData);
      return response;
    } catch (error) {
      console.error('Error updating integration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Delete an integration
  deleteIntegration: async (integrationId: number) => {
    try {
      const response = await apiRequest<{message: string}>(`/integrations/${integrationId}`, 'DELETE');
      return response;
    } catch (error) {
      console.error('Error deleting integration:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Get integration URLs
  getIntegrationUrls: async (integrationId: number, tags: string[]) => {
    try {
      const queryParams = tags.map(tag => `tags=${encodeURIComponent(tag)}`).join('&');
      const response = await apiRequest<{name: string, url: string}[]>(`/integrations/${integrationId}/urls?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Error getting integration URLs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
};
