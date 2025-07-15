import Database from 'better-sqlite3';
import { runAsync } from './db';
import { UserRow } from './models';

export class UserRepository {
    private db: Database.Database;

    constructor(db: Database.Database) {
        this.db = db;
    }

    async initUsersTable(): Promise<void> {
        return runAsync(() => {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    full_name TEXT NOT NULL,
                    role TEXT NOT NULL CHECK(role IN ('admin', 'viewer')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `).run();
        });
    }

    async createUser(email: string, password_hash: string, full_name: string, role: 'admin' | 'viewer'): Promise<{ lastID: number }> {
        return runAsync<{ lastID: number }>(() => {
            const stmt = this.db.prepare(
                'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)' 
            );
            const result = stmt.run(email, password_hash, full_name, role);
            return { lastID: result.lastInsertRowid as number };
        });
    }

    async findByEmail(email: string): Promise<UserRow | undefined> {
        return runAsync(() => {
            const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
            return stmt.get(email) as UserRow | undefined;
        });
    }

    async countUsers(): Promise<number> {
        return runAsync(() => {
            const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
            const row = stmt.get() as { count: number };
            return row.count;
        });
    }
} 