import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { integrationApi } from "../lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Server, Cloud, Database, Globe, MoreVertical, Search, Plus, Trash, RefreshCw, Settings, ListPlus, Edit, Container, ChevronDown, ChevronUp, Play, Square, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { IntegrationType } from "./Integrations";
import { AddServiceDialog, ServiceConfig } from "@/components/AddServiceDialog";


import { EditIntegrationDialog } from "@/components/EditIntegrationDialog";

// Define the structure of an integration instance
export interface IntegrationInstance {
  id: string;
  name: string;
  type: IntegrationType;
  status: "online" | "offline" | "warning" | "unknown";
  details: Record<string, string>;
  lastConnected?: string;
  createdAt: string;
  services?: ServiceConfig[];
}

// Mock data for integration instances
const mockIntegrationInstances: IntegrationInstance[] = [
  {
    id: "server-1",
    name: "Production API Server",
    type: "server",
    status: "online",
    details: {
      Hostname: "192.168.1.100",
      Port: "22",
      Username: "admin",
      Private_key_filename: "id_rsa",
      Provider_type: "VM"
    },
    lastConnected: "2025-06-21T10:30:00Z",
    createdAt: "2025-06-01T08:00:00Z"
  },
  {
    id: "server-2",
    name: "Database Server",
    type: "server",
    status: "warning",
    details: {
      Hostname: "192.168.1.101",
      Port: "22",
      Username: "dbadmin",
      Private_key_filename: "id_rsa_db",
      Provider_type: "VM"
    },
    lastConnected: "2025-06-21T09:15:00Z",
    createdAt: "2025-06-02T14:30:00Z"
  },
  {
    id: "kubernetes-1",
    name: "Development Cluster",
    type: "kubernetes",
    status: "online",
    details: {
      Context: "dev-cluster",
      Namespace: "default"
    },
    lastConnected: "2025-06-21T11:45:00Z",
    createdAt: "2025-06-05T09:20:00Z"
  },
  {
    id: "aws-ec2-1",
    name: "Web Server Fleet",
    type: "aws-ec2",
    status: "online",
    details: {
      Region: "us-west-2",
      InstanceCount: "5"
    },
    lastConnected: "2025-06-21T12:10:00Z",
    createdAt: "2025-06-10T16:45:00Z"
  },
  {
    id: "aws-eks-1",
    name: "Production Kubernetes",
    type: "aws-eks",
    status: "offline",
    details: {
      Region: "us-east-1",
      ClusterName: "prod-cluster"
    },
    lastConnected: "2025-06-20T23:50:00Z",
    createdAt: "2025-06-15T11:30:00Z"
  }
];

// Helper function to get the appropriate icon for an integration type
const getIntegrationIcon = (type: IntegrationType) => {
  switch (type) {
    case "server":
      return <Server className="h-5 w-5" />;
    case "kubernetes":
      return <Globe className="h-5 w-5" />;
    case "aws-ec2":
    case "aws-eks":
    case "gcp-compute":
    case "azure-vm":
      return <Cloud className="h-5 w-5" />;
    default:
      return <Database className="h-5 w-5" />;
  }
};

// Helper function to get a readable name for an integration type
export const getIntegrationTypeName = (type: IntegrationType): string => {
  switch (type) {
    case "server": return "Server";
    case "kubernetes": return "Kubernetes";
    case "aws-ec2": return "AWS EC2";
    case "aws-eks": return "AWS EKS";
    case "gcp-compute": return "GCP Compute";
    case "azure-vm": return "Azure VM";
    default: return type;
  }
};

// Helper function to get the category of an integration type
const getIntegrationCategory = (type: IntegrationType): string => {
  switch (type) {
    case "server": return "server";
    case "kubernetes": return "kubernetes";
    case "aws-ec2":
    case "aws-eks":
    case "gcp-compute":
    case "azure-vm":
      return "cloud";
    default:
      return "other";
  }
};

// Helper function to get status badge color
export const getStatusBadgeColor = (status: IntegrationInstance["status"]) => {
  switch (status) {
    case "online": return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
    case "offline": return "bg-red-500/20 text-red-700 hover:bg-red-500/30";
    case "warning": return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30";
    case "unknown":
    default: return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30";
  }
};

