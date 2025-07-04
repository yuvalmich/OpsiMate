import PromiseRouter from 'express-promise-router';
import {
    createServiceHandler,
    getAllServicesHandler,
    getServiceLogsHandler,
    stopServiceHandler,
    startServiceHandler, getServiceByIdHandler, updateServiceHandler, deleteServiceHandler
} from "./controller";
import { 
    addTagToServiceHandler, 
    removeTagFromServiceHandler, 
    getServiceTagsHandler 
} from '../tags/controller';

const router = PromiseRouter();

// POST /api/v1/integration/services
router.post('/', createServiceHandler);

// GET /api/v1/integration/services
router.get('/', getAllServicesHandler);

// GET /api/v1/integration/services/:serviceId
router.get('/:serviceId', getServiceByIdHandler);

// PUT /api/v1/integration/services/:serviceId
router.put('/:serviceId', updateServiceHandler);

// POST /api/v1/integration/services/:serviceId/start
router.post('/:serviceId/start', startServiceHandler);

// POST /api/v1/integration/services/:serviceId/stop
router.post('/:serviceId/stop', stopServiceHandler);

// POST /api/v1/integration/services/:serviceId/stop
router.get('/:serviceId/logs', getServiceLogsHandler);

// DELETE /api/v1/integration/services/:serviceId
router.delete('/:serviceId', deleteServiceHandler);

// Service tag association routes
router.post('/tags', addTagToServiceHandler);
router.delete('/tags', removeTagFromServiceHandler);
router.get('/:serviceId/tags', getServiceTagsHandler);

export default router;