import PromiseRouter from 'express-promise-router';
import {
    getAllTagsHandler,
    getTagByIdHandler,
    createTagHandler,
    updateTagHandler,
    deleteTagHandler,
} from './controller';

const router = PromiseRouter();

// Tag management routes
router.get('/', getAllTagsHandler);
router.post('/', createTagHandler);

// Parameterized tag routes (must come after specific routes)
router.get('/:tagId', getTagByIdHandler);
router.put('/:tagId', updateTagHandler);
router.delete('/:tagId', deleteTagHandler);

export default router; 