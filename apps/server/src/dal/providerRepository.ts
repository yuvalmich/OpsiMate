import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./service_peek.db');

// Data access for providers
export async function createProvider(data: any) {
  return new Promise<{ lastID: number }>((resolve, reject) => {
    db.run(
      'INSERT INTO providers (provider_name, provider_ip, username, private_key_filename, ssh_port) VALUES (?, ?, ?, ?, ?)',
      [data.provider_name, data.provider_ip, data.username, data.private_key_filename, data.ssh_port],
      function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      }
    );
  });
}

export async function getProviderById(id: number) {
  return new Promise<any>((resolve, reject) => {
    db.get('SELECT * FROM providers WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export async function getAllProviders() {
  return new Promise<any[]>((resolve, reject) => {
    db.all('SELECT * FROM providers ORDER BY created_at DESC', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export { db }; 