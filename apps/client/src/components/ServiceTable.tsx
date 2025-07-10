import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Settings, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"
import { Tag } from "@service-peek/shared"

export interface Service {
  id: string
  name: string
  serviceIP?: string
  serviceStatus: 'running' | 'stopped' | 'error' | 'unknown'
  serviceType: 'MANUAL' | 'DOCKER' | 'SYSTEMD'
  createdAt: string
  provider: {
    id: number
    name: string
    providerIP: string
    username: string
    privateKeyFilename: string
    SSHPort: number
    createdAt: number
    providerType: string
  }
  containerDetails?: {
    id?: string
    image?: string
    created?: string
    namespace?: string
  }
  tags?: Tag[]
}

interface ServiceTableProps {
  services: Service[]
  selectedServices: Service[]
  onServicesSelect: (services: Service[]) => void
  onSettingsClick: () => void
  visibleColumns: Record<string, boolean>
  searchTerm?: string
  onSearchChange?: (searchTerm: string) => void
  loading?: boolean
}

export function ServiceTable({
  services,
  selectedServices,
  onServicesSelect,
  onSettingsClick,
  visibleColumns,
  searchTerm: externalSearchTerm,
  onSearchChange,
  loading
}: ServiceTableProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("")
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm

  const getStatusColor = (status: Service['serviceStatus']) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800 border-green-200'
      case 'stopped': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      case 'unknown': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!searchTerm.trim()) return services

    const searchLower = searchTerm.toLowerCase()
    return services.filter(service => {
      return (
        service.name.toLowerCase().includes(searchLower) ||
        service.serviceIP?.toLowerCase().includes(searchLower) ||
        service.serviceStatus.toLowerCase().includes(searchLower) ||
        service.provider.name.toLowerCase().includes(searchLower) ||
        service.provider.providerIP.toLowerCase().includes(searchLower) ||
        (service.containerDetails?.image && service.containerDetails.image.toLowerCase().includes(searchLower))
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

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Services</h3>
              <p className="text-sm text-muted-foreground">Loading...</p>
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
        </div>
        <div className="overflow-auto flex-grow relative">
          <Table className="relative">
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => {}}
                    aria-label="Select all services"
                  />
                </TableHead>
                11
                {visibleColumns.name && <TableHead className="font-medium">Name</TableHead>}
                {visibleColumns.serviceIP && <TableHead className="font-medium">Service IP</TableHead>}
                {visibleColumns.serviceStatus && <TableHead className="font-medium">Status</TableHead>}
                {visibleColumns.provider && <TableHead className="font-medium">Provider</TableHead>}
                {visibleColumns.containerDetails && <TableHead className="font-medium">Container Details</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={Object.values(visibleColumns).filter(Boolean).length + 1} className="text-center py-12 h-[200px]">
                  <div className="text-muted-foreground">
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

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
              {visibleColumns.name && <TableHead className="font-medium">Name</TableHead>}
              {visibleColumns.serviceIP && <TableHead className="font-medium">Service IP</TableHead>}
              {visibleColumns.serviceStatus && <TableHead className="font-medium">Status</TableHead>}
              {visibleColumns.provider && <TableHead className="font-medium">Provider</TableHead>}
              {visibleColumns.containerDetails && <TableHead className="font-medium">Container Details</TableHead>}
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
                      aria-label={`Select ${service.name}`}
                    />
                  </TableCell>
                  {visibleColumns.name && <TableCell className="font-medium">{service.name}</TableCell>}
                  {visibleColumns.serviceIP && <TableCell>
                    {service.serviceType === 'SYSTEMD' ? service.provider.providerIP : service.serviceIP || '-'}
                  </TableCell>}
                  {visibleColumns.serviceStatus && (
                    <TableCell className="text-center">
                      <Badge className={cn(getStatusColor(service.serviceStatus), "font-medium")}>
                        {service.serviceStatus}
                      </Badge>
                    </TableCell>
                  )}
                  {visibleColumns.provider && <TableCell>{service.provider.name}</TableCell>}
                  {visibleColumns.containerDetails && <TableCell>
                    {service.serviceType === 'DOCKER' ? (
                      service.containerDetails?.image || '-'
                    ) : service.serviceType === 'SYSTEMD' ? (
                      <span className="text-green-600 font-medium">Systemd Service</span>
                    ) : (
                      '-'
                    )}
                  </TableCell>}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}