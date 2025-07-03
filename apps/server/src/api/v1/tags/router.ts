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
router.get('/:tagId', getTagByIdHandler);
router.post('/', createTagHandler);
router.put('/:tagId', updateTagHandler);
router.delete('/:tagId', deleteTagHandler);

// Service tag association routes
router.post('/service', addTagToServiceHandler);
router.delete('/service', removeTagFromServiceHandler);
router.get('/service/:serviceId', getServiceTagsHandler);

export default router; 