import { db } from './providerRepository';
import {ServiceType} from "@service-peek/shared";

// Data access for services
export async function createService(data: any) {
  return new Promise<{ lastID: number }>((resolve, reject) => {
    db.run(
      'INSERT INTO services (provider_id, service_name, service_ip, service_status, service_type) VALUES (?, ?, ?, ?, ?)',
      [data.provider_id, data.service_name, data.service_ip, data.service_status, data.service_type],
      function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID });
      }
    );
  });
}

export async function getServicesByProviderId(providerId: number) {
  return new Promise<any[]>((resolve, reject) => {
    db.all('SELECT * FROM services WHERE provider_id = ? ORDER BY created_at DESC', [providerId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// todo: get service params instead of just names
export async function bulkCreateServices(providerId: number, serviceNames: string[], providerIp: string) {
  const storedServices = [];
  for (const serviceName of serviceNames) {
    const result = await createService({ provider_id: providerId, service_type: ServiceType.VM, service_name: serviceName, service_ip: providerIp });
    const service = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM services WHERE id = ?', [result.lastID], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    storedServices.push(service);
  }
  return storedServices;
}

export async function initServicesTable(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        provider_id INTEGER NOT NULL,
        service_name TEXT NOT NULL,
        service_ip TEXT,
        service_status TEXT DEFAULT 'unknown',
        service_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id)
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
} 