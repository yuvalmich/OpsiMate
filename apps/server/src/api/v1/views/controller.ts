import { Request, Response } from 'express';
import { ViewBL } from '../../../bl/custom-views/custom-view.bl';
import { CreateViewSchema, Logger, View } from '@OpsiMate/shared';
import { AuthenticatedRequest } from '../../../middleware/auth';
import { isZodError } from '../../../utils/isZodError.ts';

const logger = new Logger('api/v1/views/controller');

export class ViewController {
	constructor(private viewBL: ViewBL) {}

	getViewsHandler = async (req: Request, res: Response) => {
		try {
			const views = await this.viewBL.getAllViews();
			return res.json({ success: true, data: views });
		} catch (error) {
			logger.error('Error getting views:', error);
			return res.status(500).json({ success: false, error: 'Failed to get views' });
		}
	};

	getViewsByIdHandler = async (req: Request, res: Response) => {
		try {
			const viewId = req.params.viewId;
			const view = await this.viewBL.getViewById(viewId);

			if (!view) {
				return res.status(404).json({ success: false, error: 'View not found' });
			}

			return res.json({ success: true, data: view });
		} catch (error) {
			logger.error('Error getting view:', error);
			return res.status(500).json({ success: false, error: 'Failed to get view' });
		}
	};

	createViewHandler = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const user = req.user;

			if (!user) {
				return res.status(401).json({ success: false, error: 'Unauthorized: user not found' });
			}

			const createViewRequest = CreateViewSchema.parse(req.body);

			const createdViewId = await this.viewBL.createView(createViewRequest, user);

			return res.json({ success: true, data: { id: createdViewId } });
		} catch (error) {
			if (isZodError(error)) {
				return res.status(400).json({ success: false, error: 'Validation error', details: error.errors });
			}
			logger.error('Error saving view:', error);
			const message = error instanceof Error ? error.message : String(error);
			return res.status(500).json({
				success: false,
				error: message || 'Failed to save view',
			});
		}
	};

	deleteViewHandler = async (req: Request, res: Response) => {
		try {
			const viewId = req.params.viewId;
			const success = await this.viewBL.deleteView(viewId);

			if (!success) {
				return res.status(404).json({ success: false, error: 'View not found or could not be deleted' });
			}

			return res.json({ success: true, message: 'View deleted successfully' });
		} catch (error) {
			logger.error('Error deleting view:', error);
			const message = error instanceof Error ? error.message : String(error);
			return res.status(500).json({ success: false, error: message || 'Failed to delete view' });
		}
	};
}
