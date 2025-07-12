import PromiseRouter from 'express-promise-router';
import providerRouter from './providers/router';
import serviceRouter from './services/router';
import viewRouter from './views/router';
import tagRouter from './tags/router';
import integrationRouter from './integrations/router';
import alertRouter from './alerts/router';
import {ProviderController} from "./providers/controller";
import {ServiceController} from "./services/controller";
import {ViewController} from "./views/controller";
import {TagController} from "./tags/controller";
import {IntegrationController} from "./integrations/controller";
import {AlertController} from "./alerts/controller";


export default function createV1Router(providerController: ProviderController,
                                       serviceController: ServiceController,
                                       viewController: ViewController,
                                       tagController: TagController,
                                       integrationController: IntegrationController,
                                       alertController: AlertController) {
    const router = PromiseRouter();

    router.use('/providers', providerRouter(providerController));
    router.use('/services', serviceRouter(serviceController, tagController));
    router.use('/views', viewRouter(viewController));
    router.use('/tags', tagRouter(tagController));
    router.use('/integrations', integrationRouter(integrationController));
    router.use('/alerts', alertRouter(alertController));

    return router;
}
