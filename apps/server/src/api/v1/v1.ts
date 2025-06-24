import { Router } from 'express';
import providersRouter from './providers/router';
import servicesRouter from './providers/router';

const router = Router();

router.get('/providers', providersRouter);
router.get('/services', servicesRouter);

export default router;