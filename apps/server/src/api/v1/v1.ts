import {Router} from 'express';
import providerRouter from './providers/router';
import serviceRouter from './services/router';
import viewRouter from './views/router';
import {ProviderController} from "./providers/controller";
import {ServiceController} from "./services/controller";
import {ViewController} from "./views/controller";


export default function createV1Router(providerController: ProviderController, serviceController: ServiceController, viewController: ViewController) {
    const router = Router();

    router.use('/providers', providerRouter(providerController));
    router.use('/services', serviceRouter(serviceController));
    router.use('/views', viewRouter(viewController));

    return router;
}
