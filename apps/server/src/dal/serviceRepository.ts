import {db} from './providerRepository';
import {Service, ServiceType, ContainerDetails, Provider, Tag} from "@service-peek/shared";
import * as tagRepo from './tagRepository';

// Data access for services
export async function createService(data: Omit<Service, 'id' | 'createdAt'>) {
    return new Promise<{ lastID: number }>((resolve, reject) => {
        // Convert container_details to JSON string if it exists
        const containerDetailsJson = data.containerDetails ? JSON.stringify(data.containerDetails) : null;

        db.run(
            'INSERT INTO services (provider_id, service_name, service_ip, service_status, service_type, container_details) VALUES (?, ?, ?, ?, ?, ?)',
            [data.providerId, data.name, data.serviceIP, data.serviceStatus || 'unknown', data.serviceType, containerDetailsJson],
            function (err) {
                if (err) reject(err);
                else resolve({lastID: this.lastID});
            }
        );
    });
}

export async function bulkCreateServices(providerId: number, services: Omit<Service, 'id' | 'providerId' | 'createdAt'>[]) {
    const newServicesPromises = services.map(async (serviceToCreate) => {
            const result = await createService({
                providerId: providerId,
                serviceType: serviceToCreate.serviceType,
                name: serviceToCreate.name,
                serviceIP: serviceToCreate.serviceIP,
                serviceStatus: serviceToCreate.serviceStatus,
            });

            return await getServiceById(result.lastID);
        }
    )
    try {
        const newServices = await Promise.all(newServicesPromises)
        // todo remove this filter when the get by id throws an error if service not found
        return newServices.filter(a => a !== null);

    } catch (error) {
        console.error('Error creating services:', error);
        throw error;
    }
}

// todo this function should throw an error if service not found
export async function getServiceById(id: number) {
    return new Promise<Service | null>((resolve, reject) => {
        db.get('SELECT * FROM services WHERE id = ?', [id], (err, row: any) => {
            if (err) reject(err);
            else {
                if (!row) {
                    resolve(null);
                    return;
                }

                // Parse container_details JSON if it exists
                if (row.container_details) {
                    try {
                        row.container_details = JSON.parse(row.container_details);
                    } catch (e) {
                        console.error('Error parsing container_details JSON:', e);
                        row.container_details = null;
                    }
                }

                const service = {
                    id: row.id,
                    providerId: row.provider_id,
                    name: row.service_name,
                    serviceIP: row.service_ip,
                    serviceStatus: row.service_status,
                    serviceType: row.service_type,
                    createdAt: row.service_created_at,
                    containerDetails: row.container_details,
                };

                resolve(service);
            }
        });
    });
}

