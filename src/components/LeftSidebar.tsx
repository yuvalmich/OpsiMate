import { Button } from "@/components/ui/button"
import { Server, Plus, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

interface LeftSidebarProps {
  onShowServices: () => void
  onAddService: () => void
  collapsed: boolean
}

export function LeftSidebar({ onShowServices, onAddService, collapsed }: LeftSidebarProps) {
  return (
    <div className={cn("w-full bg-card border-r border-border p-4 flex flex-col gap-4 overflow-hidden h-full", collapsed && "items-center px-2")}>
      <div className={cn("px-2", collapsed && "px-0")}>
        <h2 className={cn("text-lg font-semibold text-foreground", collapsed && "sr-only")}>Service Manager</h2>
        <p className={cn("text-sm text-muted-foreground", collapsed && "sr-only")}>Manage your server services</p>
        {collapsed && <Settings className="h-6 w-6" />}
      </div>
      
      <div className="space-y-3 w-full">
        <Button 
          onClick={onShowServices}
          variant="default" 
          className={cn("w-full justify-start gap-2", collapsed && "justify-center")}
        >
          <Server className="h-4 w-4" />
          <span className={cn(collapsed && "sr-only")}>Show My Services</span>
        </Button>
        
        <Button 
          onClick={onAddService}
          variant="outline" 
          className={cn("w-full justify-start gap-2", collapsed && "justify-center")}
        >
          <Plus className="h-4 w-4" />
          <span className={cn(collapsed && "sr-only")}>Add New Service</span>
        </Button>
      </div>
    </div>
  )
}