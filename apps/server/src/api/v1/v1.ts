import PromiseRouter from 'express-promise-router';
import providersRouter from './providers/router';
import servicesRouter from './services/router';
import viewsRouter from './views/router';
import tagsRouter from './tags/router';

const router = PromiseRouter();

router.use('/providers', providersRouter);
router.use('/services', servicesRouter);
router.use('/views', viewsRouter);
router.use('/tags', tagsRouter);

export default router;