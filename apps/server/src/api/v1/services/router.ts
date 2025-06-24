import { Router } from 'express';
import {createService, deleteService, getAllServices, getServiceById, updateService} from "./controller";

const router = Router();

// POST /api/v1/integration/services
router.post('/', createService);

// GET /api/v1/integration/services
router.get('/', getAllServices);

// GET /api/v1/integration/services/:serviceId
router.get('/:serviceId', getServiceById);

// PUT /api/v1/integration/services/:serviceId
router.put('/:serviceId', updateService);

// DELETE /api/v1/integration/services/:serviceId
router.delete('/:serviceId', deleteService);

export default router;