import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Service {
  id: string
  os: string
  serverId: string
  ipAddress: string  
  serviceName: string
  status: 'running' | 'stopped' | 'error'
  port?: number
  uptime?: string
  memory?: string
  cpu?: string
}

interface ServiceTableProps {
  services: Service[]
  selectedService: Service | null
  onServiceSelect: (service: Service) => void
  onSettingsClick: () => void
  visibleColumns: Record<string, boolean>
}

export function ServiceTable({ 
  services, 
  selectedService, 
  onServiceSelect, 
  onSettingsClick,
  visibleColumns 
}: ServiceTableProps) {
  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="flex-1 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Services</h3>
          <p className="text-sm text-muted-foreground">{services.length} services found</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSettingsClick}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Table Settings
        </Button>
      </div>
      
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.os && <TableHead>OS</TableHead>}
              {visibleColumns.serverId && <TableHead>Server ID</TableHead>}
              {visibleColumns.serviceName && <TableHead>Service Name</TableHead>}
              {visibleColumns.status && <TableHead>Status</TableHead>}
              {visibleColumns.ipAddress && <TableHead>IP Address</TableHead>}
              {visibleColumns.port && <TableHead>Port</TableHead>}
              {visibleColumns.uptime && <TableHead>Uptime</TableHead>}
              {visibleColumns.memory && <TableHead>Memory</TableHead>}
              {visibleColumns.cpu && <TableHead>CPU</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow 
                key={service.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedService?.id === service.id && "bg-muted"
                )}
                onClick={() => onServiceSelect(service)}
              >
                {visibleColumns.os && <TableCell className="font-medium">{service.os}</TableCell>}
                {visibleColumns.serverId && <TableCell>{service.serverId}</TableCell>}
                {visibleColumns.serviceName && <TableCell>{service.serviceName}</TableCell>}
                {visibleColumns.status && (
                  <TableCell>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </TableCell>
                )}
                {visibleColumns.ipAddress && <TableCell>{service.ipAddress}</TableCell>}
                {visibleColumns.port && <TableCell>{service.port || '-'}</TableCell>}
                {visibleColumns.uptime && <TableCell>{service.uptime || '-'}</TableCell>}
                {visibleColumns.memory && <TableCell>{service.memory || '-'}</TableCell>}
                {visibleColumns.cpu && <TableCell>{service.cpu || '-'}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}