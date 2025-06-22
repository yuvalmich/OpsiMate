import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Database interface with promise-based methods
interface DbInterface {
  all: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  get: <T = any>(sql: string, params?: any[]) => Promise<T | undefined>;
  run: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  exec: (sql: string) => Promise<void>;
  close: () => Promise<void>;
}

// Initialize database connection
let dbInstance: DbInterface | null = null;

const initializeDb = async (): Promise<DbInterface> => {
  if (dbInstance) return dbInstance;

  const dbPath = path.resolve(__dirname, '../../../database.sqlite');
  
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    console.log(`SQLite database connected at ${dbPath}`);
    
    dbInstance = db as DbInterface;
    return dbInstance;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Export a singleton instance of the database
export const db: DbInterface = {
  all: async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
    const db = await initializeDb();
    return db.all<T>(sql, params);
  },
  
  get: async <T = any>(sql: string, params: any[] = []): Promise<T | undefined> => {
    const db = await initializeDb();
    return db.get<T>(sql, params);
  },
  
  run: async (sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> => {
    const db = await initializeDb();
    return db.run(sql, params);
  },
  
  exec: async (sql: string): Promise<void> => {
    const db = await initializeDb();
    return db.exec(sql);
  },
  
  close: async (): Promise<void> => {
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
    }
  }
};
