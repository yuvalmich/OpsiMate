import {Integration, IntegrationUrls} from "@service-peek/shared";

export interface IntegrationConnector {
    getUrls(integration: Integration, tags: string[]): Promise<IntegrationUrls>;
}