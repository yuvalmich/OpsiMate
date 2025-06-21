import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Server, Cloud, Database, Globe, MoreVertical, Search, Plus, Trash, RefreshCw, Settings, ListPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { IntegrationType } from "./Integrations";
import { AddServiceDialog, ServiceConfig } from "@/components/AddServiceDialog";
import { ServicesList } from "@/components/ServicesList";

// Define the structure of an integration instance
interface IntegrationInstance {
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
const getIntegrationTypeName = (type: IntegrationType): string => {
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
const getStatusBadgeColor = (status: IntegrationInstance["status"]) => {
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
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationInstance | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedServerForService, setSelectedServerForService] = useState<IntegrationInstance | null>(null);
  
  // Load integrations from localStorage
  useEffect(() => {
    try {
      const savedIntegrationsJson = localStorage.getItem('integrations');
      if (savedIntegrationsJson) {
        const savedIntegrations = JSON.parse(savedIntegrationsJson);
        setIntegrationInstances(savedIntegrations);
      } else if (import.meta.env.DEV) {
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
    }
  }, [toast]);

  // Filter integrations based on search query and active tab
  const filteredIntegrations = integrationInstances.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      getIntegrationCategory(integration.type) === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleRefreshIntegration = (id: string) => {
    toast({
      title: "Refreshing integration",
      description: "Checking connection status..."
    });
    
    // Simulate a refresh with a status update
    setTimeout(() => {
      try {
        // Update state with new status
        const updatedIntegrations = integrationInstances.map(integration => 
          integration.id === id 
            ? { 
                ...integration, 
                lastConnected: new Date().toISOString(),
                status: Math.random() > 0.3 ? "online" as const : "warning" as const
              } 
            : integration
        );
        
        setIntegrationInstances(updatedIntegrations);
        
        // Update localStorage
        localStorage.setItem('integrations', JSON.stringify(updatedIntegrations));
        
        toast({
          title: "Integration refreshed",
          description: "Connection status updated"
        });
      } catch (error) {
        console.error("Error refreshing integration:", error);
        toast({
          title: "Error refreshing",
          description: "There was a problem updating the integration status",
          variant: "destructive"
        });
      }
    }, 1500);
  };

  const handleAddService = (integrationId: string, service: ServiceConfig) => {
    try {
      const updatedIntegrations = integrationInstances.map(integration => {
        if (integration.id === integrationId) {
          return {
            ...integration,
            services: [...(integration.services || []), service]
          };
        }
        return integration;
      });

      setIntegrationInstances(updatedIntegrations);
      localStorage.setItem('integrations', JSON.stringify(updatedIntegrations));
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error adding service",
        description: "There was a problem adding the service",
        variant: "destructive"
      });
    }
  };

  const handleServiceStatusChange = (integrationId: string, serviceId: string, newStatus: "running" | "stopped" | "error") => {
    try {
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
      localStorage.setItem('integrations', JSON.stringify(updatedIntegrations));
    } catch (error) {
      console.error("Error updating service status:", error);
      toast({
        title: "Error updating service",
        description: "There was a problem updating the service status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteIntegration = () => {
    if (!selectedIntegration) return;
    
    try {
      // Update state
      const updatedIntegrations = integrationInstances.filter(
        integration => integration.id !== selectedIntegration.id
      );
      
      setIntegrationInstances(updatedIntegrations);
      
      // Update localStorage
      localStorage.setItem('integrations', JSON.stringify(updatedIntegrations));
      
      toast({
        title: "Integration deleted",
        description: `${selectedIntegration.name} has been removed`
      });
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast({
        title: "Error deleting integration",
        description: "There was a problem removing the integration",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedIntegration(null);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Integrations</h1>
            <p className="text-muted-foreground">Manage your connected infrastructure</p>
          </div>
          <Button asChild>
            <Link to="/integrations">
              <Plus className="mr-2 h-4 w-4" /> Add Integration
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="server">Servers</TabsTrigger>
              <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
              <TabsTrigger value="cloud">Cloud</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search integrations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredIntegrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Database className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No integrations found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              {searchQuery 
                ? "Try adjusting your search or filter criteria" 
                : "Add your first integration to get started"}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link to="/integrations">
                  <Plus className="mr-2 h-4 w-4" /> Add Integration
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-1.5 rounded-md">
                        {getIntegrationIcon(integration.type)}
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription>{getIntegrationTypeName(integration.type)}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRefreshIntegration(integration.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                        </DropdownMenuItem>
                        {integration.type === "server" && (
                          <DropdownMenuItem onClick={() => {
                            setSelectedServerForService(integration);
                            setIsAddServiceDialogOpen(true);
                          }}>
                            <ListPlus className="mr-2 h-4 w-4" /> Add Service
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" /> Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600" 
                          onClick={() => {
                            setSelectedIntegration(integration);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {Object.entries(integration.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                  
                  {integration.type === "server" && (
                    <div className="mt-4">
                      <ServicesList 
                        services={integration.services || []} 
                        onServiceStatusChange={(serviceId, newStatus) => handleServiceStatusChange(integration.id, serviceId, newStatus)}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Badge className={getStatusBadgeColor(integration.status)}>
                    {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last connected: {integration.lastConnected 
                      ? new Date(integration.lastConnected).toLocaleString() 
                      : "Never"}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Integration</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedIntegration?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteIntegration}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </DashboardLayout>
  );
}

export default MyIntegrations;
