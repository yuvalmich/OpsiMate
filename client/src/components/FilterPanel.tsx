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
    <div className={cn("flex flex-col gap-4 pt-4 h-full overflow-y-auto", collapsed && "items-center")}>
        <div className={cn("flex justify-between items-center px-2", collapsed && "px-0")}>
            <h3 className={cn("text-md font-semibold text-foreground", collapsed && "sr-only")}>Filters</h3>
            {collapsed && <SlidersHorizontal className="h-6 w-6" />}
            <Button variant="ghost" size="sm" onClick={resetFilters} disabled={activeFilterCount === 0} className={cn(collapsed && "sr-only")}>
                Reset
            </Button>
        </div>
      <div className={cn(collapsed && "sr-only")}>
        <Accordion type="multiple" className="w-full" defaultValue={FACET_FIELDS.map(f => String(f))}>
          {FACET_FIELDS.map(field => (
            <AccordionItem value={String(field)} key={field}>
              <AccordionTrigger className="text-sm font-medium capitalize px-2">{field}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2">
                  {Object.entries(facets[field] || {}).sort(([a], [b]) => a.localeCompare(b)).map(([value, count]) => (
                    <div key={value} className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
                        <Checkbox
                          checked={(filters[field] || []).includes(value)}
                          onCheckedChange={() => handleCheckboxChange(field, value)}
                        />
                        {value}
                      </label>
                      <span className="text-xs text-muted-foreground">{count}</span>
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