import Database from 'better-sqlite3';
import { runAsync } from './db';
import { ViewRow } from './models';
import { View } from '@OpsiMate/shared';

export class ViewRepository {
	constructor(private db: Database.Database) {}

	private toSharedView = (viewRow: ViewRow): View => {
		return {
			id: viewRow.id,
			name: viewRow.name,
			createdAt: viewRow.createdAt,
			filters: JSON.parse(viewRow.filters) as Record<string, unknown>,
			visibleColumns: JSON.parse(viewRow.visibleColumns) as Record<string, boolean>,
			searchTerm: viewRow.searchTerm,
			type: viewRow.type,
		};
	};

	async getAllViews(): Promise<View[]> {
		return runAsync(() => {
			const rows = this.db.prepare(`SELECT * FROM views`).all() as ViewRow[];
			return rows.map(this.toSharedView);
		});
	}

	async getViewById(id: string): Promise<View | null> {
		return runAsync(() => {
			const row: ViewRow = this.db.prepare(`SELECT * FROM views WHERE id = ?`).get(id) as ViewRow;
			return row ? this.toSharedView(row) : null;
		});
	}

	async createView(view: Omit<View, 'createdAt' | 'id'>): Promise<number> {
		return runAsync(() => {
			const stmt = this.db.prepare(`
                INSERT INTO views (name, type, description, filters, visibleColumns, searchTerm)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
			const result = stmt.run(
				view.name,
				view.type,
				view.description || '',
				JSON.stringify(view.filters),
				JSON.stringify(view.visibleColumns),
				view.searchTerm
			);
			return result.lastInsertRowid as number;
		});
	}

	async deleteView(id: string): Promise<boolean> {
		return runAsync(() => {
			const result = this.db.prepare(`DELETE FROM views WHERE id = ?`).run(id);
			return result.changes > 0;
		});
	}

	async initViewsTable(): Promise<void> {
		return runAsync(() => {
			this.db
				.prepare(
					`
                        CREATE TABLE IF NOT EXISTS views
                        (
                            id             INTEGER PRIMARY KEY AUTOINCREMENT,
							type	       TEXT NOT NULL,
                            name           TEXT NOT NULL,
                            description    TEXT,
                            createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP,
                            filters        TEXT NOT NULL,
                            visibleColumns TEXT NOT NULL,
                            searchTerm     TEXT
                        )
                    `
				)
				.run();
		});
	}
}
