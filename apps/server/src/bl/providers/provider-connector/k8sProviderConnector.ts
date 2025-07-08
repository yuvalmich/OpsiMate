import {ProviderConnector} from "./providerConnector";
import {DiscoveredService, Provider} from "@service-peek/shared";
import {executeCommandOnKubernetes} from "../../../dal/kubeConnector";

// todo: remove when implementing
/* eslint-disable */
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
        return executeCommandOnKubernetes(provider);
    }
    async testConnection(provider: Provider): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}