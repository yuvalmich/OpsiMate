import { Router } from 'express';
import {
    getAllTagsHandler,
    getTagByIdHandler,
    createTagHandler,
    updateTagHandler,
    deleteTagHandler,
    addTagToServiceHandler,
    removeTagFromServiceHandler,
    getServiceTagsHandler
} from './controller';

const router = Router();

// Tag management routes
router.get('/', getAllTagsHandler);
router.post('/', createTagHandler);

// Service tag association routes (must come before parameterized routes)
router.post('/service', addTagToServiceHandler);
router.delete('/service', removeTagFromServiceHandler);
router.get('/service/:serviceId', getServiceTagsHandler);

// Parameterized tag routes (must come after specific routes)
router.get('/:tagId', getTagByIdHandler);
router.put('/:tagId', updateTagHandler);
router.delete('/:tagId', deleteTagHandler);

export default router; 