import { ProviderType } from '@service-peek/shared';
import {ProviderConnector} from "./providerConnector";
import {K8SProviderConnector, VMProviderConnector} from "./vmProviderConnector";


export function providerConnectorFactory(type: ProviderType): ProviderConnector {
  return providersMap[type];
}

const providersMap = {
  [ProviderType.VM]: new VMProviderConnector(),
  [ProviderType.K8S]: new K8SProviderConnector(),
}