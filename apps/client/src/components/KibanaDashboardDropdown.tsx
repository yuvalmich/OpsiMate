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
import { KibanaIcon } from './icons/KibanaIcon';
import { ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import { integrationApi } from '@/lib/api';
import { Tag } from '@service-peek/shared';
import { useToast } from '@/hooks/use-toast';
import { removeDuplicates } from '@/lib/utils';

interface KibanaDashboard {
  name: string;
  url: string;
}

interface KibanaDashboardDropdownProps {
  tags: Tag[];
  className?: string;
}

export function KibanaDashboardDropdown({ tags, className }: KibanaDashboardDropdownProps) {
  const [dashboards, setDashboards] = useState<KibanaDashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kibanaIntegrationId, setKibanaIntegrationId] = useState<number | null>(null);
  const [kibanaUrl, setKibanaUrl] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchKibanaIntegration();
  }, []);

  useEffect(() => {
    if (tags.length > 0 && kibanaIntegrationId) {
      fetchKibanaDashboards();
    }
  }, [tags, kibanaIntegrationId]);

  const fetchKibanaIntegration = async () => {
    try {
      const response = await integrationApi.getIntegrations();
      if (response.success && response.data) {
        // Find Kibana integration
        const kibanaIntegration = response.data.integrations.find(
          (integration: any) => integration.type === 'Kibana'
        );
        if (kibanaIntegration) {
          setKibanaIntegrationId(kibanaIntegration.id);
          // Store the Kibana URL for the "Open Kibana" link
          setKibanaUrl(kibanaIntegration.externalUrl || '');
        } else {
          setError('No Kibana integration found');
        }
      } else {
        setError('Failed to fetch integrations');
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
      setError('Failed to fetch integrations');
    }
  };

  const fetchKibanaDashboards = async () => {
    setLoading(true);
    setError(null);
    setDashboards([]);
    
    try {
      const tagNames = tags.map(tag => tag.name);
      let allDashboards: KibanaDashboard[] = [];
      let hasError = false;
      
      // Make separate API calls for each tag
      const dashboardPromises = tagNames.map(async (tagName) => {
        try {
          const response = await integrationApi.getIntegrationUrls(kibanaIntegrationId!, [tagName]);
          
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
      console.error('Error fetching Kibana dashboards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardClick = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    toast({
      title: 'Opening Dashboard',
      description: `Opening "${name}" in Kibana`,
    });
  };

  // Don't render anything if there are no tags or no Kibana integration
  if (tags.length === 0 || !kibanaIntegrationId) {
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
            <KibanaIcon className="h-3 w-3" />
            <span>Kibana Dashboards</span>
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
              onClick={() => window.open(kibanaUrl, '_blank')}
            >
              <KibanaIcon className="h-3 w-3 mr-2" />
              Open Kibana
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
