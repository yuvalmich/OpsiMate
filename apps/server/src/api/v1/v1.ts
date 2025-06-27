import { Router } from 'express';
import providersRouter from './providers/router';
import servicesRouter from './services/router';
import viewsRouter from './views/router';

const router = Router();

router.use('/providers', providersRouter);
router.use('/services', servicesRouter);
router.use('/views', viewsRouter);

export default router;