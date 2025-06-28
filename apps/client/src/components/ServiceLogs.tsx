import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RefreshCw } from "lucide-react";
import { providerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ServiceLogsProps {
  serviceId: string;
  serviceName: string;
}

export function ServiceLogs({ serviceId, serviceName }: ServiceLogsProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await providerApi.getServiceLogs(parseInt(serviceId));
      
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

  useEffect(() => {
    if (serviceId) {
      fetchLogs();
    }
  }, [serviceId]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Service Logs: {serviceName}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchLogs} 
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-pulse text-muted-foreground">Loading logs...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 py-2">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground py-2">No logs available</div>
        ) : (
          <div className="bg-muted rounded-md p-2 overflow-auto max-h-[400px]">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
