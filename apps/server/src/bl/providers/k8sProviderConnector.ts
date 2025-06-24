import {ProviderConnector} from "./providerConnector";
import {DiscoveredService, Provider} from "@service-peek/shared";

export class K8SProviderConnector implements ProviderConnector {
    async connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<DiscoveredService[]> {
        // K8S implementation (empty for now)
        return [];
    }
}