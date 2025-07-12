import request, { SuperTest, Test } from 'supertest';
import { Logger, Alert } from '@service-peek/shared';
import Database from 'better-sqlite3';
import { createApp } from '../src/app';
import {AlertRow} from "../src/dal/models";

const logger = new Logger('test-alerts');

let app: SuperTest<Test>;
let db: Database.Database;
let testAlerts: Alert[] = [];

const seedAlerts = () => {
  // Clear existing alerts
  db.exec('DELETE FROM alerts');

  // Create sample alerts for testing
  const sampleAlerts: Omit<AlertRow, 'created_at'>[] = [
    {
      id: 'alert-1',
      status: 'active',
      tag: 'system',
      starts_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      alert_url: 'https://example.com/alert/1',
      is_dismissed: false
    },
    {
      id: 'alert-2',
      status: 'warning',
      tag: 'security',
      starts_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updated_at: new Date().toISOString(),
      alert_url: 'https://example.com/alert/2',
      is_dismissed: false
    },
    {
      id: 'alert-3',
      status: 'critical',
      tag: 'database',
      starts_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      updated_at: new Date().toISOString(),
      alert_url: 'https://example.com/alert/3',
      is_dismissed: true
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO alerts (id, status, tag, starts_at, updated_at, alert_url, is_dismissed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  sampleAlerts.forEach(alert => {
    insertStmt.run(
        alert.id,
        alert.status,
        alert.tag,
        alert.starts_at,
        alert.updated_at,
        alert.alert_url,
        alert.is_dismissed ? 1 : 0
    );
  });

  testAlerts = sampleAlerts.map((row: Omit<AlertRow, 'created_at'>): Alert => {
    return {
      id: row.id,
      status: row.status,
      tag: row.tag,
      startsAt: row.starts_at,
      updatedAt: row.updated_at,
      alertUrl: row.alert_url,
      createdAt: (Date.now()).toString(),
      isDismissed: row.is_dismissed,
    }
  }) as Alert[];

  logger.info(`Seeded ${sampleAlerts.length} test alerts`);
};

beforeAll(async () => {
  db = new Database(':memory:');

  // Create the alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      status TEXT,
      tag TEXT,
      starts_at TEXT,
      updated_at TEXT,
      alert_url TEXT,
      is_dismissed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const expressApp = await createApp(db);
  app = request(expressApp) as unknown as SuperTest<Test>;
});

beforeEach(() => {
  seedAlerts();
});

afterAll(() => {
  db.close();
});

describe('Alerts API', () => {
  describe('GET /api/v1/alerts', () => {
    test('should fetch all alerts successfully', async () => {
      const response = await app.get('/api/v1/alerts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data?.alerts)).toBe(true);
      expect(response.body.data.alerts).toHaveLength(3);
    });

    test('should return correct alert structure', async () => {
      const response = await app.get('/api/v1/alerts');

      expect(response.status).toBe(200);
      const alerts = response.body.data?.alerts;

      expect(alerts[0]).toHaveProperty('id');
      expect(alerts[0]).toHaveProperty('status');
      expect(alerts[0]).toHaveProperty('tag');
      expect(alerts[0]).toHaveProperty('startsAt');
      expect(alerts[0]).toHaveProperty('updatedAt');
      expect(alerts[0]).toHaveProperty('alertUrl');
      expect(alerts[0]).toHaveProperty('isDismissed');
    });

    test('should return empty array when no alerts exist', async () => {
      // Clear all alerts
      db.exec('DELETE FROM alerts');

      const response = await app.get('/api/v1/alerts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data?.alerts).toHaveLength(0);
    });
  });

  describe('PATCH /api/v1/alerts/:id/dismiss', () => {
    test('should dismiss an active alert successfully', async () => {
      const alertId = testAlerts[0].id; // 'alert-1'

      const response = await app.patch(`/api/v1/alerts/${alertId}/dismiss`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data?.alert.isDismissed).toBe(true);
      expect(response.body.data?.alert.id).toBe(alertId);
    });

    test('should update the database when dismissing an alert', async () => {
      const alertId = testAlerts[0].id; // 'alert-1'

      // Verify initial state
      const beforeStmt = db.prepare('SELECT is_dismissed FROM alerts WHERE id = ?');
      const beforeResult = beforeStmt.get(alertId) as { is_dismissed: number };
      expect(beforeResult.is_dismissed).toBe(0);

      // Dismiss the alert
      await app.patch(`/api/v1/alerts/${alertId}/dismiss`);

      // Verify updated state
      const afterStmt = db.prepare('SELECT is_dismissed FROM alerts WHERE id = ?');
      const afterResult = afterStmt.get(alertId) as { is_dismissed: number };
      expect(afterResult.is_dismissed).toBe(1);
    });

    test('should handle dismissing an already dismissed alert', async () => {
      const alertId = testAlerts[2].id; // 'alert-3' (already dismissed)

      const response = await app.patch(`/api/v1/alerts/${alertId}/dismiss`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data?.alert.isDismissed).toBe(true);
    });

    test('should return 404 for non-existent alert', async () => {
      const response = await app.patch('/api/v1/alerts/nonexistent-id-123/dismiss');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge cases and error handling', () => {
    test('should handle malformed requests gracefully', async () => {
      const response = await app.get('/api/v1/alerts/invalid-endpoint');

      expect(response.status).toBe(404);
    });

    test('should handle database errors gracefully', async () => {
      // Close the database to simulate an error
      db.close();

      const response = await app.get('/api/v1/alerts');

      expect(response.status).toBeGreaterThanOrEqual(500);

      // Recreate database for cleanup
      db = new Database(':memory:');
      db.exec(`
        CREATE TABLE IF NOT EXISTS alerts (
          id TEXT PRIMARY KEY,
          status TEXT,
          tag TEXT,
          starts_at TEXT,
          updated_at TEXT,
          alert_url TEXT,
          is_dismissed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    });
  });
});