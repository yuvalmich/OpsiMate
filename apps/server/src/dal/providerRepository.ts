import sqlite3 from 'sqlite3';
import {Provider} from '@service-peek/shared';
import path from "path";

const db = new sqlite3.Database(path.join(__dirname, '../../service_peek.db'));

// Data access for providers
export async function createProvider(data: Omit<Provider, 'id'>): Promise<{ lastID: number }> {
    return new Promise<{ lastID: number }>((resolve, reject) => {
        db.run(
            'INSERT INTO providers (provider_name, provider_ip, username, private_key_filename, ssh_port, provider_type) VALUES (?, ?, ?, ?, ?, ?)',
            [data.name, data.providerIP, data.username, data.privateKeyFilename, data.SSHPort, data.providerType],
            function (err) {
                if (err) reject(err);
                else resolve({lastID: this.lastID});
            }
        );
    });
}

export async function getProviderById(id: number): Promise<Provider> {
    return new Promise<any>((resolve, reject) => {
        db.get(`
            SELECT id,
                   provider_name        AS name,
                   provider_ip          AS providerIP,
                   username,
                   private_key_filename AS privateKeyFilename,
                   ssh_port             AS SSHPort,
                   created_at           AS createdAt,
                   provider_type        AS providerType
            FROM providers
            WHERE id = ?
        `, [id], (err, row) => {
            if (err) reject(err);
            else resolve(row as Provider);
        });
    });
}

export async function getAllProviders(): Promise<Provider[]> {
    const query = `
        SELECT id,
               provider_name        AS name,
               provider_ip          AS providerIP,
               username,
               private_key_filename AS privateKeyFilename,
               ssh_port             AS SSHPort,
               created_at           AS createdAt,
               provider_type        AS providerType
        FROM providers
        ORDER BY created_at DESC
    `

    return new Promise<Provider[]>((resolve, reject) => {
        db.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as Provider[]);
        });
    });
}

export async function deleteProvider(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // First delete all associated services
        db.run('DELETE FROM services WHERE provider_id = ?', [id], (err) => {
            if (err) {
                reject(err);
                return;
            }

            // Then delete the provider
            db.run('DELETE FROM providers WHERE id = ?', [id], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

export async function updateProvider(id: number, data: Omit<Provider, 'id' | 'createdAt'>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(
            'UPDATE providers SET provider_name = ?, provider_ip = ?, username = ?, private_key_filename = ?, ssh_port = ?, provider_type = ? WHERE id = ?',
            [data.name, data.providerIP, data.username, data.privateKeyFilename, data.SSHPort, data.providerType, id],
            function (err) {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

export async function initProvidersTable(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS providers
            (
                id
                INTEGER
                PRIMARY
                KEY
                AUTOINCREMENT,
                provider_name
                TEXT
                NOT
                NULL,
                provider_ip
                TEXT
                NOT
                NULL,
                username
                TEXT
                NOT
                NULL,
                private_key_filename
                TEXT
                NOT
                NULL,
                ssh_port
                INTEGER
                DEFAULT
                22,
                created_at
                DATETIME
                DEFAULT
                CURRENT_TIMESTAMP,
                provider_type
                TEXT
                NOT
                NULL
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export {db};