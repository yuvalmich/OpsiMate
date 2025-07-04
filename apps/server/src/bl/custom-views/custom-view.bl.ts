import {SavedView, ViewRepository} from '../../dal/viewRepository';

export class ViewBL {
    constructor(private viewRepository: ViewRepository) {
    }

    /**
     * Get all views
     */
    async getAllViews(): Promise<SavedView[]> {
        return await this.viewRepository.getAllViews();
    }

    /**
     * Get a specific view by ID
     */
    async getViewById(id: string): Promise<SavedView | null> {
        return await this.viewRepository.getViewById(id);
    }

    /**
     * Create a new view or update an existing one
     */
    async saveView(view: SavedView): Promise<SavedView | null> {
        const existingView = await this.viewRepository.getViewById(view.id);

        if (existingView) {
            return await this.viewRepository.updateView(view);
        } else {
            return await this.viewRepository.createView(view);
        }
    }

    /**
     * Delete a view
     */
    async deleteView(id: string): Promise<boolean> {
        const view = await this.viewRepository.getViewById(id);
        if (view && view.isDefault) {
            return false;
        }

        const existingView = await this.viewRepository.getViewById(id);
        if (!existingView) {
            return false;
        }

        return await this.viewRepository.deleteView(id);
    }

    /**
     * Set active view ID
     */
    async setActiveViewId(viewId: string): Promise<boolean> {
        const view = await this.viewRepository.getViewById(viewId);

        if (!view) {
            throw new Error('View not found');
        }

        return await this.viewRepository.saveActiveViewId(viewId);
    }

    /**
     * Get active view ID
     */
    async getActiveViewId(): Promise<string | null> {
        return await this.viewRepository.getActiveViewId();
    }

    /**
     * Initialize the views tables
     */
    async initViewsTables(): Promise<void> {
        await this.viewRepository.initViewsTable();
    }
}
