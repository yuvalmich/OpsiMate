import express from 'express';
import { viewService } from '../bl/viewService';

const router = express.Router();

/**
 * Get all views
 */
router.get('/views', async (req, res) => {
  try {
    const views = await viewService.getAllViews();
    
    res.json({
      success: true,
      data: views
    });
  } catch (error: any) {
    console.error('Error getting views:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get views'
    });
  }
});

/**
 * Get a specific view by ID
 */
router.get('/views/:viewId', async (req, res) => {
  try {
    const viewId = req.params.viewId;
    
    const view = await viewService.getViewById(viewId);
    
    if (!view) {
      return res.status(404).json({
        success: false,
        error: 'View not found'
      });
    }
    
    res.json({
      success: true,
      data: view
    });
  } catch (error: any) {
    console.error('Error getting view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get view'
    });
  }
});

/**
 * Create or update a view
 */
router.post('/views', async (req, res) => {
  try {
    const view = req.body;
    
    if (!view || !view.id || !view.name) {
      return res.status(400).json({
        success: false,
        error: 'Invalid view data'
      });
    }
    const savedView = await viewService.saveView(view);
    
    if (!savedView) {
      return res.status(500).json({
        success: false,
        error: 'Failed to save view'
      });
    }
    
    res.json({
      success: true,
      data: savedView
    });
  } catch (error: any) {
    console.error('Error saving view:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save view'
    });
  }
});

/**
 * Delete a view
 */
router.delete('/views/:viewId', async (req, res) => {
  try {
    const viewId = req.params.viewId;
    
    const success = await viewService.deleteView(viewId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'View not found or could not be deleted'
      });
    }
    
    res.json({
      success: true,
      message: 'View deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting view:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete view'
    });
  }
});

/**
 * Set active view
 */
router.post('/views/active/:viewId', async (req, res) => {
  try {
    const viewId = req.params.viewId;
    
    const success = await viewService.setActiveViewId(viewId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'View not found or could not be set as active'
      });
    }
    
    res.json({
      success: true,
      message: 'Active view set successfully'
    });
  } catch (error: any) {
    console.error('Error setting active view:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to set active view'
    });
  }
});

/**
 * Get active view ID
 */
router.get('/views/active', async (req, res) => {
  try {
    const activeViewId = await viewService.getActiveViewId();
    
    res.json({
      success: true,
      data: { activeViewId }
    });
  } catch (error: any) {
    console.error('Error getting active view ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active view ID'
    });
  }
});

export default router;
