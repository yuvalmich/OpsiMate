import {IntegrationType} from "@service-peek/shared";

export type IntegrationRow = {
    id: number;
    name: string;
    type: IntegrationType;
    external_url: string;
    credentials: string; // stored as JSON string in DB
    created_at: string; // SQLite returns DATETIME as string
};
