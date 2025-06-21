import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Define service types
export interface ServiceConfig {
  id: string;
  name: string;
  type: "manual" | "container";
  status: "running" | "stopped" | "error";
  port?: number;
  containerDetails?: {
    id: string;
    image: string;
    created: string;
  };
}

// Mock container data
const mockContainers = [
  { id: "c1", name: "nginx", image: "nginx:latest", created: "2025-06-20T10:30:00Z" },
  { id: "c2", name: "postgres", image: "postgres:14", created: "2025-06-20T10:35:00Z" },
  { id: "c3", name: "redis", image: "redis:alpine", created: "2025-06-20T10:40:00Z" },
  { id: "c4", name: "node-app", image: "node:16", created: "2025-06-20T11:00:00Z" }
];

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
  const [containers, setContainers] = useState<Array<typeof mockContainers[0] & { selected: boolean }>>(
    mockContainers.map(container => ({ ...container, selected: false }))
  );
  const [loadingContainers, setLoadingContainers] = useState(false);

  // Simulate loading containers from the server
  useEffect(() => {
    if (open && activeTab === "container") {
      setLoadingContainers(true);
      // Simulate API call
      setTimeout(() => {
        setContainers(mockContainers.map(container => ({ ...container, selected: false })));
        setLoadingContainers(false);
      }, 1000);
    }
  }, [open, activeTab]);

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

  const handleAddContainers = () => {
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

    // Create new services from selected containers
    const newServices = selectedContainers.map(container => ({
      id: `container-${container.id}-${Date.now()}`,
      name: container.name,
      type: "container" as const,
      status: "running" as const,
      containerDetails: {
        id: container.id,
        image: container.image,
        created: container.created
      }
    }));

    // Simulate API call
    setTimeout(() => {
      newServices.forEach(service => onServiceAdded(service));
      setLoading(false);
      setContainers(containers.map(container => ({ ...container, selected: false })));
      onClose();
      
      toast({
        title: `${newServices.length} container${newServices.length > 1 ? 's' : ''} added`,
        description: `Added to ${serverName}`
      });
    }, 800);
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
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name</Label>
              <Input 
                id="service-name" 
                placeholder="e.g., nginx, postgres, redis" 
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-port">Port (optional)</Label>
              <Input 
                id="service-port" 
                placeholder="e.g., 80, 5432, 6379" 
                value={servicePort}
                onChange={(e) => setServicePort(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="container" className="py-4">
            {loadingContainers ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading containers...</span>
              </div>
            ) : containers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No containers found on this server</p>
              </div>
            ) : (
              <div className="space-y-2">
                {containers.map((container) => (
                  <div key={container.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                    <Checkbox 
                      id={`container-${container.id}`}
                      checked={container.selected}
                      onCheckedChange={() => toggleContainerSelection(container.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label 
                        htmlFor={`container-${container.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {container.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {container.image}
                      </p>
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
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Service
            </Button>
          ) : (
            <Button 
              onClick={handleAddContainers} 
              disabled={loading || loadingContainers || !containers.some(c => c.selected)}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Selected
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
