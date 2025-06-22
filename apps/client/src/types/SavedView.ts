import { Filters } from "@/components/FilterPanel";

export interface SavedView {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  filters: Filters;
  visibleColumns: Record<string, boolean>;
  searchTerm: string;
  isDefault?: number;
}
