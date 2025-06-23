import { Provider, ServiceInstance, ProviderType } from '@service-peek/shared';
import * as sshClient from '../../dal/sshClient';


export interface ProviderConnector {
  connectAndListContainers(provider: Provider, privateKeyFilename: string): Promise<ServiceInstance[]>;
}

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

export function providerConnectorFactory(type: ProviderType): ProviderConnector {
  return providersMap[type];
}

const providersMap = {
  [ProviderType.VM]: new VMProviderConnector(),
  [ProviderType.K8S]: new K8SProviderConnector(),
}