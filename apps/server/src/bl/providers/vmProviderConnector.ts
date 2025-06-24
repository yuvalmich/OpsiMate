import {Provider, ServiceInstance} from "@service-peek/shared";
import * as sshClient from "../../dal/sshClient";
import {ProviderConnector} from "./providerConnector";

export class VMProviderConnector implements ProviderConnector {
    async connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<ServiceInstance[]> {
        return sshClient.connectAndListContainers(provider, privateKeyFilename);
    }
}
