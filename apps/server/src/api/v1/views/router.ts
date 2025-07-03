import PromiseRouter from 'express-promise-router';
import {
    createViewHandler,
    deleteViewHandler, getActiveViewHandler,
    getViewsByIdHandler,
    getViewsHandler,
    setActiveViewHandler
} from "./controller";

const router = PromiseRouter();

/**
 * Get all views
 */
router.get('/', getViewsHandler);

/**
 * Get a specific view by ID
 */
router.get('/:viewId', getViewsByIdHandler);

/**
 * Create or update a view
 */
router.post('/', createViewHandler);

/**
 * Delete a view
 */
router.delete('/:viewId', deleteViewHandler);

/**
 * Set active view
 */
router.post('/active/:viewId', setActiveViewHandler);

/**
 * Get active view ID
 */
router.get('/active', getActiveViewHandler);

export default router;
