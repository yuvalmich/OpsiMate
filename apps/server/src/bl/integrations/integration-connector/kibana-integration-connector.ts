import { Integration, IntegrationUrls, Logger } from "@service-peek/shared";
import { IntegrationConnector } from "./integration-connector";
import { KibanaClient } from "../../../dal/external-client/kibana-client";

interface KibanaDashboard {
    title: string;
    url: string;
}

export class KibanaIntegrationConnector implements IntegrationConnector {
    private logger = new Logger('bl/integrations/kibana-integration-connector');
    async getUrls(integration: Integration, tags: string[]): Promise<IntegrationUrls[]> {
        try {
            // Check if credentials exist and have the token field
            if (!integration.credentials || !integration.credentials["token"]) {
                this.logger.error('Missing Kibana API token in credentials');
                return [];
            }
            
            const kibanaClient = new KibanaClient(integration.externalUrl, integration.credentials["token"]);
            
            // Process all tags in parallel and collect dashboards
            const dashboardPromises = tags.map(async (tag: string) => {
                try {
                    const dashboards = await kibanaClient.searchDashboardsByTag(tag);
                    this.logger.info(`Found ${dashboards.length} dashboards with tag '${tag}'`);
                    
                    // Transform dashboards to KibanaDashboard format
                    return dashboards.map((dash: any) => ({
                        title: dash.title,
                        url: `${integration.externalUrl.replace(/\/$/, '')}${dash.url}`,
                    }));
                } catch (error: any) {
                    this.logger.error(`Error fetching Kibana dashboards for tag ${tag}:`, error);
                    return []; // Return empty array for failed tags
                }
            });
            
            // Wait for all dashboard requests to complete
            const dashboardResults = await Promise.all(dashboardPromises);
            
            // Flatten results and remove duplicates based on URL
            const allDashboards = dashboardResults.flat();
            const uniqueDashboards = Array.from(
                new Map(allDashboards.map((dash: KibanaDashboard) => [dash.url, dash])).values()
            );
            
            // Return dashboards as IntegrationUrls array
            return uniqueDashboards.map((dash: KibanaDashboard) => ({
                name: dash.title,
                url: dash.url,
            }));
        } catch (error: any) {
            this.logger.error('Error in KibanaIntegrationConnector.getUrls:', error);
            return [];
        }
    }
}
