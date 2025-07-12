import PromiseRouter from 'express-promise-router';
import { AlertController } from './controller';

export default function createAlertRouter(controller: AlertController) {
    const router = PromiseRouter();

    // GET all alerts
    router.get('/', controller.getAlerts.bind(controller));

    return router;
} 