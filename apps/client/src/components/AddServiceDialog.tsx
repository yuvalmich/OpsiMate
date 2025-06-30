import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { providerApi } from "@/lib/api";
import { DiscoveredService, ServiceWithProvider } from "@service-peek/shared";

// Define service types
export interface ServiceConfig {
  id: string;
  name: string;
  type: string; // Updated to accept any string type from API ("MANUAL", "DOCKER", etc.)
  status: "running" | "stopped" | "error" | "unknown";
  serviceIP?: string;
  containerDetails?: {
    id?: string;
    image?: string;
    created?: string;
  };
}

// Container interface
interface Container {
  name: string;
  serviceStatus: string;
  serviceIP: string;
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
  const [containers, setContainers] = useState<Array<Container & { 
    id: string; 
    selected: boolean; 
    name: string; 
    created: string;
    alreadyAdded?: boolean; // Flag to mark containers that are already added as services
  }>>([]);
  const [loadingContainers, setLoadingContainers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<(Container & { id: string; selected: boolean; name: string; created: string }) | null>(null);
  const [existingServices, setExistingServices] = useState<ServiceWithProvider[]>([]);

  // Function to fetch existing services for this provider
  const fetchExistingServices = async () => {
    try {
      // Use getAllServices instead and filter by providerId
      const response = await providerApi.getAllServices();
      
      if (response.success && response.data) {
        // Filter services to only include those from this provider
        const providerServices = response.data.filter(service => 
          service.providerId === parseInt(serverId)
        );
        
        setExistingServices(providerServices);
        return providerServices;
      } else {
        console.error('Failed to fetch existing services');
        return [];
      }
    } catch (err) {
      console.error('Error fetching existing services:', err);
      return [];
    }
  };

  // Function to fetch containers from the API
  const fetchContainers = async () => {
    setLoadingContainers(true);
    setError(null);
    setSelectedContainer(null); // Reset selected container when fetching new ones

    try {
      // First, fetch existing services to check for duplicates
      const existingServices = await fetchExistingServices();
      
      const response = await providerApi.getProviderInstances(parseInt(serverId));

      if (response.success && response.data) {
        // Transform API discovered service data to match our UI format
        const containerData = response.data.map((service: DiscoveredService, index) => {
          // Check if this container is already added as a service by matching name
          // We need to compare the container name with existing service names
          const isAlreadyAdded = existingServices.some(existingService => 
            existingService.serviceType === 'DOCKER' && 
            existingService.name === service.name
          );
          
          return {
            serviceStatus: service.serviceStatus,
            serviceIP: service.serviceIP,
            image: 'N/A', // DiscoveredService doesn't have image info
            id: `container-${index}`, // Generate ID since DiscoveredService doesn't have id
            name: service.name,
            selected: false,
            created: new Date().toISOString(),
            alreadyAdded: isAlreadyAdded // Mark if already added
          };
        });

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

  // Load containers from the server using API when the dialog opens or tab changes
  useEffect(() => {
    if (open && activeTab === "container") {
      fetchContainers();
    }
  }, [open, activeTab, serverId]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setServiceName("");
      setServicePort("");
      setSelectedContainer(null);
      setContainers(containers.map(container => ({ ...container, selected: false })));
    }
  }, [open]);

  const handleAddManualService = async () => {
    if (!serviceName) {
      toast({
        title: "Service name required",
        description: "Please enter a name for the service",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const serviceData = {
      providerId: parseInt(serverId),
      name: serviceName,
      serviceType: "MANUAL" as const,
      serviceIP: servicePort ? `localhost:${servicePort}` : undefined,
      serviceStatus: "running" as const
    };

    console.log('Creating service with data:', serviceData);

    try {
      // Create service using the new API
      const response = await providerApi.createService(serviceData);

      console.log('Create service response:', response);

      if (response.success && response.data) {
        // Create UI service object from API response
        const newService: ServiceConfig = {
          id: response.data.id.toString(),
          name: response.data.name,
          type: "MANUAL", // Match the API service_type
          status: response.data.serviceStatus as "running" | "stopped" | "error" | "unknown",
          serviceIP: response.data.serviceIP,
          containerDetails: response.data.containerDetails
        };

        onServiceAdded(newService);
        setServiceName("");
        setServicePort("");
        onClose();

        toast({
          title: "Service added",
          description: `${serviceName} has been added to ${serverName}`
        });
      } else {
        toast({
          title: "Failed to add service",
          description: response.error || "An error occurred while adding the service",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error adding service:", err);
      toast({
        title: "Error adding service",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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
      // Create an array to store successful service creations
      const createdServices: ServiceConfig[] = [];
      const failedContainers: string[] = [];

      // Create each service individually using the new API
      for (const container of selectedContainers) {
        // Ensure status is one of the allowed values
        const status = container.serviceStatus === "running" ? "running" as const :
                      container.serviceStatus === "stopped" ? "stopped" as const :
                      container.serviceStatus === "error" ? "error" as const : "unknown" as const;

        try {
          // Create service using the new API
          const response = await providerApi.createService({
            providerId: parseInt(serverId),
            name: container.name,
            serviceType: "DOCKER",
            serviceStatus: status,
            serviceIP: container.serviceIP,
            containerDetails: {
              id: container.id,
              image: container.image,
              created: container.created
            }
          });

          if (response.success && response.data) {
            // Create UI service object from API response
            const newService: ServiceConfig = {
              id: response.data.id.toString(),
              name: response.data.name,
              type: "DOCKER", // Match the API service_type
              status: response.data.serviceStatus as "running" | "stopped" | "error" | "unknown",
              serviceIP: response.data.serviceIP,
              containerDetails: response.data.containerDetails
            };

            createdServices.push(newService);
          } else {
            failedContainers.push(container.name);
          }
        } catch (error) {
          console.error(`Error creating service for container ${container.name}:`, error);
          failedContainers.push(container.name);
        }
      }

      // Add successful services to UI
      createdServices.forEach(service => onServiceAdded(service));

      // Show appropriate toast message
      if (createdServices.length > 0) {
        toast({
          title: `${createdServices.length} container${createdServices.length > 1 ? 's' : ''} added`,
          description: `Added to ${serverName}${failedContainers.length > 0 ? '. Some containers failed.' : ''}`
        });

        // Reset and close if at least one service was created
        setContainers(containers.map(container => ({ ...container, selected: false })));
        setSelectedContainer(null);
        onClose();
      } else {
        toast({
          title: "Failed to add containers",
          description: "None of the selected containers could be added",
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
    // Find the container being toggled
    const containerToToggle = containers.find(c => c.id === containerId);
    
    // If container is already added as a service, don't allow selection
    if (containerToToggle?.alreadyAdded) {
      toast({
        title: "Container already monitored",
        description: "This container is already being monitored as a service",
        variant: "default"
      });
      return;
    }
    
    const updatedContainers = containers.map(container => {
      if (container.id === containerId) {
        // Toggle selection state for the clicked container
        const newSelected = !container.selected;
        return { ...container, selected: newSelected };
      }
      // Leave other containers unchanged to allow multi-select
      return container;
    });
    
    // Update containers state
    setContainers(updatedContainers);
    
    // Update selectedContainer state based on any selected container
    const anySelected = updatedContainers.some(c => c.selected);
    if (anySelected) {
      // Just set selectedContainer to a non-null value to enable the Add button
      // We don't need specific container details since we're using multi-select
      setSelectedContainer({ id: 'multi-select' } as any);
    } else {
      setSelectedContainer(null);
    }
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
                    fetchContainers();
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : containers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No containers found on this server.</p>
              </div>
            ) :
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {containers.map(container => (
                    <div
                      key={container.id}
                      className={cn(
                        "flex items-center space-x-3 border rounded-md p-3",
                        container.selected && "border-primary bg-primary/5",
                        container.alreadyAdded ? "opacity-60 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
                      )}
                      onClick={() => toggleContainerSelection(container.id)}
                    >
                      <Checkbox
                        id={`container-${container.id}`}
                        checked={container.alreadyAdded || container.selected}
                        disabled={container.alreadyAdded}
                        onCheckedChange={() => toggleContainerSelection(container.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{container.name}</div>
                          {container.alreadyAdded && (
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Already exists
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{container.image}</div>
                        <div className="text-xs mt-1">
                          <span className={`inline-block px-2 py-1 rounded-full ${container.serviceStatus === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {container.serviceStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* No additional fields needed for container selection - we'll use the container's original properties */}
              </div>
            }
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
            <Button onClick={handleAddContainers} disabled={loading || loadingContainers || !selectedContainer}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Add Selected
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
