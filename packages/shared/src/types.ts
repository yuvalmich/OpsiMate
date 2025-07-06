export enum ProviderType {
  VM = 'VM',
  K8S = 'K8S',
}

export enum IntegrationType {
  Grafana = 'Grafana',
}

export enum ServiceType {
  DOCKER = 'DOCKER',
  SYSTEMD = 'SYSTEMD',
  MANUAL = 'MANUAL',
}

export interface IntegrationUrls {
  name: string,
  url: string,
}

export interface Provider {
  id: number;
  name: string;
  providerIP?: string;
  username?: string;
  privateKeyFilename: string;
  SSHPort?: number;
  createdAt: number;
  providerType: ProviderType;
}

export interface ContainerDetails {
  id?: string;
  image?: string;
  created?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

export interface ServiceTag {
  id: number;
  serviceId: number;
  tagId: number;
  createdAt: string;
}

export interface Service {
  id: number;
  providerId: number;
  name: string;
  serviceIP?: string;
  serviceStatus: string;
  createdAt: string;
  serviceType: ServiceType;
  // todo - this be in different interface
  containerDetails?: ContainerDetails;
  tags?: Tag[];
}

export interface ServiceWithProvider extends Service {
  provider: Provider;
}

export interface DiscoveredService {
  name: string;
  serviceStatus: string;
  serviceIP: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}