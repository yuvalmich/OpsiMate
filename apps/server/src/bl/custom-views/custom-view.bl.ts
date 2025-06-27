import { viewRepository, SavedView } from '../../dal/viewRepository';

export const customViewService = {
    /**
     * Get all views
     */
    async getAllViews(): Promise<SavedView[]> {
        return await viewRepository.getAllViews();
    },

    /**
     * Get a specific view by ID
     */
    async getViewById(id: string): Promise<SavedView | null> {
        return await viewRepository.getViewById(id);
    },

    /**
     * Create a new view or update an existing one
     */
    async saveView(view: SavedView): Promise<SavedView | null> {
        // Check if view already exists
        const existingView = await viewRepository.getViewById(view.id);

        if (existingView) {
            return await viewRepository.updateView(view);
        } else {
            return await viewRepository.createView(view);
        }
    },

    /**
     * Delete a view
     */
    async deleteView(id: string): Promise<boolean> {
        // Get the view to check if it's the default view
        const view = await viewRepository.getViewById(id);
        if (view && view.isDefault) {
            // Don't allow deletion of default view
            return false;
        }

        // Check if view exists
        const existingView = await viewRepository.getViewById(id);

        if (!existingView) {
            return false;
        }

        return await viewRepository.deleteView(id);
    },

    /**
     * Set active view ID
     */
    async setActiveViewId(viewId: string): Promise<boolean> {
        // Verify the view exists
        const view = await viewRepository.getViewById(viewId);

        if (!view) {
            throw new Error('View not found');
        }

        return await viewRepository.saveActiveViewId(viewId);
    },

    /**
     * Get active view ID
     */
    async getActiveViewId(): Promise<string | null> {
        return await viewRepository.getActiveViewId();
    },

    /**
     * Initialize the views tables
     */
    async initViewsTables(): Promise<void> {
        await viewRepository.initViewsTable();
    }
};
