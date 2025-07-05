import {Integration, IntegrationUrls} from "@service-peek/shared";
import {IntegrationConnector} from "./integration-connector";
import {GrafanaClient} from "../../../dal/external-client/grafana-client";

export class GrafanaIntegrationConnector implements IntegrationConnector {
    async getUrls(integration: Integration, tags: string[]): Promise<IntegrationUrls> {
        const grafanaClient = new GrafanaClient(integration.externalUrl, integration.credentials["token"]);

        // todo: add types to grafana
        const dashboards: any = await grafanaClient.searchByTags(tags);

        return dashboards.map((dash: any) => ({
            name: dash.title,
            url: `${integration.externalUrl.replace(/\/$/, '')}${dash.url}`,
        }));    }
}