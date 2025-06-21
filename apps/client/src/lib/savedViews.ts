import { SavedView } from "@/types/SavedView";

const STORAGE_KEY = "service-peek-saved-views";

export function getSavedViews(): SavedView[] {
  try {
    const savedViewsJson = localStorage.getItem(STORAGE_KEY);
    if (!savedViewsJson) return [];
    return JSON.parse(savedViewsJson);
  } catch (error) {
    console.error("Failed to load saved views:", error);
    return [];
  }
}

export function saveView(view: SavedView): void {
  try {
    const savedViews = getSavedViews();
    const existingIndex = savedViews.findIndex((v) => v.id === view.id);
    
    if (existingIndex >= 0) {
      // Update existing view
      savedViews[existingIndex] = view;
    } else {
      // Add new view
      savedViews.push(view);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedViews));
  } catch (error) {
    console.error("Failed to save view:", error);
  }
}

export function deleteView(viewId: string): void {
  try {
    const savedViews = getSavedViews();
    const updatedViews = savedViews.filter((view) => view.id !== viewId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedViews));
  } catch (error) {
    console.error("Failed to delete view:", error);
  }
}

export function getActiveViewId(): string | undefined {
  try {
    return localStorage.getItem("service-peek-active-view-id") || undefined;
  } catch (error) {
    console.error("Failed to get active view ID:", error);
    return undefined;
  }
}

export function setActiveViewId(viewId: string | undefined): void {
  try {
    if (viewId) {
      localStorage.setItem("service-peek-active-view-id", viewId);
    } else {
      localStorage.removeItem("service-peek-active-view-id");
    }
  } catch (error) {
    console.error("Failed to set active view ID:", error);
  }
}
