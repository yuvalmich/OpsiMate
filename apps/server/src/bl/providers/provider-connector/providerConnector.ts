import {Provider, DiscoveredService, Service} from "@service-peek/shared";

export interface ProviderConnector {
    discoverServices(provider: Provider): Promise<DiscoveredService[]>;
    startService(provider: Provider, serviceName: string): Promise<void>;
    stopService(provider: Provider, serviceName: string): Promise<void>;
    getServiceLogs(provider: Provider, service: Service): Promise<string[]>;
    testConnection(provider: Provider): Promise<boolean>;
}