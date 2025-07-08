import Database from 'better-sqlite3';
import path from 'path';
import { Logger } from '@service-peek/shared';

const logger = new Logger('dal/db');

export function initializeDb(): Database.Database {
  const dbPath = path.resolve(__dirname, '../../service_peek.db');
  logger.info(`SQLite database is connecting to ${dbPath}`);

  try {
    const db = new Database(dbPath);
    logger.info(`SQLite database connected at ${dbPath}`);
    
    return db;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

export function runAsync<T = unknown>(fn: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      const result = fn();
      resolve(result);
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}
