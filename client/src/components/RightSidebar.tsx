import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, X, FileText } from "lucide-react"
import { Service } from "./ServiceTable"
import { cn } from "@/lib/utils"

interface RightSidebarProps {
  service: Service | null
  onClose: () => void
  collapsed: boolean
}

export function RightSidebar({ service, onClose, collapsed }: RightSidebarProps) {
  if (!service) return null

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (collapsed) {
    return (
      <div className="w-full bg-card border-l border-border p-4 flex flex-col items-center gap-4 overflow-hidden h-full">
        <FileText className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="w-full bg-card border-l border-border p-2 overflow-auto h-full text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Service Details</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <div>
          <h4 className="font-medium text-foreground mb-1 text-xs">{service.serviceName}</h4>
          <Badge className={cn(getStatusColor(service.status), "text-xs py-0 px-1.5")}>
            {service.status}
          </Badge>
        </div>

        <Separator className="my-1" />

        <div>
          <div className="grid grid-cols-[70px_1fr] gap-y-1 text-xs">
            <span className="text-muted-foreground">Server ID:</span>
            <span className="text-foreground font-medium">{service.serverId}</span>
            
            <span className="text-muted-foreground">OS:</span>
            <span className="text-foreground font-medium">{service.os}</span>
            
            <span className="text-muted-foreground">IP:</span>
            <span className="text-foreground font-medium">{service.ipAddress}</span>
            
            {service.port && (
              <>
                <span className="text-muted-foreground">Port:</span>
                <span className="text-foreground font-medium">{service.port}</span>
              </>
            )}
            
            {service.uptime && (
              <>
                <span className="text-muted-foreground">Uptime:</span>
                <span className="text-foreground font-medium">{service.uptime}</span>
              </>
            )}
            
            {service.memory && (
              <>
                <span className="text-muted-foreground">Memory:</span>
                <span className="text-foreground font-medium">{service.memory}</span>
              </>
            )}
            
            {service.cpu && (
              <>
                <span className="text-muted-foreground">CPU:</span>
                <span className="text-foreground font-medium">{service.cpu}</span>
              </>
            )}
          </div>
        </div>

        <Separator className="my-1" />

        <div className="space-y-1">
          <h4 className="font-medium text-foreground text-xs">External Links</h4>
          <div className="space-y-1">
            <Button variant="outline" size="sm" className="w-full justify-start gap-1 h-7 text-xs px-2">
              <ExternalLink className="h-3 w-3" />
              View in Grafana
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-1 h-7 text-xs px-2">
              <ExternalLink className="h-3 w-3" />
              View in Coralogix
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-1 h-7 text-xs px-2">
              <ExternalLink className="h-3 w-3" />
              Server Monitoring
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}