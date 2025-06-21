import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Service } from "./ServiceTable"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { SlidersHorizontal } from "lucide-react"

export type Filters = Record<string, string[]>

interface FilterPanelProps {
  services: Service[]
  filters: Filters
  onFilterChange: (filters: Filters) => void
  collapsed: boolean
}

const FACET_FIELDS: (keyof Service)[] = ['status', 'os', 'serverId'];

export function FilterPanel({ services, filters, onFilterChange, collapsed }: FilterPanelProps) {
  const facets = useMemo(() => {
    const newFacets: Record<string, Record<string, number>> = {};
    FACET_FIELDS.forEach(field => {
      newFacets[field] = {};
      services.forEach(service => {
        const value = service[field];
        if (value) {
          const stringValue = String(value);
          newFacets[field][stringValue] = (newFacets[field][stringValue] || 0) + 1;
        }
      });
    });
    return newFacets;
  }, [services]);

  const handleCheckboxChange = (field: string, value: string) => {
    const currentFilters = filters[field] || [];
    const newFilters = currentFilters.includes(value)
      ? currentFilters.filter(v => v !== value)
      : [...currentFilters, value];
    onFilterChange({
      ...filters,
      [field]: newFilters,
    });
  };

  const resetFilters = () => {
    onFilterChange({});
  };
  
  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <div className={cn("flex flex-col h-full overflow-y-auto", collapsed && "items-center")}>
        <div className={cn("flex justify-between items-center px-4 py-3 sticky top-0 bg-card z-10 border-b border-border", collapsed && "px-0 py-4 border-b-0")}>
            <h3 className={cn("text-md font-semibold text-foreground", collapsed && "sr-only")}>Filters</h3>
            {collapsed && <SlidersHorizontal className="h-6 w-6" />}
            <Button variant="outline" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0} className={cn(collapsed && "sr-only")}>
                Reset
            </Button>
        </div>
      <div className={cn("px-2 py-2", collapsed && "sr-only")}>
        <Accordion type="multiple" className="w-full" defaultValue={FACET_FIELDS.map(f => String(f))}>
          {FACET_FIELDS.map(field => (
            <AccordionItem value={String(field)} key={field} className="border-b border-border">
              <AccordionTrigger className="text-sm font-medium capitalize py-3 px-2 hover:bg-muted/50 rounded-md">{field}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2 py-1">
                  {Object.entries(facets[field] || {}).sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => (
                    <div key={value} className="flex items-center justify-between py-1">
                      <label className="flex items-center gap-2 text-sm font-normal cursor-pointer hover:text-foreground">
                        <Checkbox
                          checked={(filters[field] || []).includes(value)}
                          onCheckedChange={() => handleCheckboxChange(field, value)}
                        />
                        {value}
                      </label>
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
} 