import { Router } from 'express';
import providersRouter from './providers/router';
import servicesRouter from './providers/router';

const router = Router();

router.use('/providers', providersRouter);
router.use('/services', servicesRouter);

export default router;