import express from 'express';
import * as integrationService from '../bl/integrationService';

const router = express.Router();

// POST /api/v1/integration/providers
router.post('/providers', integrationService.createProvider);

// GET /api/v1/integration/providers/:providerId/instance
router.get('/providers/:providerId/instance', integrationService.getProviderInstance);

// POST /api/v1/integration/providers/:providerId/instance/bulk
router.post('/providers/:providerId/instance/bulk', integrationService.bulkAddServices);

// GET /api/v1/integration/providers
router.get('/providers', integrationService.getProviders);

// GET /api/v1/integration/providers/:providerId/services
router.get('/providers/:providerId/services', integrationService.getProviderServices);

// DELETE /api/v1/integration/providers/:providerId
router.delete('/providers/:providerId', integrationService.deleteProvider);

// PUT /api/v1/integration/providers/:providerId
router.put('/providers/:providerId', integrationService.updateProvider);

export default router; 