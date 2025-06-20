import { Button } from "@/components/ui/button"
import { Server, Plus } from "lucide-react"

interface LeftSidebarProps {
  onShowServices: () => void
  onAddService: () => void
}

export function LeftSidebar({ onShowServices, onAddService }: LeftSidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border p-6 flex flex-col gap-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Service Manager</h2>
        <p className="text-sm text-muted-foreground">Manage your server services</p>
      </div>
      
      <div className="space-y-3">
        <Button 
          onClick={onShowServices}
          variant="default" 
          className="w-full justify-start gap-2"
        >
          <Server className="h-4 w-4" />
          Show My Services
        </Button>
        
        <Button 
          onClick={onAddService}
          variant="outline" 
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Service
        </Button>
      </div>
    </div>
  )
}