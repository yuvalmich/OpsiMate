import Database from 'better-sqlite3';
import { runAsync } from './db';
import {AlertCommentRow} from "./models.ts";

export interface AlertComment {
    id: string;
    alertId: string;
    userId: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export class AlertCommentsRepository {
    private db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    async initAlertCommentsTable(): Promise<void> {
        return runAsync(() => {
            this.db.exec(`
				CREATE TABLE IF NOT EXISTS alert_comments (
					id TEXT PRIMARY KEY,
					alert_id TEXT NOT NULL,
					user_id TEXT NOT NULL,
					comment TEXT NOT NULL,
					created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
					FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
					FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
				);

				CREATE INDEX IF NOT EXISTS idx_alert_comments_alert_id ON alert_comments(alert_id);
				CREATE INDEX IF NOT EXISTS idx_alert_comments_user_id ON alert_comments(user_id);
				CREATE INDEX IF NOT EXISTS idx_alert_comments_created_at ON alert_comments(created_at);
			`);
        });
    }

    private toAlertComment = (row: AlertCommentRow): AlertComment => {
        return {
            id: row.id,
            alertId: row.alert_id,
            userId: row.user_id,
            comment: row.comment,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    };

    async createComment(comment: Omit<AlertComment, 'createdAt' | 'updatedAt' | 'id'>): Promise<AlertComment> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
                INSERT INTO alert_comments (alert_id, user_id, comment)
                VALUES (?, ?, ?)
            `);

            const result = stmt.run(comment.alertId, comment.userId, comment.comment);

            const row = this.db
                .prepare('SELECT * FROM alert_comments WHERE rowid = ?')
                .get(result.lastInsertRowid) as AlertCommentRow;

            return this.toAlertComment(row);
        });
    }

    async updateComment(id: string, comment: string): Promise<AlertComment | null> {
        return runAsync(() => {
            this.db
                .prepare(
                    `UPDATE alert_comments 
					SET comment = ?, updated_at = CURRENT_TIMESTAMP 
					WHERE id = ?`
                )
                .run(comment, id);

            const row = this.db
                .prepare('SELECT * FROM alert_comments WHERE id = ?')
                .get(id) as AlertCommentRow | undefined;

            return row ? this.toAlertComment(row) : null;
        });
    }

    async deleteComment(id: string): Promise<void> {
        return runAsync(() => {
            this.db.prepare('DELETE FROM alert_comments WHERE id = ?').run(id);
        });
    }

    async getCommentsByAlertId(alertId: string): Promise<AlertComment[]> {
        return runAsync(() => {
            const stmt = this.db.prepare(`
				SELECT * FROM alert_comments 
				WHERE alert_id = ? 
				ORDER BY created_at DESC
			`);
            const rows = stmt.all(alertId) as AlertCommentRow[];
            return rows.map(this.toAlertComment);
        });
    }

    async deleteCommentsByAlertId(alertId: string): Promise<void> {
        return runAsync(() => {
            this.db.prepare('DELETE FROM alert_comments WHERE alert_id = ?').run(alertId);
        });
    }
}