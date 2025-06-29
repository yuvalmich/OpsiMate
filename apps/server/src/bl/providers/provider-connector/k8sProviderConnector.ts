import {ProviderConnector} from "./providerConnector";
import {DiscoveredService, Provider} from "@service-peek/shared";

export class K8SProviderConnector implements ProviderConnector {
    getServiceLogs(provider: Provider, serviceName: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    startService(provider: Provider, serviceName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    stopService(provider: Provider, serviceName: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async discoverServices(provider: Provider): Promise<DiscoveredService[]> {
        throw new Error("Method not implemented.");
    }
    async testConnection(provider: Provider): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}