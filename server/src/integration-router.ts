import express from 'express';
import sqlite3 from 'sqlite3';
import { NodeSSH } from 'node-ssh';
import { z } from 'zod';

const router = express.Router();

// Database setup
const db = new sqlite3.Database('./service_peek.db');

// Initialize database tables
db.serialize(() => {
  // Providers table
  db.run(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_name TEXT NOT NULL,
      provider_ip TEXT NOT NULL,
      username TEXT NOT NULL,
      public_key TEXT NOT NULL,
      ssh_port INTEGER DEFAULT 22,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      service_ip TEXT,
      service_status TEXT DEFAULT 'unknown',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (provider_id) REFERENCES providers (id)
    )
  `);
});

// Validation schemas
const CreateProviderSchema = z.object({
  provider_name: z.string().min(1),
  provider_ip: z.string().ip(),
  username: z.string().min(1),
  public_key: z.string().min(1),
  ssh_port: z.number().int().min(1).max(65535).optional().default(22)
});

const BulkServiceSchema = z.object({
  service_names: z.array(z.string().min(1))
});

// Helper function to get provider by ID
const getProviderById = (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM providers WHERE id = ?', [id], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// POST /api/v1/integration/providers
router.post('/providers', async (req: express.Request, res: express.Response) => {
  try {
    // Validate input
    const validatedData = CreateProviderSchema.parse(req.body);
    
    // Insert provider into database
    const result = await new Promise<{ lastID: number }>((resolve, reject) => {
      db.run(
        'INSERT INTO providers (provider_name, provider_ip, username, public_key, ssh_port) VALUES (?, ?, ?, ?, ?)',
        [validatedData.provider_name, validatedData.provider_ip, validatedData.username, validatedData.public_key, validatedData.ssh_port],
        function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID });
        }
      );
    });

    // Get the created provider
    const provider = await new Promise<any>((resolve, reject) => {
      db.get('SELECT * FROM providers WHERE id = ?', [result.lastID], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.status(201).json({
      success: true,
      data: provider
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      console.error('Error creating provider:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// GET /api/v1/integration/providers/:providerId/instance
router.get('/providers/:providerId/instance', async (req: express.Request, res: express.Response) => {
  try {
    const providerId = parseInt(req.params.providerId);
    
    if (isNaN(providerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider ID'
      });
    }

    // Get provider details
    const provider = await getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    // Connect via SSH and get running services
    const ssh = new NodeSSH();

    // todo: fix private key
    try {
      await ssh.connect({
        host: provider.provider_ip,
        username: provider.username,
        privateKey: provider.public_key,
        port: provider.ssh_port,
      });

      // Get running services (this is a generic example - adjust based on your needs)
      const result = await ssh.execCommand('systemctl list-units --type=service --state=running --no-pager --no-legend');
      
      const services = result.stdout
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(/\s+/);
          return {
            service_name: parts[0],
            service_status: 'running',
            service_ip: provider.provider_ip
          };
        });

      res.json({
        success: true,
        data: {
          provider: provider,
          services: services
        }
      });
    } catch (sshError) {
      console.error('SSH connection error:', sshError);
      res.status(500).json({
        success: false,
        error: 'Failed to connect to provider via SSH',
        details: sshError instanceof Error ? sshError.message : 'Unknown SSH error'
      });
    } finally {
      ssh.dispose();
    }
  } catch (error) {
    console.error('Error getting provider instances:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/v1/integration/providers/:providerId/instance/bulk
router.post('/providers/:providerId/instance/bulk', async (req: express.Request, res: express.Response) => {
  try {
    const providerId = parseInt(req.params.providerId);
    
    if (isNaN(providerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider ID'
      });
    }

    // Validate input
    const validatedData = BulkServiceSchema.parse(req.body);

    // Check if provider exists
    const provider = await getProviderById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }

    // Store services in database
    const storedServices = [];
    
    for (const serviceName of validatedData.service_names) {
      const result = await new Promise<{ lastID: number }>((resolve, reject) => {
        db.run(
          'INSERT INTO services (provider_id, service_name, service_ip) VALUES (?, ?, ?)',
          [providerId, serviceName, provider.provider_ip],
          function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID });
          }
        );
      });

      // Get the created service
      const service = await new Promise<any>((resolve, reject) => {
        db.get('SELECT * FROM services WHERE id = ?', [result.lastID], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      storedServices.push(service);
    }

    res.status(201).json({
      success: true,
      data: storedServices
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      console.error('Error storing services:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
});

// Additional helper endpoints

// GET /api/v1/integration/providers
router.get('/providers', async (req: express.Request, res: express.Response) => {
  try {
    const providers = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM providers ORDER BY created_at DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error getting providers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/v1/integration/providers/:providerId/services
router.get('/providers/:providerId/services', async (req: express.Request, res: express.Response) => {
  try {
    const providerId = parseInt(req.params.providerId);
    
    if (isNaN(providerId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider ID'
      });
    }

    const services = await new Promise<any[]>((resolve, reject) => {
      db.all('SELECT * FROM services WHERE provider_id = ? ORDER BY created_at DESC', [providerId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error getting services:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
