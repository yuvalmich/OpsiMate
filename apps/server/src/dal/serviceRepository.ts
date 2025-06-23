import { db } from './providerRepository';
import { Service, ServiceType, ContainerDetails } from "@service-peek/shared";

// Data access for services
export async function createService(data: {
  provider_id: number;
  service_name: string;
  service_ip?: string;
  service_status?: string;
  service_type: ServiceType;
  container_details?: ContainerDetails;
}) {
  return new Promise<{ lastID: number }>((resolve, reject) => {
    // Convert container_details to JSON string if it exists
    const containerDetailsJson = data.container_details ? JSON.stringify(data.container_details) : null;
    
    db.run(
      'INSERT INTO services (provider_id, service_name, service_ip, service_status, service_type, container_details) VALUES (?, ?, ?, ?, ?, ?)',
      [data.provider_id, data.service_name, data.service_ip, data.service_status || 'unknown', data.service_type, containerDetailsJson],
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
    const result = await createService({ 
      provider_id: providerId, 
      service_type: ServiceType.SYSTEMD, 
      service_name: serviceName, 
      service_ip: providerIp 
    });
    const service = await getServiceById(result.lastID);
    storedServices.push(service);
  }
  return storedServices;
}

export async function getServiceById(id: number) {
  return new Promise<Service | null>((resolve, reject) => {
    db.get('SELECT * FROM services WHERE id = ?', [id], (err, row: any) => {
      if (err) reject(err);
      else {
        if (!row) {
          resolve(null);
          return;
        }
        
        // Parse container_details JSON if it exists
        if (row.container_details) {
          try {
            row.container_details = JSON.parse(row.container_details);
          } catch (e) {
            console.error('Error parsing container_details JSON:', e);
            row.container_details = null;
          }
        }
        
        resolve(row as Service);
      }
    });
  });
}

export async function updateService(id: number, data: Partial<Service>) {
  // First get the existing service to merge with updates
  const existingService = await getServiceById(id);
  if (!existingService) {
    throw new Error('Service not found');
  }
  
  // Prepare data for update
  const updateData = {
    ...data,
    container_details: data.container_details ? 
      JSON.stringify(data.container_details) : 
      existingService.container_details ? 
        JSON.stringify(existingService.container_details) : 
        null
  };
  
  return new Promise<void>((resolve, reject) => {
    // Build dynamic update query based on provided fields
    const fields = Object.keys(data).filter(key => key !== 'id' && key !== 'created_at');
    if (fields.length === 0) {
      resolve(); // Nothing to update
      return;
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => field === 'container_details' ? updateData.container_details : data[field as keyof typeof data]);
    
    db.run(
      `UPDATE services SET ${setClause} WHERE id = ?`,
      [...values, id],
      function (err) {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

export async function deleteService(id: number): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    db.run('DELETE FROM services WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function getServicesWithProvider(): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    const query = `
      SELECT s.*, p.* 
      FROM services s
      JOIN providers p ON s.provider_id = p.id
      ORDER BY s.created_at DESC
    `;
    
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else {
        // Transform the flat result into nested objects
        const services = rows.map((row: any) => {
          // Parse container_details if it exists
          let containerDetails = null;
          if (row.container_details) {
            try {
              containerDetails = JSON.parse(row.container_details);
            } catch (e) {
              console.error('Error parsing container_details JSON:', e);
            }
          }
          
          // Create the service object with provider nested
          return {
            id: row.id,
            provider_id: row.provider_id,
            service_name: row.service_name,
            service_ip: row.service_ip,
            service_status: row.service_status,
            service_type: row.service_type,
            created_at: row.created_at,
            container_details: containerDetails,
            provider: {
              id: row.provider_id,
              provider_name: row.provider_name,
              provider_ip: row.provider_ip,
              username: row.username,
              private_key_filename: row.private_key_filename,
              ssh_port: row.ssh_port,
              created_at: row.created_at,
              provider_type: row.provider_type
            }
          };
        });
        
        resolve(services);
      }
    });
  });
}

export async function getServiceWithProvider(id: number): Promise<any | null> {
  return new Promise<any | null>((resolve, reject) => {
    const query = `
      SELECT s.*, p.* 
      FROM services s
      JOIN providers p ON s.provider_id = p.id
      WHERE s.id = ?
    `;
    
    db.get(query, [id], (err, row: any) => {
      if (err) reject(err);
      else {
        if (!row) {
          resolve(null);
          return;
        }
        
        // Parse container_details if it exists
        let containerDetails = null;
        if (row.container_details) {
          try {
            containerDetails = JSON.parse(row.container_details);
          } catch (e) {
            console.error('Error parsing container_details JSON:', e);
          }
        }
        
        // Create the service object with provider nested
        const service = {
          id: row.id,
          provider_id: row.provider_id,
          service_name: row.service_name,
          service_ip: row.service_ip,
          service_status: row.service_status,
          service_type: row.service_type,
          created_at: row.created_at,
          container_details: containerDetails,
          provider: {
            id: row.provider_id,
            provider_name: row.provider_name,
            provider_ip: row.provider_ip,
            username: row.username,
            private_key_filename: row.private_key_filename,
            ssh_port: row.ssh_port,
            created_at: row.created_at,
            provider_type: row.provider_type
          }
        };
        
        resolve(service);
      }
    });
  });
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
        container_details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id)
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
} 