import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ServiceConfig } from "./AddServiceDialog";
import { ChevronDown, ChevronUp, Play, Square, RotateCcw, Terminal, Container, Server, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface ServicesListProps {
  services: ServiceConfig[];
  onStatusChange: (serviceId: string, newStatus: "running" | "stopped" | "error") => void;
  onServiceClick: (service: ServiceConfig) => void;
}

export function ServicesList({ services, onStatusChange, onServiceClick }: ServicesListProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(true);
  const [activeService, setActiveService] = useState<string | null>(null);

  if (services.length === 0) {
    return null;
  }

  const handleAction = (serviceId: string, status: "running" | "stopped" | "error", action: string) => {
    toast({
      title: `${action} service`,
      description: `Service is ${action.toLowerCase()}...`
    });
    
    setTimeout(() => {
      onStatusChange(serviceId, status);
      toast({
        title: `Service ${action}`,
        description: `Service has been ${action.toLowerCase()}`
      });
    }, 1000);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex w-full justify-between p-0 h-8">
          <span className="font-medium">Services ({services.length})</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-1">
        {services.map((service) => (
          <DropdownMenu key={service.id} open={activeService === service.id} onOpenChange={(isOpen) => !isOpen && setActiveService(null)}>
            <DropdownMenuTrigger asChild>
              <div 
                className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => setActiveService(service.id)}
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
                      service.status === "running" && "bg-green-500/20 text-green-700",
                      service.status === "stopped" && "bg-gray-500/20 text-gray-700",
                      service.status === "error" && "bg-red-500/20 text-red-700"
                    )}
                  >
                    {service.status}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onServiceClick(service)}>
                <Terminal className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {service.status !== 'running' && (
                <DropdownMenuItem onClick={() => handleAction(service.id, 'running', 'Starting')}>
                  <Play className="mr-2 h-4 w-4" /> Start
                </DropdownMenuItem>
              )}
              {service.status === 'running' && (
                <DropdownMenuItem onClick={() => handleAction(service.id, 'stopped', 'Stopping')}>
                  <Square className="mr-2 h-4 w-4" /> Stop
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleAction(service.id, 'running', 'Restarting')}>
                <RotateCcw className="mr-2 h-4 w-4" /> Restart
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
