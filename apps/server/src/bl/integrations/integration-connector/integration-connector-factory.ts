import {IntegrationType} from '@service-peek/shared';
import {IntegrationConnector} from "./integration-connector";
import {GrafanaIntegrationConnector} from "./grafana-integration-connector";


export function integrationConnectorFactory(type: IntegrationType): IntegrationConnector {
  return integrationsMap[type];
}

const integrationsMap = {
  [IntegrationType.Grafana]: new GrafanaIntegrationConnector(),
}