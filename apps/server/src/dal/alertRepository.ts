import Database from 'better-sqlite3';
import { runAsync } from './db';
import { AlertRow } from './models';

export class AlertRepository {
    private db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    async insertOrUpdateAlert(alert: Omit<AlertRow, 'created_at' | 'is_dismissed'>): Promise<{ changes: number }> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                INSERT INTO alerts (id, status, tag, starts_at, updated_at, alert_url)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    status=excluded.status,
                    tag=excluded.tag,
                    starts_at=excluded.starts_at,
                    updated_at=excluded.updated_at,
                    alert_url=excluded.alert_url
            `);
            const result = stmt.run(
                alert.id,
                alert.status,
                alert.tag,
                alert.starts_at,
                alert.updated_at,
                alert.alert_url
            );
            return { changes: result.changes };
        });
    }


    async initAlertsTable(): Promise<void> {
        return runAsync(() => {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS alerts (
                    id TEXT PRIMARY KEY,
                    status TEXT,
                    tag TEXT,
                    starts_at TEXT,
                    updated_at TEXT,
                    alert_url TEXT,
                    is_dismissed BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `).run();
        });
    }

    async deleteAlertsNotInIds(ids: string[]): Promise<{ changes: number }> {
        return runAsync(() => {
            // If the array is empty, delete all alerts
            if (ids.length === 0) {
                const stmt = this.db.prepare(`DELETE FROM alerts`);
                const result = stmt.run();
                return { changes: result.changes };
            }
            // Otherwise, delete alerts not in the provided ids
            const placeholders = ids.map(() => '?').join(',');
            const stmt = this.db.prepare(
                `DELETE FROM alerts WHERE id NOT IN (${placeholders})`
            );
            const result = stmt.run(...ids);
            return { changes: result.changes };
        });
    }
}