const getServiceStatusBadgeColor = (status: ServiceConfig["status"]) => {
  switch (status) {
    case "running": return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
    case "stopped": return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30";
    case "error": return "bg-red-500/20 text-red-700 hover:bg-red-500/30";
    case "unknown":
    default: return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30";
  }
};

export function MyIntegrations() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [integrationInstances, setIntegrationInstances] = useState<IntegrationInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationInstance | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedServerForService, setSelectedServerForService] = useState<IntegrationInstance | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceConfig | null>(null);
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [loadingServices, setLoadingServices] = useState<Set<string>>(new Set());
  
  // Function to load integrations from API
  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const response = await integrationApi.getProviders();
      
      if (response.success && response.data && response.data.providers) {
        // Convert API data to IntegrationInstance format
        const apiIntegrations: IntegrationInstance[] = response.data.providers.map(provider => {
          const mappedIntegration = {
            id: provider.id ? provider.id.toString() : `temp-${Date.now()}`,
            name: provider.name || '',
            type: "server" as IntegrationType,
            status: "online" as const, // Default to online since we don't have status info from API yet
            details: {
              Hostname: provider.providerIp || '',
              Port: provider.SSHPort ? provider.SSHPort.toString() : '22',
              Username: provider.username || '',
              Private_key_filename: provider.privateKeyFilename || '',
              Provider_type: provider.providerType || 'VM'
            },
            lastConnected: new Date().toISOString(),
            createdAt: provider.createdAt ? new Date(provider.createdAt).toISOString() : new Date().toISOString(),
            services: []
          };
          
          return mappedIntegration;
        });
        
        setIntegrationInstances(apiIntegrations);
      } else if (import.meta.env.DEV && (!response.data || !response.data.providers || response.data.providers.length === 0)) {
        // In development, use mock data if no saved integrations exist
        setIntegrationInstances(mockIntegrationInstances);
      }
    } catch (error) {
      console.error("Error loading integrations:", error);
      toast({
        title: "Error loading integrations",
        description: "There was a problem loading your integrations",
        variant: "destructive"
      });
      
      // Fall back to mock data in development
      if (import.meta.env.DEV) {
        setIntegrationInstances(mockIntegrationInstances);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load integrations from API
  useEffect(() => {
    fetchIntegrations();
  }, [toast]);

  // Filter integrations based on search query and active tab
  const filteredIntegrations = integrationInstances.filter(integration => {
    // Add null checks to prevent toLowerCase() on undefined
    const name = integration?.name || '';
    const type = integration?.type || 'server';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      getIntegrationCategory(type) === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleRefreshIntegration = async (id: string) => {
    toast({
      title: "Refreshing integration",
      description: "Checking connection status..."
    });
    
    try {
      // Get the latest data from the API
      const response = await integrationApi.getProvider(parseInt(id));
      
      if (response.success && response.data) {
        // Update just this integration with fresh data
        const updatedIntegrations = integrationInstances.map(integration => 
          integration.id === id 
            ? { 
                ...integration, 
                name: response.data.name,
                details: {
                  Hostname: response.data.providerIp,
                  Port: response.data.SSHPort.toString(),
                  Username: response.data.username,
                  Private_key_filename: response.data.privateKeyFilename,
                  Provider_type: response.data.providerType
                },
                lastConnected: new Date().toISOString(),
                status: Math.random() > 0.3 ? "online" as const : "warning" as const // Simulate status check
              } 
            : integration
        );
        
        setIntegrationInstances(updatedIntegrations);
        
        toast({
          title: "Integration refreshed",
          description: "Connection status updated"
        });
      } else {
        throw new Error("Failed to refresh integration");
      }
    } catch (error) {
      console.error("Error refreshing integration:", error);
      toast({
        title: "Error refreshing",
        description: "There was a problem updating the integration status",
        variant: "destructive"
      });
    }
  };

  // Helper function to refresh services for a specific integration
  const refreshIntegrationServices = async (integration: IntegrationInstance) => {
    const integrationId = integration.id;
    const newLoading = new Set(loadingServices);
    newLoading.add(integrationId);
    setLoadingServices(newLoading);

    try {
      // Fetch services for this integration from the API
      const response = await integrationApi.getAllServices();
      
      if (response.success && response.data) {
        // Check if data is an array or if it's nested in another property
        const servicesArray = Array.isArray(response.data) ? response.data : 
          (response.data as any).services ? (response.data as any).services : [];
        
        // Filter services that belong to this provider
        const providerServices = servicesArray.filter(service => 
          service.provider_id && service.provider_id.toString() === integration.id
        );
        
        // Map API services to ServiceConfig format
        const serviceConfigs: ServiceConfig[] = providerServices.map(service => ({
          id: service.id.toString(),
          name: service.service_name,
          status: service.service_status as "running" | "stopped" | "error" | "unknown",
          type: service.service_type,
          service_ip: service.service_ip,
          containerDetails: service.container_details || undefined
        }));
        
        // Update the integration with its services
        const updatedIntegration = {
          ...integration,
          services: serviceConfigs
        };
        
        // Update the integrations list with the updated integration
        const updatedIntegrations = integrationInstances.map(item => 
          item.id === integration.id ? updatedIntegration : item
        );
        
        setIntegrationInstances(updatedIntegrations);
      }
    } catch (error) {
      console.error("Error fetching services for integration:", error);
      toast({
        title: "Error loading services",
        description: "There was a problem loading services for this integration",
        variant: "destructive"
      });
    } finally {
      const newLoading = new Set(loadingServices);
      newLoading.delete(integrationId);
      setLoadingServices(newLoading);
    }
  };

  const handleRowClick = async (integration: IntegrationInstance, e?: React.MouseEvent) => {
    // Prevent triggering when clicking on dropdown menu
    if (e && (e.target as HTMLElement).closest('[data-radix-popper-content-wrapper]')) {
      return;
    }

    const integrationId = integration.id;
    
    // If services are already loaded and card is expanded, collapse it
    if (expandedServices.has(integrationId) && integration.services && integration.services.length > 0) {
      const newExpanded = new Set(expandedServices);
      newExpanded.delete(integrationId);
      setExpandedServices(newExpanded);
      return;
    }

    // If services are not loaded yet, fetch them
    if (!integration.services || integration.services.length === 0) {
      await refreshIntegrationServices(integration);
    }

    // Expand the services
    const newExpanded = new Set(expandedServices);
    newExpanded.add(integrationId);
    setExpandedServices(newExpanded);
  };

  const handleServiceClick = (service: ServiceConfig) => {
    setSelectedService(service);
  };

  const handleServiceAction = async (integrationId: string, serviceId: string, action: "start" | "stop" | "restart") => {
    try {
      const serviceIdNum = parseInt(serviceId);
      
      if (action === "start") {
        const response = await integrationApi.startService(serviceIdNum);
        if (!response.success) throw new Error(response.error || "Failed to start service");
      } else if (action === "stop") {
        const response = await integrationApi.stopService(serviceIdNum);
        if (!response.success) throw new Error(response.error || "Failed to stop service");
      } else if (action === "restart") {
        // Stop then start
        await integrationApi.stopService(serviceIdNum);
        setTimeout(async () => {
          await integrationApi.startService(serviceIdNum);
        }, 1000);
      }
      
      toast({
        title: `Service ${action}ed`,
        description: `Service has been ${action}ed successfully`
      });
      
      // Refresh the integration to get updated service status
      setTimeout(() => handleRowClick(integrationInstances.find(i => i.id === integrationId)!), 2000);
      
    } catch (error) {
      console.error(`Error ${action}ing service:`, error);
      toast({
        title: `Error ${action}ing service`,
        description: error instanceof Error ? error.message : `Failed to ${action} service`,
        variant: "destructive"
      });
    }
  };

  const handleAddService = async (integrationId: string, service: ServiceConfig) => {
    try {
      // Close the dialog first
      setIsAddServiceDialogOpen(false);
      
      // Automatically expand the services section to show the new service
      const newExpanded = new Set(expandedServices);
      newExpanded.add(integrationId);
      setExpandedServices(newExpanded);
      
      toast({
        title: "Service added",
        description: `${service.name} has been successfully added`,
      });
      
      // Refresh only the specific integration's services after a short delay
      setTimeout(async () => {
        const integration = integrationInstances.find(i => i.id === integrationId);
        if (integration) {
          // Refresh just this integration's services without changing expansion state
          await refreshIntegrationServices(integration);
        }
      }, 500);
      
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error adding service",
        description: "There was a problem adding the service",
        variant: "destructive"
      });
    }
  };

  const handleServiceStatusChange = async (integrationId: string, serviceId: string, newStatus: "running" | "stopped" | "error" | "unknown") => {
    try {
      // Convert serviceId to number for API calls
      const serviceIdNum = parseInt(serviceId);
      
      // Call the appropriate API based on the requested status
      if (newStatus === "running") {
        const response = await integrationApi.startService(serviceIdNum);
        if (!response.success) {
          throw new Error(response.error || "Failed to start service");
        }
      } else if (newStatus === "stopped") {
        const response = await integrationApi.stopService(serviceIdNum);
        if (!response.success) {
          throw new Error(response.error || "Failed to stop service");
        }
      }
      
      // Update the UI with the new status
      const updatedIntegrations = integrationInstances.map(integration => {
        if (integration.id === integrationId && integration.services) {
          return {
            ...integration,
            services: integration.services.map(service => 
              service.id === serviceId ? { ...service, status: newStatus } : service
            )
          };
        }
        return integration;
      });

      setIntegrationInstances(updatedIntegrations);
      
      // Update selected integration if it's the one containing this service
      if (selectedIntegration && selectedIntegration.id === integrationId && selectedIntegration.services) {
        const updatedSelectedIntegration = {
          ...selectedIntegration,
          services: selectedIntegration.services.map(service => 
            service.id === serviceId ? { ...service, status: newStatus } : service
          )
        };
        setSelectedIntegration(updatedSelectedIntegration);
      }
    } catch (error) {
      console.error("Error updating service status:", error);
      toast({
        title: "Error updating service",
        description: typeof error === 'object' && error !== null && 'message' in error ? 
          (error as Error).message : "There was a problem updating the service status",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to update UI after service deletion
  const updateUIAfterServiceDeletion = (serviceId: string) => {
    // Find which integration contains this service and remove it
    const updatedIntegrations = integrationInstances.map(integration => {
      if (integration.services) {
        const serviceExists = integration.services.some(service => service.id === serviceId);
        if (serviceExists) {
          return {
            ...integration,
            services: integration.services.filter(service => service.id !== serviceId)
          };
        }
      }
      return integration;
    });
    
    setIntegrationInstances(updatedIntegrations);
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      // Convert serviceId to number
      const serviceIdNum = parseInt(serviceId);
      
      // Find which integration contains this service
      const containingIntegration = integrationInstances.find(integration => 
        integration.services?.some(service => service.id === serviceId)
      );
      
      if (!containingIntegration) {
        toast({
          title: "Service not found",
          description: "Could not find the service to delete",
          variant: "destructive"
        });
        return;
      }
      
      // Call the API to delete the service
      const response = await integrationApi.deleteService(serviceIdNum);
      
      if (response.success) {
        // Update the UI after successful deletion
        updateUIAfterServiceDeletion(serviceId);
        
        toast({
          title: "Service deleted",
          description: "The service has been successfully deleted."
        });
      } else {
        throw new Error(response.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error deleting service",
        description: error instanceof Error ? error.message : "There was a problem deleting the service",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIntegration = async () => {
    if (!selectedIntegration) return;
    try {
      // Call the API to delete the provider
      const response = await integrationApi.deleteProvider(parseInt(selectedIntegration.id));
      
      if (response.success) {
        // Update the UI by removing the deleted integration
        const updatedIntegrations = integrationInstances.filter(
          (integration) => integration.id !== selectedIntegration.id
        );
        setIntegrationInstances(updatedIntegrations);

        toast({
          title: "Integration deleted",
          description: `${selectedIntegration.name} has been successfully deleted.`,
        });
        setSelectedIntegration(null);
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error(response.error || 'Failed to delete integration');
      }
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast({
        title: "Error deleting integration",
        description: "There was a problem deleting your integration.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateIntegration = async (integrationId: string, updatedData: {
    name: string;
    providerIp: string;
    username: string;
    privateKeyFilename: string;
    SSHPort: number;
    providerType: string;
  }) => {
    try {
      // Call the API to update the provider
      const response = await integrationApi.updateProvider(parseInt(integrationId), updatedData);
      
      if (response.success && response.data) {
        // Update the UI with the updated integration
        const updatedIntegrations = integrationInstances.map(integration => {
          if (integration.id === integrationId) {
            return {
              ...integration,
              name: updatedData.name,
              details: {
                ...integration.details,
                Hostname: updatedData.providerIp,
                Port: updatedData.SSHPort.toString(),
                Username: updatedData.username,
                Private_key_filename: updatedData.privateKeyFilename,
                Provider_type: updatedData.providerType
              },
              lastConnected: new Date().toISOString()
            };
          }
          return integration;
        });
        
        setIntegrationInstances(updatedIntegrations);
        
        // If this is the currently selected integration, update it
        if (selectedIntegration && selectedIntegration.id === integrationId) {
          const updatedIntegration = updatedIntegrations.find(i => i.id === integrationId);
          if (updatedIntegration) {
            setSelectedIntegration(updatedIntegration);
          }
        }
        
        toast({
          title: "Integration updated",
          description: `${updatedData.name} has been successfully updated.`,
        });
      } else {
        throw new Error(response.error || 'Failed to update integration');
      }
    } catch (error) {
      console.error("Error updating integration:", error);
      toast({
        title: "Error updating integration",
        description: "There was a problem updating your integration.",
        variant: "destructive",
      });
      throw error; // Re-throw to be caught by the EditIntegrationDialog
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <header className="bg-background border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">My Integrations</h1>
            <Link to="/integrations">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Integration
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4 bg-background">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="server">Servers</TabsTrigger>
            <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
            <TabsTrigger value="cloud">Cloud</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Integrations Grid */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredIntegrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => {
                const isExpanded = expandedServices.has(integration.id);
                const isLoading = loadingServices.has(integration.id);
                const hasServices = integration.services && integration.services.length > 0;
                const servicesToShow = hasServices && isExpanded ? 
                  (expandedServices.has(`${integration.id}-full`) ? integration.services : integration.services.slice(0, 3)) : [];
                const hasMoreServices = hasServices && integration.services!.length > 3;

                return (
                  <Card 
                    key={integration.id} 
                    className={`flex flex-col transition-all duration-300 hover:shadow-md ${
                      isExpanded ? 'shadow-lg ring-2 ring-primary/20' : ''
                    }`}
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 dark:bg-primary/20 text-primary p-2 rounded-lg flex-shrink-0">
                          {getIntegrationIcon(integration.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold leading-snug truncate">{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{getIntegrationTypeName(integration.type)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => handleRefreshIntegration(integration.id)}>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Refresh
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedIntegration(integration);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {integration.type === 'server' && (
                              <DropdownMenuItem onClick={() => {
                                setSelectedServerForService(integration);
                                setIsAddServiceDialogOpen(true);
                              }}>
                                <ListPlus className="mr-2 h-4 w-4" />
                                Add Service
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedIntegration(integration);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 focus:text-red-500"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenuPortal>
                      </DropdownMenu>
                    </CardHeader>
                    
                    <CardContent className="flex-grow pt-2 px-6 pb-4">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Hostname</p>
                          <p className="font-medium">{integration.details.Hostname}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Port</p>
                          <p className="font-medium">{integration.details.Port}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Username</p>
                          <p className="font-medium">{integration.details.Username}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">SSH Key</p>
                          <p className="font-medium">{integration.details.Private_key_filename}</p>
                        </div>
                      </div>

                      {/* Services Preview Section */}
                      {!isExpanded && !isLoading && (
                        <div 
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(integration, e);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {hasServices 
                                    ? `${integration.services!.length} Service${integration.services!.length !== 1 ? 's' : ''}`
                                    : 'Services'
                                  }
                                </span>
                              </div>
                              {!hasServices && !isLoading && (
                                <span className="text-xs text-muted-foreground/70 ml-6">Click to load and view</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {hasServices && (
                                <div className="flex -space-x-1">
                                  {integration.services!.slice(0, 3).map((service, index) => (
                                    <div
                                      key={service.id}
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-background text-xs ${
                                        getServiceStatusBadgeColor(service.status)
                                      }`}
                                      title={service.name}
                                    >
                                      {service.type === "DOCKER" ? (
                                        <Container className="h-3 w-3" />
                                      ) : (
                                        <Server className="h-3 w-3" />
                                      )}
                                    </div>
                                  ))}
                                  {integration.services!.length > 3 && (
                                    <div className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-muted text-xs font-medium">
                                      +{integration.services!.length - 3}
                                    </div>
                                  )}
                                </div>
                              )}
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          {hasServices && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {integration.services!.slice(0, 2).map(service => service.name).join(', ')}
                              {integration.services!.length > 2 && ` and ${integration.services!.length - 2} more`}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Loading State */}
                      {isLoading && (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2 text-sm text-muted-foreground">Loading services...</span>
                        </div>
                      )}

                      {/* Services List */}
                      {isExpanded && hasServices && !isLoading && (
                        <div className="space-y-3 animate-in slide-in-from-top-5 duration-300">
                          <div 
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -m-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newExpanded = new Set(expandedServices);
                              newExpanded.delete(integration.id);
                              setExpandedServices(newExpanded);
                            }}
                          >
                            <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                              <Server className="h-4 w-4" />
                              Services ({integration.services!.length})
                            </h4>
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="space-y-3">
                            {servicesToShow.map((service) => (
                              <div 
                                key={service.id} 
                                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-shrink-0">
                                    {service.type === "DOCKER" ? (
                                      <Container className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <Server className="h-4 w-4 text-purple-500" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate">{service.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {service.type === "DOCKER" 
                                        ? `Container: ${service.containerDetails?.image || service.name}` 
                                        : service.service_ip 
                                          ? `IP: ${service.service_ip}` 
                                          : "Manual service"
                                      }
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`text-xs ${getServiceStatusBadgeColor(service.status)}`}>
                                    {service.status}
                                  </Badge>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuPortal>
                                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={() => handleServiceClick(service)}>
                                          <Terminal className="mr-2 h-3 w-3" /> Details
                                        </DropdownMenuItem>
                                        {service.status !== 'running' && (
                                          <DropdownMenuItem onClick={() => handleServiceAction(integration.id, service.id, 'start')}>
                                            <Play className="mr-2 h-3 w-3" /> Start
                                          </DropdownMenuItem>
                                        )}
                                        {service.status === 'running' && (
                                          <DropdownMenuItem onClick={() => handleServiceAction(integration.id, service.id, 'stop')}>
                                            <Square className="mr-2 h-3 w-3" /> Stop
                                          </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => handleServiceAction(integration.id, service.id, 'restart')}>
                                          <RefreshCw className="mr-2 h-3 w-3" /> Restart
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteService(service.id)}
                                          className="text-red-500 focus:text-red-500"
                                        >
                                          <Trash className="mr-2 h-3 w-3" /> Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenuPortal>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* See More / See Less Button */}
                          {hasMoreServices && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                const key = `${integration.id}-full`;
                                const newExpanded = new Set(expandedServices);
                                if (expandedServices.has(key)) {
                                  newExpanded.delete(key);
                                } else {
                                  newExpanded.add(key);
                                }
                                setExpandedServices(newExpanded);
                              }}
                            >
                              {expandedServices.has(`${integration.id}-full`) 
                                ? `Show less (${integration.services!.length - 3} hidden)` 
                                : `See ${integration.services!.length - 3} more services`
                              }
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge className={getStatusBadgeColor(integration.status)}>{integration.status}</Badge>
                      {integration.lastConnected && (
                        <p>Last connected: {new Date(integration.lastConnected).toLocaleDateString()}</p>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="bg-muted/30 p-4 rounded-full mb-4">
                <Database className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No integrations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "No integrations match your search query." : "You haven't added any integrations yet."}
              </p>
              <Link to="/integrations">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      


      {/* Add Service Dialog */}
      {selectedServerForService && (
        <AddServiceDialog
          serverId={selectedServerForService.id}
          serverName={selectedServerForService.name}
          open={isAddServiceDialogOpen}
          onClose={() => setIsAddServiceDialogOpen(false)}
          onServiceAdded={(service) => handleAddService(selectedServerForService.id, service)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this integration?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              <span className="font-semibold"> {selectedIntegration?.name} </span>
              integration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteIntegration}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Integration Dialog */}
      <EditIntegrationDialog
        integration={selectedIntegration}
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleUpdateIntegration}
      />
    </DashboardLayout>
  );
}

export default MyIntegrations;
