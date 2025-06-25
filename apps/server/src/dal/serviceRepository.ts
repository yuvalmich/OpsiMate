import {db} from './providerRepository';
import {Service, ServiceType, ContainerDetails, Provider} from "@service-peek/shared";

// Data access for services
export async function createService(data: {
    providerId: number;
    name: string;
    serviceIp?: string;
    serviceStatus?: string;
    serviceType: ServiceType;
    containerDetails?: ContainerDetails;
}) {
    return new Promise<{ lastID: number }>((resolve, reject) => {
        // Convert container_details to JSON string if it exists
        const containerDetailsJson = data.containerDetails ? JSON.stringify(data.containerDetails) : null;

        db.run(
            'INSERT INTO services (provider_id, service_name, service_ip, service_status, service_type, container_details) VALUES (?, ?, ?, ?, ?, ?)',
            [data.providerId, data.name, data.serviceIp, data.serviceStatus || 'unknown', data.serviceType, containerDetailsJson],
            function (err) {
                if (err) reject(err);
                else resolve({lastID: this.lastID});
            }
        );
    });
}

export async function getServicesByProviderId(providerId: number) {
    return new Promise<any[]>((resolve, reject) => {
        db.all('SELECT * FROM services WHERE provider_id = ? ORDER BY created_at DESC', [providerId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

export async function bulkCreateServices(providerId: number, services: Omit<Service, 'id' | 'providerId' | 'createdAt'>[]) {
    const newServicesPromises = services.map(async (serviceToCreate) => {
            const result = await createService({
                providerId: providerId,
                serviceType: serviceToCreate.serviceType,
                name: serviceToCreate.name,
                serviceIp: serviceToCreate.serviceIp,
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

                resolve(row as Service);
            }
        });
    });
}

export async function updateService(id: number, data: Partial<Service>) {
    // First get the existing service to merge with updates
    const existingService = await getServiceById(id);
    if (!existingService) {
        throw new Error('Service not found');
    }

    // Prepare data for update
    const updateData = {
        ...data,
        container_details: data.container_details ?
            JSON.stringify(data.container_details) :
            existingService.container_details ?
                JSON.stringify(existingService.container_details) :
                null
    };

    return new Promise<void>((resolve, reject) => {
        // Build dynamic update query based on provided fields
        const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'created_at');
        if (fields.length === 0) {
            resolve(); // Nothing to update
            return;
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => field === 'container_details' ? updateData.container_details : data[field as keyof typeof data]);

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

export async function getServicesWithProvider(): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
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

        db.all(query, [], (err, rows) => {
            if (err) reject(err);
            else {
                // Transform the flat result into nested objects
                const services = rows.map((row: any) => {
                    // Parse container_details if it exists
                    let containerDetails = null;
                    if (row.container_details) {
                        try {
                            containerDetails = JSON.parse(row.container_details);
                        } catch (e) {
                            console.error('Error parsing container_details JSON:', e);
                        }
                    }

                    // Create the service object with provider nested
                    return {
                        id: row.service_id,
                        provider_id: row.provider_id,
                        service_name: row.service_name,
                        service_ip: row.service_ip,
                        service_status: row.service_status,
                        service_type: row.service_type,
                        created_at: row.service_created_at,
                        container_details: containerDetails,
                        provider: {
                            id: row.provider_id,
                            provider_name: row.provider_name,
                            provider_ip: row.provider_ip,
                            username: row.username,
                            private_key_filename: row.private_key_filename,
                            ssh_port: row.ssh_port,
                            created_at: row.provider_created_at,
                            provider_type: row.provider_type
                        }
                    };
                });

                resolve(services);
            }
        });
    });
}

export async function getServiceWithProvider(id: number): Promise<any | null> {
    return new Promise<any | null>((resolve, reject) => {
        const query = `
            SELECT s.id         as service_id,
                   s.provider_id,
                   s.service_name,
                   s.service_ip,
                   s.service_status,
                   s.created_at as service_created_at,
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

        db.get(query, [id], (err, row: any) => {
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

                // Create the service object with provider nested
                const service = {
                    id: row.service_id,
                    provider_id: row.provider_id,
                    service_name: row.service_name,
                    service_ip: row.service_ip,
                    service_status: row.service_status,
                    service_type: row.service_type,
                    created_at: row.service_created_at,
                    container_details: containerDetails,
                    provider: {
                        id: row.provider_id,
                        name: row.provider_name,
                        providerIp: row.provider_ip,
                        username: row.username,
                        privateKeyFilename: row.private_key_filename,
                        SSHPort: row.ssh_port,
                        createdAt: row.provider_created_at,
                        providerType: row.provider_type
                    } as Provider
                };

                resolve(service);
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