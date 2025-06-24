import {Provider, ServiceInstance} from "@service-peek/shared";
import * as sshClient from "../../dal/sshClient";
import {ProviderConnector} from "./providerConnectorFactory";

export class VMProviderConnector implements ProviderConnector {
    async connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<ServiceInstance[]> {
        return sshClient.connectAndListContainers(provider, privateKeyFilename);
    }
}

export class K8SProviderConnector implements ProviderConnector {
    async connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<ServiceInstance[]> {
        // K8S implementation (empty for now)
        return [];
    }
}