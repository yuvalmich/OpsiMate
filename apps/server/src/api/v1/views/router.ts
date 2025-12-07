/* eslint-disable @typescript-eslint/no-misused-promises */
import PromiseRouter from 'express-promise-router';
import { ViewController } from './controller';

export default function createViewRouter(controller: ViewController) {
	const router = PromiseRouter();

	// CRUD API
	router.get('/', controller.getViewsHandler);
	router.get('/:viewId', controller.getViewsByIdHandler);
	router.post('/', controller.createViewHandler);
	router.delete('/:viewId', controller.deleteViewHandler);

	return router;
}
