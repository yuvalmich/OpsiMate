import { Integration, IntegrationUrls } from "@service-peek/shared";
import { IntegrationConnector } from "./integration-connector";
import { KibanaClient } from "../../../dal/external-client/kibana-client";

interface KibanaDashboard {
    title: string;
    url: string;
}

export class KibanaIntegrationConnector implements IntegrationConnector {
    async getUrls(integration: Integration, tags: string[]): Promise<IntegrationUrls> {
        try {
            // Check if credentials exist and have the token field
            if (!integration.credentials || !integration.credentials["token"]) {
                console.error('Missing Kibana API token in credentials');
                return [] as unknown as IntegrationUrls;
            }
            
            const kibanaClient = new KibanaClient(integration.externalUrl, integration.credentials["token"]);
            
            // Process each tag and collect all dashboards
            const allDashboards: KibanaDashboard[] = [];
            
            for (const tag of tags) {
                try {
                    const dashboards = await kibanaClient.searchDashboardsByTag(tag);
                    
                    // Add dashboards to the collection
                    dashboards.forEach((dash: any) => {
                        allDashboards.push({
                            title: dash.title,
                            url: `${integration.externalUrl.replace(/\/$/, '')}${dash.url}`,
                        });
                    });
                } catch (error) {
                    console.error(`Error fetching Kibana dashboards for tag ${tag}:`, error);
                    // Continue with other tags even if one fails
                }
            }
            
            // Return dashboards as IntegrationUrls array
            return allDashboards.map((dash) => ({
                name: dash.title,
                url: dash.url,
            })) as unknown as IntegrationUrls;
        } catch (error) {
            console.error('Error in KibanaIntegrationConnector.getUrls:', error);
            return [] as unknown as IntegrationUrls;
        }
    }
}
