import express, { Router } from 'express';
import { ViewController } from './controller';

export default function createViewRouter(controller: ViewController): Router {
    const router = express.Router();

    /**
     * Get all views
     */
    router.get('/', controller.getViewsHandler);

    /**
     * Get a specific view by ID
     */
    router.get('/:viewId', controller.getViewsByIdHandler);

    /**
     * Create or update a view
     */
    router.post('/', controller.createViewHandler);

    /**
     * Delete a view
     */
    router.delete('/:viewId', controller.deleteViewHandler);

    /**
     * Set active view
     */
    router.post('/active/:viewId', controller.setActiveViewHandler);

    /**
     * Get active view ID
     */
    router.get('/active', controller.getActiveViewHandler);

    return router;
}
