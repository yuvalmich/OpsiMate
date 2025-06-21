import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, AreaChart, FileText } from "lucide-react"
import { Service } from "./ServiceTable"
import { cn } from "@/lib/utils"
import { GrafanaIcon } from "./icons/GrafanaIcon"
import { CoralogixIcon } from "./icons/CoralogixIcon"

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
    <div className="w-full bg-card border-l border-border p-4 h-full text-xs flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Service Details</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex-grow overflow-auto pr-2 -mr-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-muted-foreground text-xs">Name</div>
            <h4 className="font-medium text-foreground text-base">{service.serviceName}</h4>
          </div>
          <Badge className={cn(getStatusColor(service.status), "text-xs py-0.5 px-2 flex-shrink-0")}>
            {service.status}
          </Badge>
        </div>

        <Separator />

        <div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div>
              <div className="text-muted-foreground">Server ID</div>
              <div className="font-medium text-foreground text-sm">{service.serverId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">OS</div>
              <div className="font-medium text-foreground text-sm">{service.os}</div>
            </div>
            <div>
              <div className="text-muted-foreground">IP Address</div>
              <div className="font-medium text-foreground font-mono text-sm">{service.ipAddress}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Port</div>
              <div className="font-medium text-foreground text-sm">{service.port || '-'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Uptime</div>
              <div className="font-medium text-foreground text-sm">{service.uptime || '-'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Memory</div>
              <div className="font-medium text-foreground text-sm">{service.memory || '-'}</div>
            </div>
            <div>
              <div className="text-muted-foreground">CPU</div>
              <div className="font-medium text-foreground text-sm">{service.cpu || '-'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex-shrink-0">
        <Separator />
        <div className="space-y-2 pt-4">
          <h4 className="font-medium text-foreground text-xs">External Links</h4>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start gap-2 h-7 text-xs px-2">
                <GrafanaIcon className="h-3 w-3" />
                View in Grafana
              </Button>
              <Button variant="outline" size="sm" className="justify-start gap-2 h-7 text-xs px-2">
                <CoralogixIcon className="h-3 w-3" />
                View in Coralogix
              </Button>
            </div>
            <Button variant="outline" size="sm" className="w-full justify-center gap-2 h-7 text-xs px-2">
              <AreaChart className="h-3 w-3" />
              Server Monitoring
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}