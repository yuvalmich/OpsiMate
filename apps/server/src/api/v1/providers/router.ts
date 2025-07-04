import {Router} from 'express';
import {
    getProvidersHandler,
    createProviderHandler,
    updateProviderHandler,
    deleteProviderHandler,
    bulkAddServicesHandler,
    discoverServicesInProviderHandler, testProviderConnectionHandler
} from './controller'

const router = Router();

// CRUD API

// GET /api/v1/integration/providers
router.get('/', getProvidersHandler);

// POST /api/v1/integration/providers
router.post('/', createProviderHandler);

// PUT /api/v1/integration/providers/:providerId
router.put('/:providerId', updateProviderHandler);

// DELETE /api/v1/integration/providers/:providerId
router.delete('/:providerId', deleteProviderHandler);

// Additional APIs

// POST /api/v1/integration/providers/:providerId/instance/bulk
router.post('/:providerId/services/bulk', bulkAddServicesHandler);

// GET /api/v1/integration/providers/:providerId/services/search
router.get('/:providerId/discover-services', discoverServicesInProviderHandler);

// POST /api/v1/integration/providers/test-connection
router.post('/test-connection', testProviderConnectionHandler);


export default router;