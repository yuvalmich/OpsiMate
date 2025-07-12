import Database from 'better-sqlite3';
import { runAsync } from './db';
import { AlertRow } from './models';
import { Alert as SharedAlert } from '@service-peek/shared/src/types';

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

    private toSharedAlert = (row: AlertRow): SharedAlert => {
        return {
            id: row.id,
            status: row.status,
            tag: row.tag,
            startsAt: row.starts_at,
            updatedAt: row.updated_at,
            alertUrl: row.alert_url,
            createdAt: row.created_at,
            isDismissed: row.is_dismissed,
        };
    };

    async getAllAlerts(): Promise<SharedAlert[]> {
        return runAsync(() => {
            const stmt = this.db.prepare('SELECT * FROM alerts');
            const rows = stmt.all() as AlertRow[];
            return rows.map(this.toSharedAlert);
        });
    }

    async dismissAlert(id: string): Promise<SharedAlert | null> {
        return runAsync(() => {
            const updateStmt = this.db.prepare('UPDATE alerts SET is_dismissed = 1 WHERE id = ?');
            updateStmt.run(id);
            const selectStmt = this.db.prepare('SELECT * FROM alerts WHERE id = ?');
            const row = selectStmt.get(id) as AlertRow | undefined;
            return row ? this.toSharedAlert(row) : null;
        });
    }
}