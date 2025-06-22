import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { integrationApi } from "../lib/api";

// Define service types
export interface ServiceConfig {
  id: string;
  name: string;
  type: "manual" | "container";
  status: "running" | "stopped" | "error" | "unknown";
  port?: number | string;
  containerDetails?: {
    id: string;
    image: string;
    created: string;
  };
}

// Container interface
interface Container {
  service_name: string;
  service_status: string;
  service_ip: string;
  image: string;
}

interface AddServiceDialogProps {
  serverId: string;
  serverName: string;
  open: boolean;
  onClose: () => void;
  onServiceAdded: (service: ServiceConfig) => void;
}

export function AddServiceDialog({ serverId, serverName, open, onClose, onServiceAdded }: AddServiceDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"manual" | "container">("manual");
  const [serviceName, setServiceName] = useState("");
  const [servicePort, setServicePort] = useState("");
  const [loading, setLoading] = useState(false);
  const [containers, setContainers] = useState<Array<Container & { id: string; selected: boolean; name: string; created: string }>>([]);
  const [loadingContainers, setLoadingContainers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load containers from the server using API
  useEffect(() => {
    if (open && activeTab === "container") {
      setLoadingContainers(true);
      setError(null);
      
      // Fetch containers from API
      const fetchContainers = async () => {
        try {
          const response = await integrationApi.getProviderInstances(parseInt(serverId));
          
          if (response.success && response.data && response.data.containers) {
            // Transform API container data to match our UI format
            const containerData = response.data.containers.map((container, index) => ({
              ...container,
              id: `container-${index}`,
              name: container.service_name,
              selected: false,
              created: new Date().toISOString() // API doesn't provide creation date, so we use current time
            }));
            
            setContainers(containerData);
          } else {
            setError('Failed to load containers');
            // Fall back to empty array
            setContainers([]);
          }
        } catch (err) {
          console.error('Error fetching containers:', err);
          setError('Error loading containers. Please try again.');
          setContainers([]);
        } finally {
          setLoadingContainers(false);
        }
      };
      
      fetchContainers();
    }
  }, [open, activeTab, serverId]);

  const handleAddManualService = () => {
    if (!serviceName) {
      toast({
        title: "Service name required",
        description: "Please enter a name for the service",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Create new service
    const newService: ServiceConfig = {
      id: `service-${Date.now()}`,
      name: serviceName,
      type: "manual",
      status: "running",
      port: servicePort ? parseInt(servicePort, 10) : undefined
    };

    // Simulate API call
    setTimeout(() => {
      onServiceAdded(newService);
      setLoading(false);
      setServiceName("");
      setServicePort("");
      onClose();
      
      toast({
        title: "Service added",
        description: `${serviceName} has been added to ${serverName}`
      });
    }, 800);
  };

  const handleAddContainers = async () => {
    const selectedContainers = containers.filter(container => container.selected);
    
    if (selectedContainers.length === 0) {
      toast({
        title: "No containers selected",
        description: "Please select at least one container",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Extract service names for API call
      const serviceNames = selectedContainers.map(container => container.service_name);
      
      // Call the API to add services in bulk
      const response = await integrationApi.addServicesBulk(parseInt(serverId), serviceNames);
      
      if (response.success) {
        // Create new services from selected containers for UI
        const newServices = selectedContainers.map(container => ({
          id: `container-${container.id}-${Date.now()}`,
          name: container.name,
          type: "container" as const,
          status: container.service_status === "running" ? "running" : "stopped" as const,
          containerDetails: {
            id: container.id,
            image: container.image,
            created: container.created
          }
        }));

        // Add services to UI
        newServices.forEach(service => onServiceAdded(service));
        
        toast({
          title: `${newServices.length} container${newServices.length > 1 ? 's' : ''} added`,
          description: `Added to ${serverName}`
        });
        
        // Reset and close
        setContainers(containers.map(container => ({ ...container, selected: false })));
        onClose();
      } else {
        toast({
          title: "Failed to add containers",
          description: response.error || "An error occurred while adding containers",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error adding containers:", err);
      toast({
        title: "Error adding containers",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleContainerSelection = (containerId: string) => {
    setContainers(containers.map(container => 
      container.id === containerId 
        ? { ...container, selected: !container.selected } 
        : container
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Service to {serverName}</DialogTitle>
          <DialogDescription>
            Add a service to monitor on this server
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "manual" | "container")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Service</TabsTrigger>
            <TabsTrigger value="container">Containers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input 
                  id="service-name" 
                  placeholder="e.g., nginx, postgres, redis" 
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>
              <div className="col-span-1 space-y-2">
                <Label htmlFor="service-port">Port (optional)</Label>
                <Input 
                  id="service-port" 
                  placeholder="e.g., 80" 
                  value={servicePort}
                  onChange={(e) => setServicePort(e.target.value.replace(/[^0-9]/g, ''))}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="container" className="py-4">
            {/* Container list */}
            {loadingContainers ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setActiveTab("container");
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : containers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No containers found on this server.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {containers.map(container => (
                  <div
                    key={container.id}
                    className="flex items-center space-x-3 border rounded-md p-3 hover:bg-accent cursor-pointer"
                    onClick={() => toggleContainerSelection(container.id)}
                  >
                    <Checkbox
                      id={`container-${container.id}`}
                      checked={container.selected}
                      onCheckedChange={() => toggleContainerSelection(container.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{container.name}</div>
                      <div className="text-sm text-muted-foreground">{container.image}</div>
                      <div className="text-xs mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full ${container.service_status === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {container.service_status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {activeTab === "manual" ? (
            <Button onClick={handleAddManualService} disabled={loading || !serviceName}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Service
            </Button>
          ) : (
            <Button onClick={handleAddContainers} disabled={loading || loadingContainers || containers.filter(c => c.selected).length === 0}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Selected
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
