import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"

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
  const [searchTerm, setSearchTerm] = useState("")

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services
    
    const searchLower = searchTerm.toLowerCase()
    return services.filter(service => {
      return (
        service.os.toLowerCase().includes(searchLower) ||
        service.serverId.toLowerCase().includes(searchLower) ||
        service.serviceName.toLowerCase().includes(searchLower) ||
        service.status.toLowerCase().includes(searchLower) ||
        service.ipAddress.toLowerCase().includes(searchLower) ||
        (service.port && service.port.toString().includes(searchLower)) ||
        (service.uptime && service.uptime.toLowerCase().includes(searchLower)) ||
        (service.memory && service.memory.toLowerCase().includes(searchLower)) ||
        (service.cpu && service.cpu.toLowerCase().includes(searchLower))
      )
    })
  }, [services, searchTerm])

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="flex-1 bg-card border border-border rounded-lg">
      <div className="p-4 border-b border-border space-y-4">
        {/* Header with title and settings */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Services</h3>
            <p className="text-sm text-muted-foreground">
              {filteredServices.length} of {services.length} services found
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onSettingsClick}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Table Settings</span>
          </Button>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by OS, server ID, service name, status, IP, port, uptime, memory, or CPU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
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
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {searchTerm ? `No services found matching "${searchTerm}"` : "No services available"}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}