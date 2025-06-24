import {Provider, ServiceInstance} from "@service-peek/shared";

export interface ProviderConnector {
    connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<ServiceInstance[]>;
}