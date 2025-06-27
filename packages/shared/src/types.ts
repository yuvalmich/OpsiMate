export enum ProviderType {
  VM = 'VM',
  K8S = 'K8S',
}

export enum ServiceType {
  DOCKER = 'DOCKER',
  SYSTEMD = 'SYSTEMD',
  MANUAL = 'MANUAL',
}

export interface Provider {
  id: number;
  name: string;
  providerIp: string;
  username: string;
  privateKeyFilename: string;
  SSHPort: number;
  createdAt: number;
  providerType: ProviderType;
}

export interface ContainerDetails {
  id?: string;
  image?: string;
  created?: string;
}

export interface Service {
  id: number;
  providerId: number;
  name: string;
  serviceIp?: string;
  serviceStatus: string;
  createdAt: string;
  serviceType: ServiceType;
  // todo - this be in different interface
  container_details?: ContainerDetails;
}

export interface ServiceWithProvider extends Service {
  provider: Provider;
}

export interface DiscoveredService {
  service_name: string;
  service_status: string;
  service_ip: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}