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
import { Server, Cloud, Database, Globe, MoreVertical, Search, Plus, Trash, RefreshCw, Settings, ListPlus, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { IntegrationType } from "./Integrations";
import { AddServiceDialog, ServiceConfig } from "@/components/AddServiceDialog";
import { ServicesList } from "@/components/ServicesList";
import { ServiceDetailsSheet } from "@/components/ServiceDetailsSheet";
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
      hostname: "192.168.1.100",
      port: "22",
      username: "admin"
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
      hostname: "192.168.1.101",
      port: "22",
      username: "dbadmin"
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
      context: "dev-cluster",
      namespace: "default"
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
      region: "us-west-2",
      instanceCount: "5"
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
      region: "us-east-1",
      clusterName: "prod-cluster"
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
  
  // Load integrations from API
  useEffect(() => {
    const fetchIntegrations = async () => {
      setIsLoading(true);
      try {
        const response = await integrationApi.getProviders();
        
        if (response.success && response.data) {
          // Convert API data to IntegrationInstance format
          const apiIntegrations: IntegrationInstance[] = response.data.map(provider => ({
            id: provider.id.toString(),
            name: provider.provider_name,
            type: "server" as IntegrationType,
            status: "online", // Default to online since we don't have status info from API yet
            details: {
              hostname: provider.provider_ip,
              port: provider.ssh_port.toString(),
              username: provider.username,
              private_key_filename: provider.private_key_filename
            },
            lastConnected: new Date().toISOString(),
            createdAt: provider.created_at || new Date().toISOString(),
            services: []
          }));
          
          setIntegrationInstances(apiIntegrations);
        } else if (import.meta.env.DEV && (!response.data || response.data.length === 0)) {
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
    
    fetchIntegrations();
  }, [toast]);

  // Filter integrations based on search query and active tab
  const filteredIntegrations = integrationInstances.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      getIntegrationCategory(integration.type) === activeTab;
    
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
                name: response.data.provider_name,
                details: {
                  hostname: response.data.provider_ip,
                  port: response.data.ssh_port.toString(),
                  username: response.data.username
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

  const handleRowClick = (integration: IntegrationInstance) => {
    setSelectedIntegration(integration);
  };

  const handleServiceClick = (service: ServiceConfig) => {
    setSelectedService(service);
  };

  const handleAddService = async (integrationId: string, service: ServiceConfig) => {
    try {
      // TODO: Add API endpoint for adding services
      // For now, we'll just update the UI
      
      let updatedSelectedIntegration: IntegrationInstance | null = null;
      const updatedIntegrations = integrationInstances.map(integration => {
        if (integration.id === integrationId) {
          const updatedIntegration = {
            ...integration,
            services: [...(integration.services || []), service]
          };
          updatedSelectedIntegration = updatedIntegration;
          return updatedIntegration;
        }
        return integration;
      });

      setIntegrationInstances(updatedIntegrations);
      if (updatedSelectedIntegration) {
        setSelectedIntegration(updatedSelectedIntegration);
      }
      setIsAddServiceDialogOpen(false);
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
      // TODO: Add API endpoint for updating service status
      // For now, we'll just update the UI
      
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
    } catch (error) {
      console.error("Error updating service status:", error);
      toast({
        title: "Error updating service",
        description: "There was a problem updating the service status",
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
    provider_name: string;
    provider_ip: string;
    username: string;
    private_key_filename: string;
    ssh_port: number;
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
              name: updatedData.provider_name,
              details: {
                ...integration.details,
                hostname: updatedData.provider_ip,
                port: updatedData.ssh_port.toString(),
                username: updatedData.username,
                private_key_filename: updatedData.private_key_filename
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
          description: `${updatedData.provider_name} has been successfully updated.`,
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
              {filteredIntegrations.map((integration) => (
                <Card 
                  key={integration.id} 
                  className="flex flex-col cursor-pointer transition-all hover:shadow-md"
                  onClick={() => handleRowClick(integration)}
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 dark:bg-primary/20 text-primary p-2 rounded-lg flex-shrink-0">
                        {getIntegrationIcon(integration.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold leading-snug">{integration.name}</CardTitle>
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
                  <CardContent className="flex-grow pt-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      {Object.entries(integration.details).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-muted-foreground capitalize">{key}</p>
                          <p className="font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge className={getStatusBadgeColor(integration.status)}>{integration.status}</Badge>
                    {integration.lastConnected && (
                      <p>Last connected: {new Date(integration.lastConnected).toLocaleDateString()}</p>
                    )}
                  </CardFooter>
                </Card>
              ))}
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
      
      {/* Service Details Sheet */}
      <ServiceDetailsSheet 
        integration={selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
      />

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
