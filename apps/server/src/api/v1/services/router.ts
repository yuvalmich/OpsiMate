import { Router } from 'express';
import {createService, deleteService, getAllServices, getServiceById, updateService, startService, stopService} from "./controller";

const router = Router();

// POST /api/v1/integration/services
router.post('/', createService);

// GET /api/v1/integration/services
router.get('/', getAllServices);

// GET /api/v1/integration/services/:serviceId
router.get('/:serviceId', getServiceById);

// PUT /api/v1/integration/services/:serviceId
router.put('/:serviceId', updateService);

// POST /api/v1/integration/services/:serviceId/start
router.post('/:serviceId/start', startService);

// POST /api/v1/integration/services/:serviceId/stop
router.post('/:serviceId/stop', stopService);

// DELETE /api/v1/integration/services/:serviceId
router.delete('/:serviceId', deleteService);

export default router;