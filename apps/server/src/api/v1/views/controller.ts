import {Request, Response} from "express";
import {customViewService} from "../../../bl/custom-views/custom-view.bl";

export async function getViewsHandler(req: Request, res: Response) {
    try {
        const views = await customViewService.getAllViews();

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
}

export async function getViewsByIdHandler(req: Request, res: Response) {
    try {
        const viewId = req.params.viewId;

        const view = await customViewService.getViewById(viewId);

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
}

export async function createViewHandler(req: Request, res: Response) {
    try {
        const view = req.body;

        if (!view || !view.id || !view.name) {
            return res.status(400).json({
                success: false,
                error: 'Invalid view data'
            });
        }
        const savedView = await customViewService.saveView(view);

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
}

export async function deleteViewHandler(req: Request, res: Response) {
    try {
        const viewId = req.params.viewId;

        const success = await customViewService.deleteView(viewId);

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
}

export async function setActiveViewHandler(req: Request, res: Response) {
    try {
        const viewId = req.params.viewId;

        const success = await customViewService.setActiveViewId(viewId);

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
}

export async function getActiveViewHandler(req: Request, res: Response) {
    try {
        const activeViewId = await customViewService.getActiveViewId();

        res.json({
            success: true,
            data: {activeViewId}
        });
    } catch (error: any) {
        console.error('Error getting active view ID:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get active view ID'
        });
    }
}
