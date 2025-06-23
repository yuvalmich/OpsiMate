import { z } from 'zod';
import { ProviderType, ServiceType } from './types';

export const CreateProviderSchema = z.object({
  provider_name: z.string().min(1, 'Provider name is required'),
  provider_ip: z.string().ip('Invalid IP address'),
  username: z.string().min(1, 'Username is required'),
  private_key_filename: z.string().min(1, 'Private key filename is required'),
  ssh_port: z.number().int().min(1).max(65535).optional().default(22),
  provider_type: z.nativeEnum(ProviderType),
});

export const BulkServiceSchema = z.object({
  service_names: z.array(z.string().min(1, 'Service name is required'))
});

export const ProviderIdSchema = z.object({
  providerId: z.string().transform((val) => {
    const parsed = parseInt(val);
    if (isNaN(parsed)) {
      throw new Error('Invalid provider ID');
    }
    return parsed;
  })
});

export const ServiceSchema = z.object({
  provider_id: z.number(),
  service_name: z.string(),
  service_ip: z.string().optional(),
  service_status: z.string().optional(),
  service_type: z.nativeEnum(ServiceType),
});

export type CreateProviderRequest = z.infer<typeof CreateProviderSchema>;
export type BulkServiceRequest = z.infer<typeof BulkServiceSchema>;
export type ProviderIdParams = z.infer<typeof ProviderIdSchema>; 