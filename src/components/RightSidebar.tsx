import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, X } from "lucide-react"
import { Service } from "./ServiceTable"

interface RightSidebarProps {
  service: Service | null
  onClose: () => void
}

export function RightSidebar({ service, onClose }: RightSidebarProps) {
  if (!service) return null

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="w-80 bg-card border-l border-border p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Service Details</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-foreground mb-3">{service.serviceName}</h4>
          <Badge className={getStatusColor(service.status)}>
            {service.status}
          </Badge>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Server ID:</span>
            <span className="text-foreground">{service.serverId}</span>
            
            <span className="text-muted-foreground">OS:</span>
            <span className="text-foreground">{service.os}</span>
            
            <span className="text-muted-foreground">IP Address:</span>
            <span className="text-foreground">{service.ipAddress}</span>
            
            {service.port && (
              <>
                <span className="text-muted-foreground">Port:</span>
                <span className="text-foreground">{service.port}</span>
              </>
            )}
            
            {service.uptime && (
              <>
                <span className="text-muted-foreground">Uptime:</span>
                <span className="text-foreground">{service.uptime}</span>
              </>
            )}
            
            {service.memory && (
              <>
                <span className="text-muted-foreground">Memory:</span>
                <span className="text-foreground">{service.memory}</span>
              </>
            )}
            
            {service.cpu && (
              <>
                <span className="text-muted-foreground">CPU:</span>
                <span className="text-foreground">{service.cpu}</span>
              </>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="font-medium text-foreground">External Links</h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <ExternalLink className="h-4 w-4" />
              View in Grafana
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <ExternalLink className="h-4 w-4" />
              View in Coralogix
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2">
              <ExternalLink className="h-4 w-4" />
              Server Monitoring
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}