export async function updateService(id: number, data: Partial<Service>) {
    const existingService = await getServiceById(id);
    if (!existingService) {
        throw new Error('Service not found');
    }

    // Mapping from camelCase to snake_case
    const fieldMap: Record<keyof Partial<Omit<Service, 'tags'>>, string> = {
        id: 'id',
        providerId: 'provider_id',
        name: 'service_name',
        serviceIP: 'service_ip',
        serviceStatus: 'service_status',
        createdAt: 'created_at',
        serviceType: 'service_type',
        containerDetails: 'container_details',
    };

    // Build the update data, converting field names and serializing if needed
    const updateData: Record<string, any> = {};
    for (const key in data) {
        if (key === 'containerDetails') {
            updateData['container_details'] = data.containerDetails
                ? JSON.stringify(data.containerDetails)
                : existingService.containerDetails
                    ? JSON.stringify(existingService.containerDetails)
                    : null;
        } else if (key in fieldMap && key !== 'id' && key !== 'createdAt') {
            updateData[fieldMap[key as keyof typeof fieldMap]] = data[key as keyof typeof data];
        }
    }

    const fields = Object.keys(updateData);
    if (fields.length === 0) {
        return; // Nothing to update
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);

    return new Promise<void>((resolve, reject) => {
        db.run(
            `UPDATE services
             SET ${setClause}
             WHERE id = ?`,
            [...values, id],
            function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

export async function deleteService(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run('DELETE FROM services WHERE id = ?', [id], function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Temp solution...
// Type for service with provider and tags
type ServiceWithProvider = Service & { provider: Provider}

export async function getServicesWithProvider(): Promise<ServiceWithProvider[]> {
    return new Promise<ServiceWithProvider[]>((resolve, reject) => {
        const query = `
            SELECT s.id         as service_id,
                   s.provider_id,
                   s.service_name,
                   s.service_ip,
                   s.service_status,
                   s.service_type,
                   s.created_at as service_created_at,
                   s.container_details,
                   p.id         as provider_id,
                   p.provider_name,
                   p.provider_ip,
                   p.username,
                   p.private_key_filename,
                   p.ssh_port,
                   p.created_at as provider_created_at,
                   p.provider_type
            FROM services s
                     JOIN providers p ON s.provider_id = p.id
            ORDER BY s.created_at DESC
        `;

        db.all(query, [], async (err, rows) => {
            if (err) reject(err);
            else {
                // Transform the flat result into nested objects
                const services = await Promise.all(rows.map(async (row: any) => {
                    // Parse container_details if it exists
                    let containerDetails = null;
                    if (row.container_details) {
                        try {
                            containerDetails = JSON.parse(row.container_details);
                        } catch (e) {
                            console.error('Error parsing container_details JSON:', e);
                        }
                    }

                    // Get tags for this service
                    const tags = await tagRepo.getServiceTags(row.service_id);

                    // Create the service object with provider nested
                    return {
                        id: row.service_id,
                        providerId: row.provider_id,
                        name: row.service_name,
                        serviceIP: row.service_ip,
                        serviceStatus: row.service_status,
                        serviceType: row.service_type,
                        createdAt: row.service_created_at,
                        containerDetails: containerDetails,
                        tags: tags,
                        provider: {
                            id: row.provider_id,
                            name: row.provider_name,
                            providerIP: row.provider_ip,
                            username: row.username,
                            privateKeyFilename: row.private_key_filename,
                            SSHPort: row.ssh_port,
                            createdAt: row.provider_created_at,
                            providerType: row.provider_type
                        }
                    };
                }));

                resolve(services);
            }
        });
    });
}

export async function getServiceWithProvider(id: number): Promise<ServiceWithProvider | null> {
    return new Promise<ServiceWithProvider | null>((resolve, reject) => {
        const query = `
            SELECT s.id         as service_id,
                   s.provider_id,
                   s.service_name,
                   s.service_ip,
                   s.service_status,
                   s.service_type,
                   s.created_at as service_created_at,
                   s.container_details,
                   p.id         as provider_id,
                   p.provider_name,
                   p.provider_ip,
                   p.username,
                   p.private_key_filename,
                   p.ssh_port,
                   p.created_at as provider_created_at,
                   p.provider_type
            FROM services s
                     JOIN providers p ON s.provider_id = p.id
            WHERE s.id = ?
        `;

        db.get(query, [id], async (err, row: any) => {
            if (err) reject(err);
            else {
                if (!row) {
                    resolve(null);
                    return;
                }

                // Parse container_details if it exists
                let containerDetails = null;
                if (row.container_details) {
                    try {
                        containerDetails = JSON.parse(row.container_details);
                    } catch (e) {
                        console.error('Error parsing container_details JSON:', e);
                    }
                }

                // Get tags for this service
                const tags = await tagRepo.getServiceTags(row.service_id);

                // Create the service object with provider nested
                const service: ServiceWithProvider = {
                    id: row.service_id,
                    providerId: row.provider_id,
                    name: row.service_name,
                    serviceIP: row.service_ip,
                    serviceStatus: row.service_status,
                    serviceType: row.service_type,
                    createdAt: row.service_created_at,
                    containerDetails: containerDetails,
                    tags: tags,
                    provider: {
                        id: row.provider_id,
                        name: row.provider_name,
                        providerIP: row.provider_ip,
                        username: row.username,
                        privateKeyFilename: row.private_key_filename,
                        SSHPort: row.ssh_port,
                        createdAt: row.provider_created_at,
                        providerType: row.provider_type
                    }
                };

                resolve(service);
            }
        });
    });
}

export async function getServicesByProviderId(providerId: number): Promise<Service[]> {
    return new Promise<Service[]>((resolve, reject) => {
        const query = `
            SELECT s.id         as service_id,
                   s.provider_id,
                   s.service_name,
                   s.service_ip,
                   s.service_status,
                   s.service_type,
                   s.created_at as service_created_at,
                   s.container_details
            FROM services s
            WHERE s.provider_id = ?
        `;

        db.all(query, [providerId], (err, rows: any[]) => {
            if (err) reject(err);
            else {
                const services = rows.map(row => {
                    let containerDetails = null;
                    if (row.container_details) {
                        try {
                            containerDetails = JSON.parse(row.container_details);
                        } catch (e) {
                            console.error('Error parsing container_details JSON:', e);
                        }
                    }
                    const service: Service = {
                        id: row.service_id,
                        providerId: row.provider_id,
                        name: row.service_name,
                        serviceIP: row.service_ip,
                        serviceStatus: row.service_status,
                        serviceType: row.service_type,
                        createdAt: row.service_created_at,
                        containerDetails: containerDetails,
                    };
                    return service;
                });
                resolve(services);
            }
        });
    });
}

export async function initServicesTable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS services
            (
                id
                INTEGER
                PRIMARY
                KEY
                AUTOINCREMENT,
                provider_id
                INTEGER
                NOT
                NULL,
                service_name
                TEXT
                NOT
                NULL,
                service_ip
                TEXT,
                service_status
                TEXT
                DEFAULT
                'unknown',
                service_type
                TEXT
                NOT
                NULL,
                container_details
                TEXT,
                created_at
                DATETIME
                DEFAULT
                CURRENT_TIMESTAMP,
                FOREIGN
                KEY
            (
                provider_id
            ) REFERENCES providers
            (
                id
            )
                )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}