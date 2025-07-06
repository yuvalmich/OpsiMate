import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { GrafanaIcon } from './icons/GrafanaIcon';
import { ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import { integrationApi } from '@/lib/api';
import { Tag } from '@service-peek/shared';
import { useToast } from '@/hooks/use-toast';
import { removeDuplicates } from '@/lib/utils';

interface GrafanaDashboard {
  name: string;
  url: string;
}

interface GrafanaDashboardDropdownProps {
  tags: Tag[];
  className?: string;
}

export function GrafanaDashboardDropdown({ tags, className }: GrafanaDashboardDropdownProps) {
  const [dashboards, setDashboards] = useState<GrafanaDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grafanaIntegrationId, setGrafanaIntegrationId] = useState<number | null>(null);
  const [grafanaUrl, setGrafanaUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGrafanaIntegration();
  }, []);

  useEffect(() => {
    if (tags.length > 0 && grafanaIntegrationId) {
      fetchGrafanaDashboards();
    }
  }, [tags, grafanaIntegrationId]);

  const fetchGrafanaIntegration = async () => {
    try {
      const response = await integrationApi.getIntegrations();
      if (response.success && response.data) {
        // Find Grafana integration
        const grafanaIntegration = response.data.integrations.find(
          (integration: any) => integration.type === 'Grafana'
        );
        if (grafanaIntegration) {
          setGrafanaIntegrationId(grafanaIntegration.id);
          // Store the Grafana URL for the "Open Grafana" link
          setGrafanaUrl(grafanaIntegration.externalUrl || 'https://grafana.com');
        } else {
          setError('No Grafana integration found');
        }
      } else {
        setError('Failed to fetch integrations');
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('Failed to fetch integrations');
    }
  };



  const fetchGrafanaDashboards = async () => {
    setLoading(true);
    setError(null);
    setDashboards([]);
    
    try {
      const tagNames = tags.map(tag => tag.name);
      let allDashboards: GrafanaDashboard[] = [];
      let hasError = false;
      
      // Make separate API calls for each tag
      const dashboardPromises = tagNames.map(async (tagName) => {
        try {
          const response = await integrationApi.getIntegrationUrls(grafanaIntegrationId!, [tagName]);
          
          if (response.success && response.data) {
            return response.data;
          } else {
            console.warn(`Failed to fetch dashboards for tag ${tagName}:`, response.error);
            return [];
          }
        } catch (error) {
          console.error(`Error fetching dashboards for tag ${tagName}:`, error);
          return [];
        }
      });
      
      // Wait for all API calls to complete
      const dashboardResults = await Promise.all(dashboardPromises);
      
      // Combine all results into a single array
      dashboardResults.forEach(dashboards => {
        allDashboards = [...allDashboards, ...dashboards];
      });
      
      // Remove duplicates based on URL
      const uniqueDashboards = removeDuplicates(allDashboards, 'url');
      
      // Sort dashboards alphabetically by name
      uniqueDashboards.sort((a, b) => a.name.localeCompare(b.name));
      
      setDashboards(uniqueDashboards);
      
      if (uniqueDashboards.length === 0 && !hasError) {
        setError('No dashboards found for the selected tags');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching Grafana dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardClick = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: 'Opening Dashboard',
      description: `Opening "${name}" in Grafana`,
    });
  };

  // Don't render anything if there are no tags or no Grafana integration
  if (tags.length === 0 || !grafanaIntegrationId) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`justify-between gap-2 h-7 text-xs px-2 ${className}`}
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            <GrafanaIcon className="h-3 w-3" />
            <span>Grafana Dashboards</span>
          </div>
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs">
          Dashboards for tags: {tags.map(tag => tag.name).join(', ')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {loading && (
          <DropdownMenuItem disabled className="text-xs">
            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
            Loading dashboards...
          </DropdownMenuItem>
        )}
        
        {error && (
          <DropdownMenuItem disabled className="text-xs text-red-500">
            <span>Error: {error}</span>
          </DropdownMenuItem>
        )}
        
        {!loading && !error && dashboards.length === 0 && (
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            No dashboards found for these tags
          </DropdownMenuItem>
        )}
        
        {!loading && !error && dashboards.length > 0 && (
          <>
            {dashboards.map((dashboard, index) => (
              <DropdownMenuItem
                key={index}
                className="text-xs cursor-pointer"
                onClick={() => handleDashboardClick(dashboard.url, dashboard.name)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{dashboard.name}</span>
                  <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-xs text-muted-foreground"
              onClick={() => window.open(grafanaUrl, '_blank')}
            >
              <GrafanaIcon className="h-3 w-3 mr-2" />
              Open Grafana
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
