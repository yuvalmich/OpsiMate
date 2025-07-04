import Database from 'better-sqlite3';
import path from 'path';

export function initializeDb(): Database.Database {
  const dbPath = path.resolve(__dirname, '../../service_peek.db');
  console.log(`SQLite database is connecting to ${dbPath}`);

  try {
    const db = new Database(dbPath);
    console.log(`SQLite database connected at ${dbPath}`);
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export function runAsync<T = unknown>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const result = fn();
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
}
