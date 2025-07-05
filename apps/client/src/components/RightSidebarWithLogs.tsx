import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, FileText, RefreshCw, Plus } from "lucide-react";
import { Service } from "./ServiceTable";
import { cn } from "@/lib/utils";
import { providerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TagBadge } from "./ui/tag-badge";
import { TagSelector } from "./TagSelector";
import { Tag } from "@service-peek/shared";
import { GrafanaDashboardDropdown } from "./GrafanaDashboardDropdown";

interface RightSidebarProps {
  service: Service | null;
  onClose: () => void;
  collapsed: boolean;
  onServiceUpdate?: (updatedService: Service) => void;
}

export function RightSidebarWithLogs({ service, onClose, collapsed, onServiceUpdate }: RightSidebarProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTags, setServiceTags] = useState<Tag[]>(service?.tags || []);

  const fetchLogs = async () => {
    if (!service) return;

    setLoading(true);
    setError(null);
    try {
      const response = await providerApi.getServiceLogs(parseInt(service.id));

      if (response.success && response.data) {
        setLogs(response.data);
      } else {
        setError(response.error || "Failed to fetch logs");
        toast({
          title: "Error fetching logs",
          description: response.error || "Failed to fetch logs",
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error fetching logs",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    if (!service) return;
    try {
      const response = await providerApi.getServiceTags(parseInt(service.id));
      if (response.success && response.data) {
        setServiceTags(response.data);
      } else {
        setServiceTags([]);
      }
    } catch (err) {
      setServiceTags([]);
    }
  };

  useEffect(() => {
    if (service) {
      fetchLogs();
      fetchTags();
    }
  }, [service?.id]);

  const handleTagsChange = (newTags: Tag[]) => {
    setServiceTags(newTags);
    if (service && onServiceUpdate) {
      onServiceUpdate({
        ...service,
        tags: newTags
      });
    }
  };

  const handleRemoveTag = async (tagToRemove: Tag) => {
    if (!service) return;
    
    try {
      const response = await providerApi.removeTagFromService(parseInt(service.id), tagToRemove.id);
      if (response.success) {
        const updatedTags = serviceTags.filter(tag => tag.id !== tagToRemove.id);
        setServiceTags(updatedTags);
        if (onServiceUpdate) {
          onServiceUpdate({
            ...service,
            tags: updatedTags
          });
        }
        toast({
          title: "Success",
          description: "Tag removed from service"
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to remove tag",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive"
      });
    }
  };

  if (!service) return null;

  const getStatusColor = (status: Service['serviceStatus']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200';
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (collapsed) {
    return (
      <div className="w-full bg-card border-l border-border p-4 flex flex-col items-center gap-4 overflow-hidden h-full">
        <FileText className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="w-full bg-card border-l border-border p-4 h-full text-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Service Details</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-grow overflow-auto pr-2 -mr-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs">Name</div>
            <h4 className="font-medium text-foreground text-base">{service.name}</h4>
          </div>
          <Badge className={cn(getStatusColor(service.serviceStatus), "text-xs py-0.5 px-2 flex-shrink-0")}>
            {service.serviceStatus}
          </Badge>
        </div>

        <Separator />

        {/* External Links Section */}
        <div>
          <h4 className="font-medium text-foreground text-xs mb-2">External Links</h4>
          <div className="flex flex-col gap-2">
            <GrafanaDashboardDropdown 
              tags={serviceTags} 
              className="w-full"
            />
          </div>
        </div>

        <Separator />

        <div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <div className="text-muted-foreground">Service ID</div>
              <div className="font-medium text-foreground text-sm">{service.id}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Type</div>
              <div className="font-medium text-foreground text-sm">{service.serviceType}</div>
            </div>
            <div>
              <div className="text-muted-foreground">IP Address</div>
              <div className="font-medium text-foreground font-mono text-sm">{service.serviceIP || '-'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Provider</div>
              <div className="font-medium text-foreground text-sm">{service.provider.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Provider IP</div>
              <div className="font-medium text-foreground text-sm">{service.provider.providerIP}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created</div>
              <div className="font-medium text-foreground text-sm">{new Date(service.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Container ID</div>
              <div className="font-medium text-foreground text-sm">{service.containerDetails?.id || '-'}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Service Logs Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-foreground text-xs">Service Logs</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-pulse text-muted-foreground text-xs">Loading logs...</div>
            </div>
          ) : error ? (
            <div className="text-red-500 py-2 text-xs">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground py-2 text-xs">No logs available</div>
          ) : (
            <div className="bg-muted rounded-md p-2 overflow-auto max-h-[200px]">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex-shrink-0">
        <Separator />
        <div className="space-y-2 pt-4">
          <h4 className="font-medium text-foreground text-xs">Tags</h4>
          <TagSelector
            selectedTags={serviceTags}
            onTagsChange={handleTagsChange}
            serviceId={parseInt(service.id)}
            className=""
          />
        </div>
      </div>
    </div>
  );
}
