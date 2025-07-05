type IntegrationRow = {
    id: number;
    name: string;
    type: 'Grafana' | 'Prometheus' | 'Coralogix';
    external_url: string;
    credentials: string; // stored as JSON string in DB
    created_at: string; // SQLite returns DATETIME as string
};
