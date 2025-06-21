import { Button } from "@/components/ui/button"
import { Settings, Layers, LayoutDashboard, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

interface LeftSidebarProps {
  collapsed: boolean
}

export function LeftSidebar({ collapsed }: LeftSidebarProps) {
  const location = useLocation();
  return (
    <div className={cn("w-full bg-background flex flex-col h-full", collapsed && "items-center")}>
      <div className={cn("p-6", collapsed && "p-4")}>
        <h2 className={cn("text-xl font-bold text-foreground", collapsed && "sr-only")}>Service Peek</h2>
        {collapsed && <Settings className="h-6 w-6" />}
      </div>
      
      <div className={cn("px-4 space-y-2 w-full flex-grow", collapsed && "px-2")}>
        <Button 
          variant={location.pathname === "/" ? "secondary" : "ghost"}
          className={cn("w-full justify-start gap-3", collapsed && "justify-center")}
          asChild
        >
          <Link to="/">
            <LayoutDashboard className="h-5 w-5" />
            <span className={cn("font-medium", collapsed && "sr-only")}>Dashboard</span>
          </Link>
        </Button>
        
        <Button 
          variant={location.pathname === "/integrations" ? "secondary" : "ghost"}
          className={cn("w-full justify-start gap-3", collapsed && "justify-center")}
          asChild
        >
          <Link to="/integrations">
            <Layers className="h-5 w-5" />
            <span className={cn("font-medium", collapsed && "sr-only")}>Add Integration</span>
          </Link>
        </Button>
        
        <Button 
          variant={location.pathname === "/my-integrations" ? "secondary" : "ghost"}
          className={cn("w-full justify-start gap-3", collapsed && "justify-center")}
          asChild
        >
          <Link to="/my-integrations">
            <Database className="h-5 w-5" />
            <span className={cn("font-medium", collapsed && "sr-only")}>My Integrations</span>
          </Link>
        </Button>
      </div>
      
      <div className={cn("p-4 mt-auto text-xs text-muted-foreground", collapsed && "sr-only")}>
        <p>© 2024 Service Peek</p>
      </div>
    </div>
  )
}