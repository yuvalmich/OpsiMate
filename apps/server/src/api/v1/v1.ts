import { Router } from 'express';
import providersRouter from './providers/router';
import servicesRouter from './services/router';
import viewsRouter from './views/router';
import Database from "better-sqlite3";


export default function createV1Router(db: Database.Database) {
    const router = Router();

    router.use('/providers', providersRouter);
    router.use('/services', servicesRouter);
    router.use('/views', viewsRouter);

    return router;
}
