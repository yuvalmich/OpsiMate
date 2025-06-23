export enum ProviderType {
  VM = 'VM',
  K8S = 'K8S',
}

export interface Provider {
  id: number;
  provider_name: string;
  provider_ip: string;
  username: string;
  private_key_filename: string;
  ssh_port: number;
  created_at: string;
  provider_type: ProviderType;
}

export interface Service {
  id: number;
  provider_id: number;
  service_name: string;
  service_ip?: string;
  service_status: string;
  created_at: string;
}

export interface ServiceInstance {
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