import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ServiceConfig } from "./AddServiceDialog";
import { ChevronDown, ChevronUp, Play, Square, RotateCcw, Terminal, Container, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ServicesListProps {
  services: ServiceConfig[];
  onServiceStatusChange: (serviceId: string, newStatus: "running" | "stopped" | "error") => void;
}

export function ServicesList({ services, onServiceStatusChange }: ServicesListProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);

  if (services.length === 0) {
    return null;
  }

  const handleStart = (serviceId: string) => {
    toast({
      title: "Starting service",
      description: "Service is starting..."
    });
    
    setTimeout(() => {
      onServiceStatusChange(serviceId, "running");
      toast({
        title: "Service started",
        description: "Service is now running"
      });
    }, 1000);
  };

  const handleStop = (serviceId: string) => {
    toast({
      title: "Stopping service",
      description: "Service is stopping..."
    });
    
    setTimeout(() => {
      onServiceStatusChange(serviceId, "stopped");
      toast({
        title: "Service stopped",
        description: "Service has been stopped"
      });
    }, 1000);
  };

  const handleRestart = (serviceId: string) => {
    toast({
      title: "Restarting service",
      description: "Service is restarting..."
    });
    
    setTimeout(() => {
      onServiceStatusChange(serviceId, "running");
      toast({
        title: "Service restarted",
        description: "Service has been restarted"
      });
    }, 1500);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex w-full justify-between p-0 h-8">
          <span className="font-medium">Services ({services.length})</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-2">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="flex items-center justify-between p-2 rounded-md bg-background border"
          >
            <div className="flex items-center gap-2">
              {service.type === "container" ? (
                <Container className="h-4 w-4 text-blue-500" />
              ) : (
                <Server className="h-4 w-4 text-purple-500" />
              )}
              <div>
                <div className="font-medium text-sm">{service.name}</div>
                <div className="text-xs text-muted-foreground">
                  {service.type === "container" 
                    ? `Container: ${service.containerDetails?.image}` 
                    : service.port 
                      ? `Port: ${service.port}` 
                      : "Manual service"
                  }
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Badge 
                className={cn(
                  "text-xs",
                  service.status === "running" && "bg-green-500/20 text-green-700 hover:bg-green-500/30",
                  service.status === "stopped" && "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30",
                  service.status === "error" && "bg-red-500/20 text-red-700 hover:bg-red-500/30"
                )}
              >
                {service.status}
              </Badge>
              <div className="flex gap-1">
                {service.status !== "running" && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleStart(service.id)}
                    title="Start"
                  >
                    <Play className="h-3 w-3" />
                  </Button>
                )}
                {service.status === "running" && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleStop(service.id)}
                    title="Stop"
                  >
                    <Square className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleRestart(service.id)}
                  title="Restart"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  title="SSH"
                >
                  <Terminal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
