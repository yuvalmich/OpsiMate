// In grafana-client.ts
export interface GrafanaDashboardSummary {
    title: string;
    url: string;
}

export class GrafanaClient {
    constructor(private url: string, private token: string) {}

    async searchByTags(tags: string[]): Promise<GrafanaDashboardSummary[]> {
        const query = new URLSearchParams();
        query.append('type', 'dash-db');
        tags.forEach(tag => query.append('tag', tag));

        const res = await fetch(`${this.url}/api/search?${query.toString()}`, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            throw new Error(`Grafana API error: ${res.status}`);
        }

        return await res.json() as GrafanaDashboardSummary[];
    }
}
