export class KibanaClient {
    constructor(private url: string, private apiKey: string) {}

    async searchDashboardsByTag(tagName: string) {
        try {
            console.log(`Searching Kibana dashboards with tag: ${tagName}`);
            
            // Validate inputs
            if (!this.url || !this.apiKey) {
                console.error('Missing Kibana URL or API key');
                return [];
            }
            
            // Normalize URL (remove trailing slash if present)
            const baseUrl = this.url.replace(/\/$/, '');
            
            // Step 1: Get Tag ID by Name
            console.log(`Fetching tags from ${baseUrl}/api/saved_objects/_find?type=tag`);
            const tagResponse = await fetch(`${baseUrl}/api/saved_objects/_find?type=tag&per_page=1000`, {
                headers: {
                    'kbn-xsrf': 'true',
                    'Authorization': `ApiKey ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!tagResponse.ok) {
                const errorText = await tagResponse.text();
                console.error(`Kibana API error (${tagResponse.status}): ${errorText}`);
                throw new Error(`Kibana API error: ${tagResponse.status} - ${errorText}`);
            }

            const tagData = await tagResponse.json();
            console.log(`Found ${tagData.saved_objects.length} tags`);
            
            const tagObject = tagData.saved_objects.find((tag: any) => tag.attributes.name === tagName);
            
            if (!tagObject) {
                console.log(`Tag '${tagName}' not found`);
                return []; // Tag not found
            }

            const tagId = tagObject.id;
            console.log(`Found tag '${tagName}' with ID: ${tagId}`);

            // Step 2: Fetch Dashboards with Tag ID
            const queryParam = encodeURIComponent(JSON.stringify({type: "tag", id: tagId}));
            const dashboardUrl = `${baseUrl}/api/saved_objects/_find?type=dashboard&has_reference=${queryParam}`;
            
            console.log(`Fetching dashboards with tag ID ${tagId}`);
            const dashboardResponse = await fetch(dashboardUrl, {
                headers: {
                    'kbn-xsrf': 'true',
                    'Authorization': `ApiKey ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!dashboardResponse.ok) {
                const errorText = await dashboardResponse.text();
                console.error(`Kibana API error (${dashboardResponse.status}): ${errorText}`);
                throw new Error(`Kibana API error: ${dashboardResponse.status} - ${errorText}`);
            }

            const dashboardData = await dashboardResponse.json();
            console.log(`Found ${dashboardData.saved_objects.length} dashboards with tag '${tagName}'`);
            
            // Format the dashboard data similar to Grafana's format
            return dashboardData.saved_objects.map((dashboard: any) => ({
                title: dashboard.attributes.title,
                url: `/app/dashboards#/view/${dashboard.id}`,
            }));
        } catch (error) {
            console.error('Error searching Kibana dashboards by tag:', error);
            return []; // Return empty array instead of throwing to prevent 500 errors
        }
    }
}
