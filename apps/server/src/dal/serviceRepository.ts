import { db } from './providerRepository';

// Data access for services
export async function createService(data: any) {
  return new Promise<{ lastID: number }>((resolve, reject) => {
    db.run(
      'INSERT INTO services (provider_id, service_name, service_ip) VALUES (?, ?, ?)',
      [data.provider_id, data.service_name, data.service_ip],
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

export async function bulkCreateServices(providerId: number, serviceNames: string[], providerIp: string) {
  const storedServices = [];
  for (const serviceName of serviceNames) {
    const result = await createService({ provider_id: providerId, service_name: serviceName, service_ip: providerIp });
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