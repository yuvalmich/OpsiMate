import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ExternalLink, X, Eye, EyeOff, ChevronDown, ChevronRight } from "lucide-react";
import { Alert } from "@service-peek/shared";
import { cn } from "@/lib/utils";
import { alertsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AlertsSectionProps {
  alerts: Alert[];
  onAlertDismiss?: (alertId: string) => void;
  className?: string;
}

export function AlertsSection({ alerts, onAlertDismiss, className }: AlertsSectionProps) {
  const { toast } = useToast();
  const [dismissingAlerts, setDismissingAlerts] = useState<Set<string>>(new Set());
  const [showDismissed, setShowDismissed] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const activeAlerts = alerts.filter(alert => !alert.isDismissed);
  const dismissedAlerts = alerts.filter(alert => alert.isDismissed);
  const displayAlerts = showDismissed ? alerts : activeAlerts;

  const handleDismissAlert = async (alertId: string) => {
    try {
      setDismissingAlerts(prev => new Set(prev).add(alertId));
      
      const response = await alertsApi.dismissAlert(alertId);
      
      if (response.success) {
        toast({
          title: "Alert dismissed",
          description: "The alert has been marked as dismissed.",
        });
        
        if (onAlertDismiss) {
          onAlertDismiss(alertId);
        }
      } else {
        toast({
          title: "Error dismissing alert",
          description: response.error || "Failed to dismiss alert",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast({
        title: "Error dismissing alert",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setDismissingAlerts(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
    }
  };

  const toggleAlertExpansion = (alertId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  const handleAlertClick = (alertUrl: string) => {
    if (alertUrl) {
      window.open(alertUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'firing':
        return 'bg-red-500 hover:bg-red-600';
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'resolved':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Extract a meaningful name from the alert URL or tag
  const getAlertName = (alert: Alert) => {
    // Try to extract name from URL path
    if (alert.alertUrl) {
      try {
        // Extract the last part of the URL path which often contains a name or ID
        const urlParts = new URL(alert.alertUrl).pathname.split('/');
        const lastPart = urlParts[urlParts.length - 2]; // Get the second-to-last part which is often the alert name
        
        if (lastPart && lastPart !== 'view') {
          // Convert kebab-case or snake_case to Title Case
          return lastPart
            .replace(/-|_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        }
      } catch (e) {
        // URL parsing failed, fall back to default
      }
    }
    
    // If URL parsing fails or no meaningful name found, use tag with ID
    return `${alert.tag.charAt(0).toUpperCase() + alert.tag.slice(1)} Alert`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-foreground">Alerts</h3>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {activeAlerts.length}
            </Badge>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDismissed(!showDismissed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showDismissed ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              Hide Dismissed
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              Show Dismissed ({dismissedAlerts.length})
            </>
          )}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {showDismissed ? "No alerts found" : "No active alerts"}
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <Collapsible 
              key={alert.id} 
              open={expandedAlerts.has(alert.id)}
              className={cn(
                "rounded-lg border transition-colors",
                alert.isDismissed 
                  ? "bg-muted/50 border-muted" 
                  : "bg-card border-border hover:bg-muted/50"
              )}
            >
              <CollapsibleTrigger asChild>
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={(e) => toggleAlertExpansion(alert.id, e)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge 
                      className={cn(
                        "text-white text-xs h-5 min-w-5 flex items-center justify-center",
                        getAlertStatusColor(alert.status)
                      )}
                    >
                      {alert.status.charAt(0).toUpperCase()}
                    </Badge>
                    
                    <h4 className="font-medium text-sm truncate">
                      {getAlertName(alert)}
                    </h4>
                    
                    {alert.isDismissed && (
                      <Badge variant="secondary" className="text-xs">
                        Dismissed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!alert.isDismissed && onAlertDismiss && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismissAlert(alert.id);
                        }}
                        disabled={dismissingAlerts.has(alert.id)}
                      >
                        {dismissingAlerts.has(alert.id) ? (
                          <div className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    
                    {expandedAlerts.has(alert.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-3 pb-3 pt-1 border-t border-border/50">
                  <div className="flex items-center flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {alert.tag}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Started:</span> {new Date(alert.startsAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Updated:</span> {new Date(alert.updatedAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">ID:</span> {alert.id}
                    </div>
                  </div>
                  
                  {alert.alertUrl && !alert.isDismissed && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2 text-xs flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAlertClick(alert.alertUrl);
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>View details in Grafana</span>
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
    </div>
  );
}
