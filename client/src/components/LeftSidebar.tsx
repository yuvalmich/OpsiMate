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
    <div className={cn("w-full bg-card border-r border-border flex flex-col overflow-hidden h-full", collapsed && "items-center")}>
      <div className={cn("p-4 border-b border-border", collapsed && "py-4 px-2")}>
        <h2 className={cn("text-lg font-semibold text-foreground", collapsed && "sr-only")}>Service Manager</h2>
        <p className={cn("text-sm text-muted-foreground mt-1", collapsed && "sr-only")}>Manage your server services</p>
        {collapsed && <Settings className="h-6 w-6" />}
      </div>
      
      <div className={cn("p-3 space-y-2 w-full flex-grow", collapsed && "px-2")}>
        <Button 
          onClick={onShowServices}
          variant="default" 
          className={cn("w-full justify-start gap-2 h-10", collapsed && "justify-center px-2")}
        >
          <Server className="h-5 w-5" />
          <span className={cn("font-medium", collapsed && "sr-only")}>Show My Services</span>
        </Button>
        
        <Button 
          onClick={onAddService}
          variant="outline" 
          className={cn("w-full justify-start gap-2 h-10", collapsed && "justify-center px-2")}
        >
          <Plus className="h-5 w-5" />
          <span className={cn("font-medium", collapsed && "sr-only")}>Add New Service</span>
        </Button>
      </div>
      
      <div className={cn("p-4 mt-auto border-t border-border text-xs text-muted-foreground", collapsed && "sr-only")}>
        <p>Service Peek Dashboard v1.0</p>
      </div>
    </div>
  )
}