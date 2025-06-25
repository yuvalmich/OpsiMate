import {Provider, DiscoveredService} from "@service-peek/shared";

export interface ProviderConnector {
    discoverServices(provider: Provider): Promise<DiscoveredService[]>;
    startService(provider: Provider, serviceName: string): Promise<void>;
    stopService(provider: Provider, serviceName: string): Promise<void>;
}