import {Provider, DiscoveredService} from "@service-peek/shared";

export interface ProviderConnector {
    connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<DiscoveredService[]>;
}