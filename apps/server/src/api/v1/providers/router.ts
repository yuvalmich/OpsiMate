import { Router } from 'express';
import * as integrationService from '../../../bl/integrationService';
import { getProviders, createProvider, updateProvider, deleteProvider, bulkAddServices, getProviderInstance } from './controller'

const router = Router();

// CRUD API

// GET /api/v1/integration/providers
router.get('/', getProviders);

// POST /api/v1/integration/providers
router.post('/', createProvider);

// PUT /api/v1/integration/providers/:providerId
router.put('/:providerId', updateProvider);

// DELETE /api/v1/integration/providers/:providerId
router.delete('/:providerId', deleteProvider);

// Additional APIs

// POST /api/v1/integration/providers/:providerId/instance/bulk
router.post('/:providerId/services/bulk', bulkAddServices);

// GET /api/v1/integration/providers/:providerId/instance
router.get('/:providerId/services', getProviderInstance);


export default router;