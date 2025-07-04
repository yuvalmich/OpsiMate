import Database from 'better-sqlite3';
import { Service, Provider } from '@service-peek/shared';
import { runAsync } from './db';

type ServiceWithProvider = Service & { provider: Provider };

export class ServiceRepository {
    constructor(private db: Database.Database) {}

    async createService(data: Omit<Service, 'id' | 'createdAt'>): Promise<{ lastID: number }> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                INSERT INTO services (provider_id, service_name, service_ip, service_status, service_type, container_details)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            const result = stmt.run(
                data.providerId,
                data.name,
                data.serviceIP,
                data.serviceStatus || 'unknown',
                data.serviceType,
                data.containerDetails ? JSON.stringify(data.containerDetails) : null
            );

            return { lastID: result.lastInsertRowid as number };
        });
    }

    async bulkCreateServices(providerId: number, services: Omit<Service, 'id' | 'providerId' | 'createdAt'>[]): Promise<Service[]> {
        const created = [];

        for (const service of services) {
            const result = await this.createService({ ...service, providerId });
            const fullService = await this.getServiceById(result.lastID);
            if (fullService) created.push(fullService);
        }

        return created;
    }

    async getServiceById(id: number): Promise<Service | null> {
        return runAsync(() => {
            const row: any = this.db.prepare('SELECT * FROM services WHERE id = ?').get(id);
            if (!row) return null;

            let containerDetails = null;
            if (row.container_details) {
                try {
                    containerDetails = JSON.parse(row.container_details);
                } catch (e) {
                    console.error('Error parsing container_details JSON:', e);
                }
            }

            return {
                id: row.id,
                providerId: row.provider_id,
                name: row.service_name,
                serviceIP: row.service_ip,
                serviceStatus: row.service_status,
                serviceType: row.service_type,
                createdAt: row.created_at,
                containerDetails,
            };
        });
    }

    async updateService(id: number, data: Partial<Service>): Promise<void> {
        const existing = await this.getServiceById(id);
        if (!existing) throw new Error('Service not found');

        const updates: Record<string, any> = {};
        if (data.name !== undefined) updates.service_name = data.name;
        if (data.serviceIP !== undefined) updates.service_ip = data.serviceIP;
        if (data.serviceStatus !== undefined) updates.service_status = data.serviceStatus;
        if (data.serviceType !== undefined) updates.service_type = data.serviceType;
        if (data.containerDetails !== undefined) {
            updates.container_details = data.containerDetails ? JSON.stringify(data.containerDetails) : null;
        }

        const fields = Object.keys(updates);
        if (fields.length === 0) return;

        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);

        return runAsync(() => {
            this.db.prepare(`UPDATE services SET ${setClause} WHERE id = ?`).run(...values, id);
        });
    }

    async deleteService(id: number): Promise<void> {
        return runAsync(() => {
            this.db.prepare('DELETE FROM services WHERE id = ?').run(id);
        });
    }

    async getServicesWithProvider(): Promise<ServiceWithProvider[]> {
        return runAsync(() => {
            const query = `
                SELECT s.id as service_id, s.provider_id, s.service_name, s.service_ip,
                       s.service_status, s.service_type, s.created_at as service_created_at,
                       s.container_details,
                       p.id as provider_id, p.provider_name, p.provider_ip, p.username,
                       p.private_key_filename, p.ssh_port, p.created_at as provider_created_at,
                       p.provider_type
                FROM services s
                JOIN providers p ON s.provider_id = p.id
                ORDER BY s.created_at DESC
            `;

            const rows = this.db.prepare(query).all();

            return rows.map((row: any) => {
                let containerDetails = null;
                if (row.container_details) {
                    try {
                        containerDetails = JSON.parse(row.container_details);
                    } catch (e) {
                        console.error('Error parsing container_details JSON:', e);
                    }
                }

                return {
                    id: row.service_id,
                    providerId: row.provider_id,
                    name: row.service_name,
                    serviceIP: row.service_ip,
                    serviceStatus: row.service_status,
                    serviceType: row.service_type,
                    createdAt: row.service_created_at,
                    containerDetails,
                    provider: {
                        id: row.provider_id,
                        name: row.provider_name,
                        providerIP: row.provider_ip,
                        username: row.username,
                        privateKeyFilename: row.private_key_filename,
                        SSHPort: row.ssh_port,
                        createdAt: row.provider_created_at,
                        providerType: row.provider_type,
                    },
                };
            });
        });
    }

    async getServiceWithProvider(id: number): Promise<ServiceWithProvider | null> {
        return runAsync(() => {
            const query = `
                SELECT s.id as service_id, s.provider_id, s.service_name, s.service_ip,
                       s.service_status, s.service_type, s.created_at as service_created_at,
                       s.container_details,
                       p.id as provider_id, p.provider_name, p.provider_ip, p.username,
                       p.private_key_filename, p.ssh_port, p.created_at as provider_created_at,
                       p.provider_type
                FROM services s
                JOIN providers p ON s.provider_id = p.id
                WHERE s.id = ?
            `;

            const row: any = this.db.prepare(query).get(id);
            if (!row) return null;

            let containerDetails = null;
            if (row.container_details) {
                try {
                    containerDetails = JSON.parse(row.container_details);
                } catch (e) {
                    console.error('Error parsing container_details JSON:', e);
                }
            }

            return {
                id: row.service_id,
                providerId: row.provider_id,
                name: row.service_name,
                serviceIP: row.service_ip,
                serviceStatus: row.service_status,
                serviceType: row.service_type,
                createdAt: row.service_created_at,
                containerDetails,
                provider: {
                    id: row.provider_id,
                    name: row.provider_name,
                    providerIP: row.provider_ip,
                    username: row.username,
                    privateKeyFilename: row.private_key_filename,
                    SSHPort: row.ssh_port,
                    createdAt: row.provider_created_at,
                    providerType: row.provider_type,
                },
            };
        });
    }

    async getServicesByProviderId(providerId: number): Promise<Service[]> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                SELECT id, provider_id, service_name, service_ip,
                       service_status, service_type, created_at, container_details
                FROM services
                WHERE provider_id = ?
            `);

            const rows = stmt.all(providerId);

            return rows.map((row: any) => {
                let containerDetails = null;
                if (row.container_details) {
                    try {
                        containerDetails = JSON.parse(row.container_details);
                    } catch (e) {
                        console.error('Error parsing container_details JSON:', e);
                    }
                }

                return {
                    id: row.id,
                    providerId: row.provider_id,
                    name: row.service_name,
                    serviceIP: row.service_ip,
                    serviceStatus: row.service_status,
                    serviceType: row.service_type,
                    createdAt: row.created_at,
                    containerDetails,
                };
            });
        });
    }

    async initServicesTable(): Promise<void> {
        return runAsync(() => {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    provider_id INTEGER NOT NULL,
                    service_name TEXT NOT NULL,
                    service_ip TEXT,
                    service_status TEXT DEFAULT 'unknown',
                    service_type TEXT NOT NULL,
                    container_details TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (provider_id) REFERENCES providers (id)
                )
            `).run();
        });
    }
}
