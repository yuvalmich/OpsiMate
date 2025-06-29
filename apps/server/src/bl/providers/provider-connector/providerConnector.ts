import {Provider, DiscoveredService} from "@service-peek/shared";

export interface ProviderConnector {
    discoverServices(provider: Provider): Promise<DiscoveredService[]>;
    startService(provider: Provider, serviceName: string): Promise<void>;
    stopService(provider: Provider, serviceName: string): Promise<void>;
    getServiceLogs(provider: Provider, serviceName: string): Promise<string[]>;
    testConnection(provider: Provider): Promise<boolean>;
}