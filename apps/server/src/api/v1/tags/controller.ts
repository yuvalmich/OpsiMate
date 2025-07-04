import { Request, Response } from 'express';
import { z } from 'zod';
import { CreateTagSchema, UpdateTagSchema, TagIdSchema, ServiceTagSchema } from '@service-peek/shared';
import * as tagRepo from '../../../dal/tagRepository';
import * as serviceRepo from '../../../dal/serviceRepository';

// Get all tags
export async function getAllTagsHandler(req: Request, res: Response) {
    try {
        const tags = await tagRepo.getAllTags();
        res.json({ success: true, data: tags });
    } catch (error) {
        console.error('Error getting all tags:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// Get a specific tag
export async function getTagByIdHandler(req: Request, res: Response) {
    try {
        const { tagId } = TagIdSchema.parse({ tagId: req.params.tagId });
        const tag = await tagRepo.getTagById(tagId);
        
        if (!tag) {
            return res.status(404).json({ success: false, error: 'Tag not found' });
        }
        
        res.json({ success: true, data: tag });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error getting tag by ID:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Create a new tag
export async function createTagHandler(req: Request, res: Response) {
    try {
        const tagData = CreateTagSchema.parse(req.body);
        const result = await tagRepo.createTag(tagData);
        const newTag = await tagRepo.getTagById(result.lastID);
        
        res.status(201).json({ success: true, data: newTag, message: 'Tag created successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error creating tag:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Update a tag
export async function updateTagHandler(req: Request, res: Response) {
    try {
        const { tagId } = TagIdSchema.parse({ tagId: req.params.tagId });
        const updateData = UpdateTagSchema.parse({ ...req.body, id: tagId });
        
        const existingTag = await tagRepo.getTagById(tagId);
        if (!existingTag) {
            return res.status(404).json({ success: false, error: 'Tag not found' });
        }
        
        await tagRepo.updateTag(tagId, updateData);
        const updatedTag = await tagRepo.getTagById(tagId);
        
        res.json({ success: true, data: updatedTag, message: 'Tag updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error updating tag:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Delete a tag
export async function deleteTagHandler(req: Request, res: Response) {
    try {
        const { tagId } = TagIdSchema.parse({ tagId: req.params.tagId });
        
        const existingTag = await tagRepo.getTagById(tagId);
        if (!existingTag) {
            return res.status(404).json({ success: false, error: 'Tag not found' });
        }
        
        await tagRepo.deleteTag(tagId);
        res.json({ success: true, message: 'Tag deleted successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error deleting tag:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Add tag to service
export async function addTagToServiceHandler(req: Request, res: Response) {
    try {
        const { serviceId, tagId } = ServiceTagSchema.parse(req.body);
        
        // Verify service exists
        const service = await serviceRepo.getServiceById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, error: 'Service not found' });
        }
        
        // Verify tag exists
        const tag = await tagRepo.getTagById(tagId);
        if (!tag) {
            return res.status(404).json({ success: false, error: 'Tag not found' });
        }
        
        await tagRepo.addTagToService(serviceId, tagId);
        res.json({ success: true, message: 'Tag added to service successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error adding tag to service:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Remove tag from service
export async function removeTagFromServiceHandler(req: Request, res: Response) {
    try {
        const { serviceId, tagId } = ServiceTagSchema.parse(req.body);
        
        await tagRepo.removeTagFromService(serviceId, tagId);
        res.json({ success: true, message: 'Tag removed from service successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error removing tag from service:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

// Get tags for a service
export async function getServiceTagsHandler(req: Request, res: Response) {
    try {
        const { serviceId } = z.object({
            serviceId: z.string().transform((val) => {
                const parsed = parseInt(val);
                if (isNaN(parsed)) {
                    throw new Error('Invalid service ID');
                }
                return parsed;
            })
        }).parse({ serviceId: req.params.serviceId });
        
        const tags = await tagRepo.getServiceTags(serviceId);
        res.json({ success: true, data: tags });
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
        } else {
            console.error('Error getting service tags:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
} 