import Database from 'better-sqlite3';
import { runAsync } from './db';
import { DashboardRow } from './models';
import { Dashboard } from '@OpsiMate/shared';

export class DashboardRepository {
	constructor(private db: Database.Database) {}

	private toSharedDashboard = (dashboardRow: DashboardRow): Dashboard => {
		return {
			id: dashboardRow.id,
			name: dashboardRow.name,
			createdAt: dashboardRow.createdAt,
			filters: JSON.parse(dashboardRow.filters) as Record<string, unknown>,
			visibleColumns: JSON.parse(dashboardRow.visibleColumns) as Record<string, boolean>,
			searchTerm: dashboardRow.searchTerm,
			type: dashboardRow.type,
		};
	};

	async getAllDashboards(): Promise<Dashboard[]> {
		return runAsync(() => {
			const rows = this.db.prepare(`SELECT * FROM views`).all() as DashboardRow[];
			return rows.map(this.toSharedDashboard);
		});
	}

	async getDashboardById(id: string): Promise<Dashboard | null> {
		return runAsync(() => {
			const row: DashboardRow = this.db.prepare(`SELECT *FROM views WHERE id = ?`).get(id) as DashboardRow;
			return row ? this.toSharedDashboard(row) : null;
		});
	}

	async createDashboard(view: Omit<Dashboard, 'createdAt' | 'id'>): Promise<number> {
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

	async deleteDashboard(id: string): Promise<boolean> {
		return runAsync(() => {
			const result = this.db.prepare(`DELETE FROM views WHERE id = ?`).run(id);
			return result.changes > 0;
		});
	}

	async initDashboardTable(): Promise<void> {
		return runAsync(() => {
			this.db
				.prepare(
					`
                        CREATE TABLE IF NOT EXISTS dashboards
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
