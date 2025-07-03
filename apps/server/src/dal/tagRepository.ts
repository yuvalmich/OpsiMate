import {Tag} from '@service-peek/shared';
import {db} from "./providerRepository";


// Data access for tags
export async function createTag(data: Omit<Tag, 'id' | 'createdAt'>): Promise<{ lastID: number }> {
    return new Promise<{ lastID: number }>((resolve, reject) => {
        db.run(
            'INSERT INTO tags (name, color) VALUES (?, ?)',
            [data.name, data.color],
            function (err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID });
            }
        );
    });
}

export async function getAllTags(): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
        db.all('SELECT * FROM tags ORDER BY name', [], (err, rows: any[]) => {
            if (err) reject(err);
            else {
                const tags = rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    createdAt: row.created_at
                }));
                resolve(tags);
            }
        });
    });
}

export async function getTagById(id: number): Promise<Tag | null> {
    return new Promise<Tag | null>((resolve, reject) => {
        db.get('SELECT * FROM tags WHERE id = ?', [id], (err, row: any) => {
            if (err) reject(err);
            else {
                if (!row) {
                    resolve(null);
                    return;
                }
                const tag = {
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    createdAt: row.created_at
                };
                resolve(tag);
            }
        });
    });
}

export async function updateTag(id: number, data: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const updates: string[] = [];
        const values: any[] = [];
        
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.color !== undefined) {
            updates.push('color = ?');
            values.push(data.color);
        }
        
        if (updates.length === 0) {
            resolve();
            return;
        }
        
        values.push(id);
        const query = `UPDATE tags SET ${updates.join(', ')} WHERE id = ?`;
        
        db.run(query, values, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

export async function deleteTag(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run('DELETE FROM tags WHERE id = ?', [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Service tag operations
export async function addTagToService(serviceId: number, tagId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(
            'INSERT OR IGNORE INTO service_tags (service_id, tag_id) VALUES (?, ?)',
            [serviceId, tagId],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

export async function removeTagFromService(serviceId: number, tagId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        db.run(
            'DELETE FROM service_tags WHERE service_id = ? AND tag_id = ?',
            [serviceId, tagId],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

export async function getServiceTags(serviceId: number): Promise<Tag[]> {
    return new Promise<Tag[]>((resolve, reject) => {
        const query = `
            SELECT t.id, t.name, t.color, t.created_at
            FROM tags t
            JOIN service_tags st ON t.id = st.tag_id
            WHERE st.service_id = ?
            ORDER BY t.name
        `;
        
        db.all(query, [serviceId], (err, rows: any[]) => {
            if (err) reject(err);
            else {
                const tags = rows.map(row => ({
                    id: row.id,
                    name: row.name,
                    color: row.color,
                    createdAt: row.created_at
                }));
                resolve(tags);
            }
        });
    });
}

export async function initTagsTables(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // Create tags table
        db.run(`
            CREATE TABLE IF NOT EXISTS tags (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            // Create service_tags junction table
            db.run(`
                CREATE TABLE IF NOT EXISTS service_tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    service_id INTEGER NOT NULL,
                    tag_id INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(service_id, tag_id),
                    FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE,
                    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
} 