import {z} from 'zod';
import {ProviderType, ServiceType} from './types';

export const CreateProviderSchema = z.object({
    name: z.string().min(1, 'Provider name is required'),
    providerIP: z.string().ip('Invalid IP address'),
    username: z.string().min(1, 'Username is required'),
    privateKeyFilename: z.string().min(1, 'Private key filename is required'),
    SSHPort: z.number().int().min(1).max(65535).optional().default(22),
    providerType: z.nativeEnum(ProviderType),
});

export const AddBulkServiceSchema = z.array(
    z.object({
        name: z.string().min(1, 'Name is required'),
        serviceIP: z.string().ip('Invalid IP address').optional(),
        serviceStatus: z.string().min(1),
        serviceType: z.nativeEnum(ServiceType),
    })
)

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
    providerId: z.number(),
    name: z.string().min(1, 'Service name is required'),
    serviceIP: z.string().optional(),
    serviceStatus: z.string(),
    serviceType: z.nativeEnum(ServiceType),
    containerDetails: z.object({
        id: z.string().optional(),
        image: z.string().optional(),
        created: z.string().optional()
    }).optional()
});

export const CreateServiceSchema = ServiceSchema;

export const UpdateServiceSchema = ServiceSchema.partial().extend({
    id: z.number()
});

export const ServiceIdSchema = z.object({
    serviceId: z.string().transform((val) => {
        const parsed = parseInt(val);
        if (isNaN(parsed)) {
            throw new Error('Invalid service ID');
        }
        return parsed;
    })
});

export type CreateProviderRequest = z.infer<typeof CreateProviderSchema>;
export type AddBulkServiceRequest = z.infer<typeof AddBulkServiceSchema>;
export type ProviderIdParams = z.infer<typeof ProviderIdSchema>;