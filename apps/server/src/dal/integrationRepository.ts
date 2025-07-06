import Database from 'better-sqlite3';
import { runAsync } from './db';
import { Integration } from '@service-peek/shared';
import { IntegrationRow } from './models';

const mapRowToIntegration = (row: IntegrationRow): Integration => ({
    id: row.id,
    name: row.name,
    type: row.type,
    externalUrl: row.external_url,
    credentials: JSON.parse(row.credentials),
    createdAt: row.created_at,
});

export class IntegrationRepository {
    private db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    async createIntegration(data: Omit<Integration, 'id' | 'createdAt'>): Promise<{ lastID: number }> {
        return await runAsync(() => {
            const stmt = this.db.prepare(`
                INSERT INTO integrations (name, type, external_url, credentials)
                VALUES (?, ?, ?, ?)
            `);
            const result = stmt.run(
                data.name,
                data.type,
                data.externalUrl,
                JSON.stringify(data.credentials)
            );
            return { lastID: result.lastInsertRowid as number };
        });
    }

    async getIntegrationById(id: number): Promise<Integration> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                SELECT id, name, type, external_url, credentials, created_at
                FROM integrations
                WHERE id = ?
            `);
            const row = stmt.get(id) as IntegrationRow;
            return mapRowToIntegration(row);
        });
    }

    async getAllIntegrations(): Promise<Integration[]> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                SELECT id, name, type, external_url, credentials, created_at
                FROM integrations
                ORDER BY created_at DESC
            `);
            const rows = stmt.all() as IntegrationRow[];
            return rows.map(mapRowToIntegration);
        });
    }

    async deleteIntegration(id: number): Promise<void> {
        return runAsync(() => {
            const stmt = this.db.prepare('DELETE FROM integrations WHERE id = ?');
            stmt.run(id);
        });
    }

    async updateIntegration(id: number, data: Omit<Integration, 'id' | 'createdAt'>): Promise<void> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                UPDATE integrations
                SET name = ?, type = ?, external_url = ?, credentials = ?
                WHERE id = ?
            `);
            stmt.run(
                data.name,
                data.type,
                data.externalUrl,
                JSON.stringify(data.credentials),
                id
            );
        });
    }

    async initIntegrationsTable(): Promise<void> {
        return runAsync(() => {
            // First, check if the table exists and has the old constraint
            const tableInfo = this.db.prepare(`
                SELECT sql FROM sqlite_master 
                WHERE type='table' AND name='integrations'
            `).get() as any;
            
            // If table exists but doesn't include Kibana in the constraint, recreate it
            if (tableInfo && !tableInfo.sql.includes('Kibana')) {
                console.log('Updating integrations table to include Kibana support...');
                
                // Backup existing data
                const existingData = this.db.prepare('SELECT * FROM integrations').all() as Array<{
                    id: number;
                    name: string;
                    type: string;
                    external_url: string;
                    credentials: string;
                    created_at: string;
                }>;
                
                // Drop the old table
                this.db.prepare('DROP TABLE integrations').run();
                
                // Create the new table with updated constraint
                this.db.prepare(`
                    CREATE TABLE integrations
                    (
                        id           INTEGER PRIMARY KEY AUTOINCREMENT,
                        name         TEXT NOT NULL,
                        type         TEXT NOT NULL CHECK (type IN ('Grafana', 'Prometheus', 'Coralogix', 'Kibana')),
                        external_url TEXT NOT NULL,
                        credentials  JSON NOT NULL,
                        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                `).run();
                
                // Restore existing data
                if (existingData.length > 0) {
                    const insertStmt = this.db.prepare(`
                        INSERT INTO integrations (id, name, type, external_url, credentials, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `);
                    
                    for (const row of existingData) {
                        insertStmt.run(row.id, row.name, row.type, row.external_url, row.credentials, row.created_at);
                    }
                }
                
                console.log('Integrations table updated successfully');
            } else {
                // Create table if it doesn't exist
                this.db.prepare(`
                    CREATE TABLE IF NOT EXISTS integrations
                    (
                        id           INTEGER PRIMARY KEY AUTOINCREMENT,
                        name         TEXT NOT NULL,
                        type         TEXT NOT NULL CHECK (type IN ('Grafana', 'Prometheus', 'Coralogix', 'Kibana')),
                        external_url TEXT NOT NULL,
                        credentials  JSON NOT NULL,
                        created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                `).run();
            }
        });
    }
}
