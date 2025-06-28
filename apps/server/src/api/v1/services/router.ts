import {Router} from 'express';
import {
    createServiceHandler,
    getAllServicesHandler,
    getServiceLogsHandler,
    stopServiceHandler,
    startServiceHandler, getServiceByIdHandler, updateServiceHandler, deleteServiceHandler
} from "./controller";

const router = Router();

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

export default router;