import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
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
  selectedServices: Service[]
  onServicesSelect: (services: Service[]) => void
  onSettingsClick: () => void
  visibleColumns: Record<string, boolean>
  searchTerm?: string
  onSearchChange?: (searchTerm: string) => void
}

export function ServiceTable({ 
  services, 
  selectedServices,
  onServicesSelect,
  onSettingsClick,
  visibleColumns,
  searchTerm: externalSearchTerm,
  onSearchChange
}: ServiceTableProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("")
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm

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
    if (onSearchChange) {
      onSearchChange("");
    } else {
      setInternalSearchTerm("");
    }
  }

  const handleRowClick = (service: Service) => {
    onServicesSelect([service]);
  };

  return (
    <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border space-y-4 flex-shrink-0">
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
            className="h-9 w-9 rounded-md"
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Table Settings</span>
          </Button>
        </div>

        {/* Search filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => {
              const newValue = e.target.value;
              if (onSearchChange) {
                onSearchChange(newValue);
              } else {
                setInternalSearchTerm(newValue);
              }
            }}
            className="pl-10 pr-10 h-9"
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
      
      <div className="overflow-auto flex-grow relative">
        <Table className="relative">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox 
                  checked={filteredServices.length > 0 && selectedServices.length === filteredServices.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onServicesSelect(filteredServices);
                    } else {
                      onServicesSelect([]);
                    }
                  }}
                  aria-label="Select all services"
                />
              </TableHead>
              {visibleColumns.os && <TableHead className="font-medium">OS</TableHead>}
              {visibleColumns.serverId && <TableHead className="font-medium">Server ID</TableHead>}
              {visibleColumns.serviceName && <TableHead className="font-medium">Service Name</TableHead>}
              {visibleColumns.status && <TableHead className="font-medium">Status</TableHead>}
              {visibleColumns.ipAddress && <TableHead className="font-medium">IP Address</TableHead>}
              {visibleColumns.port && <TableHead className="font-medium">Port</TableHead>}
              {visibleColumns.uptime && <TableHead className="font-medium">Uptime</TableHead>}
              {visibleColumns.memory && <TableHead className="font-medium">Memory</TableHead>}
              {visibleColumns.cpu && <TableHead className="font-medium">CPU</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-12 h-[200px]">
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
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    selectedServices.some(s => s.id === service.id) && "bg-muted"
                  )}
                  onClick={() => handleRowClick(service)}
                >
                  <TableCell className="w-10" onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedServices.some(s => s.id === service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          onServicesSelect([...selectedServices, service]);
                        } else {
                          onServicesSelect(selectedServices.filter(s => s.id !== service.id));
                        }
                      }}
                      aria-label={`Select ${service.serviceName}`}
                    />
                  </TableCell>
                  {visibleColumns.os && <TableCell className="font-medium">{service.os}</TableCell>}
                  {visibleColumns.serverId && <TableCell>{service.serverId}</TableCell>}
                  {visibleColumns.serviceName && <TableCell>{service.serviceName}</TableCell>}
                  {visibleColumns.status && (
                    <TableCell className="text-center">
                      <Badge className={cn(getStatusColor(service.status), "font-medium")}>
                        {service.status}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.ipAddress && <TableCell className="font-mono text-xs">{service.ipAddress}</TableCell>}
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