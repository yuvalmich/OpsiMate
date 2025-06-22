import { db } from './db';

// Define SavedView type
export interface SavedView {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  filters: Record<string, any>;
  visibleColumns: Record<string, boolean>;
  searchTerm: string;
  isDefault?: number;
}

export const viewRepository = {
  /**
   * Get all saved views
   */
  async getAllViews(): Promise<SavedView[]> {
    try {
      const views = await db.all(
        `SELECT * FROM views`
      );
      
      return views.map((view: any) => ({
        ...view,
        filters: JSON.parse(view.filters),
        visibleColumns: JSON.parse(view.visibleColumns)
      }));
    } catch (error) {
      console.error('Error getting views:', error);
      return [];
    }
  },

  /**
   * Get a specific view by ID
   */
  async getViewById(id: string): Promise<SavedView | null> {
    try {
      const view = await db.get(
        `SELECT * FROM views WHERE id = ?`,
        [id]
      );
      
      if (!view) return null;
      
      return {
        ...view,
        filters: JSON.parse(view.filters),
        visibleColumns: JSON.parse(view.visibleColumns)
      };
    } catch (error) {
      console.error('Error getting view by ID:', error);
      return null;
    }
  },

  /**
   * Create a new view
   */
  async createView(view: SavedView): Promise<SavedView | null> {
    try {
      await db.run(
        `INSERT INTO views (id, name, description, createdAt, filters, visibleColumns, searchTerm)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          view.id,
          view.name,
          view.description || '',
          view.createdAt,
          JSON.stringify(view.filters),
          JSON.stringify(view.visibleColumns),
          view.searchTerm
        ]
      );
      
      return view;
    } catch (error) {
      console.error('Error creating view:', error);
      return null;
    }
  },

  /**
   * Update an existing view
   */
  async updateView(view: SavedView): Promise<SavedView | null> {
    try {
      await db.run(
        `UPDATE views 
         SET name = ?, description = ?, filters = ?, visibleColumns = ?, searchTerm = ?
         WHERE id = ?`,
        [
          view.name,
          view.description || '',
          JSON.stringify(view.filters),
          JSON.stringify(view.visibleColumns),
          view.searchTerm,
          view.id
        ]
      );
      
      return view;
    } catch (error) {
      console.error('Error updating view:', error);
      return null;
    }
  },

  /**
   * Delete a view
   */
  async deleteView(id: string): Promise<boolean> {
    try {
      // Check if this is the default view
      const view = await db.get(
        `SELECT isDefault FROM views WHERE id = ?`,
        [id]
      );
      
      // Don't allow deletion of default view
      if (view && view.isDefault === 1) {
        return false;
      }
      
      const result = await db.run(
        `DELETE FROM views WHERE id = ?`,
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting view:', error);
      return false;
    }
  },

  /**
   * Save active view ID
   */
  async saveActiveViewId(viewId: string): Promise<boolean> {
    try {
      // Check if preferences exist
      const prefs = await db.get(
        `SELECT * FROM view_preferences WHERE id = 1`
      );
      
      if (prefs) {
        // Update existing preferences
        await db.run(
          `UPDATE view_preferences SET activeViewId = ? WHERE id = 1`,
          [viewId]
        );
      } else {
        // Create new preferences
        await db.run(
          `INSERT INTO view_preferences (id, activeViewId) VALUES (1, ?)`,
          [viewId]
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error saving active view ID:', error);
      return false;
    }
  },

  /**
   * Get active view ID
   */
  async getActiveViewId(): Promise<string | null> {
    try {
      const prefs = await db.get(
        `SELECT activeViewId FROM view_preferences WHERE id = 1`
      );
      
      return prefs?.activeViewId || null;
    } catch (error) {
      console.error('Error getting active view ID:', error);
      return null;
    }
  },

  /**
   * Initialize the views table in the database
   */
  async initViewsTable(): Promise<void> {
    try {
      // Create views table
      await db.run(`
        CREATE TABLE IF NOT EXISTS views (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          createdAt TEXT NOT NULL,
          filters TEXT NOT NULL,
          visibleColumns TEXT NOT NULL,
          searchTerm TEXT,
          isDefault INTEGER DEFAULT 0
        )
      `);
      
      // Create view preferences table
      await db.run(`
        CREATE TABLE IF NOT EXISTS view_preferences (
          id INTEGER PRIMARY KEY,
          activeViewId TEXT
        )
      `);
      
      // Check if default view exists
      const defaultView = await db.get(
        `SELECT * FROM views WHERE id = 'default-view'`
      );
      
      if (!defaultView) {
        // Create default view
        const now = new Date().toISOString();
        await db.run(
          `INSERT INTO views (id, name, description, createdAt, filters, visibleColumns, searchTerm, isDefault)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'default-view',
            'All Services',
            'Default view showing all services',
            now,
            JSON.stringify({}),  // Empty filters
            JSON.stringify({}),  // All columns visible
            '',                  // No search term
            1                    // Is default
          ]
        );
        
        // Set as active view
        await db.run(
          `INSERT OR REPLACE INTO view_preferences (id, activeViewId) VALUES (1, 'default-view')`
        );
      }
    } catch (error) {
      console.error('Error initializing views table:', error);
    }
  }
};
