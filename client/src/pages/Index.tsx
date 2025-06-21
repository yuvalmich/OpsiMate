import { useState, useMemo, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { ServiceTable, Service } from "@/components/ServiceTable"
import { RightSidebar } from "@/components/RightSidebar"
import { ActionButtons } from "@/components/ActionButtons"
import { TableSettingsModal } from "@/components/TableSettingsModal"
import { AddServiceModal } from "@/components/AddServiceModal"
import { FilterPanel, Filters } from "@/components/FilterPanel"
import { DashboardLayout } from "../components/DashboardLayout"
import type { ImperativePanelHandle as PanelRef } from "react-resizable-panels"

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    os: 'Ubuntu 22.04',
    serverId: 'srv-web-01',
    ipAddress: '192.168.1.100',
    serviceName: 'Nginx Web Server',
    status: 'running',
    port: 80,
    uptime: '15d 4h 32m',
    memory: '256MB',
    cpu: '12%'
  },
  {
    id: '2', 
    os: 'CentOS 7',
    serverId: 'srv-db-01',
    ipAddress: '192.168.1.101',
    serviceName: 'PostgreSQL Database',
    status: 'running',
    port: 5432,
    uptime: '32d 12h 15m',
    memory: '1.2GB',
    cpu: '5%'
  },
  {
    id: '3',
    os: 'Ubuntu 22.04',
    serverId: 'srv-api-01',
    ipAddress: '192.168.1.102',
    serviceName: 'Node.js API',
    status: 'error',
    port: 3000,
    uptime: '0m',
    memory: '0MB',
    cpu: '0%'
  },
  {
    id: '4',
    os: 'RHEL 8',
    serverId: 'srv-cache-01',
    ipAddress: '192.168.1.103',
    serviceName: 'Redis Cache',
    status: 'stopped',
    port: 6379,
    uptime: '0m',
    memory: '0MB',
    cpu: '0%'
  }
]

const Index = () => {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>(mockServices)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [showTableSettings, setShowTableSettings] = useState(false)
  const [showAddService, setShowAddService] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    os: true,
    serverId: true,
    serviceName: true,
    status: true,
    ipAddress: true,
    port: true,
    uptime: false,
    memory: false,
    cpu: false
  })
  const [filters, setFilters] = useState<Filters>({})
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)

  const filteredServices = useMemo(() => {
    const activeFilterKeys = Object.keys(filters).filter(key => filters[key].length > 0);
    if (activeFilterKeys.length === 0) {
      return services;
    }
    
    return services.filter(service => {
      return activeFilterKeys.every(key => {
        const filterValues = filters[key];
        const serviceValue = service[key as keyof Service];
        if (Array.isArray(filterValues) && filterValues.length > 0) {
          return filterValues.includes(String(serviceValue));
        }
        return true;
      });
    });
  }, [services, filters]);

  const toggleFilterPanel = () => {
    setFilterPanelCollapsed(!filterPanelCollapsed)
  }

  const handleShowServices = () => {
    toast({
      title: "Services Loaded",
      description: `Loaded ${services.length} services from your infrastructure.`
    })
  }

  const handleAddService = (serviceData: any) => {
    setServices(prev => [...prev, serviceData])
    toast({
      title: "Service Added",
      description: `${serviceData.serviceName} has been added successfully.`
    })
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
  }

  const handleServicesSelect = (services: Service[]) => {
    setSelectedServices(services)
    // If a single service is selected, also set it as the selectedService for the details panel
    if (services.length === 1) {
      setSelectedService(services[0])
    }
  }

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const handleStart = () => {
    if (selectedServices.length > 0) {
      toast({
        title: "Starting Services",
        description: `Starting ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`
      })
      // Here you would call your API to start the selected services
    }
  }

  const handleStop = () => {
    if (selectedServices.length > 0) {
      toast({
        title: "Stopping Services",
        description: `Stopping ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`
      })
      // Here you would call your API to stop the selected services
    }
  }

  const handleRestart = () => {
    if (selectedServices.length > 0) {
      toast({
        title: "Restarting Services",
        description: `Restarting ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`
      })
      // Here you would call your API to restart the selected services
    }
  }

  const handleOpenSSH = () => {
    if (selectedServices.length === 1) {
      toast({
        title: "Opening SSH Terminal",
        description: `Connecting to ${selectedServices[0].serverId}...`
      })
      // Here you would call your API to open SSH connection
    } else if (selectedServices.length > 1) {
      toast({
        title: "SSH Connection Error",
        description: "SSH can only be opened for a single service at a time",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <DashboardLayout>
        <div className="flex flex-col h-full">
          <div className="flex flex-row h-full">
            <div className="w-64 border-r border-border p-4">
              <FilterPanel
                services={services}
                filters={filters}
                onFilterChange={setFilters}
                collapsed={filterPanelCollapsed}
              />
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4">
                <ServiceTable
                  services={filteredServices}
                  selectedService={selectedService}
                  selectedServices={selectedServices}
                  onServiceSelect={handleServiceSelect}
                  onServicesSelect={handleServicesSelect}
                  onSettingsClick={() => setShowTableSettings(true)}
                  visibleColumns={visibleColumns}
                />
              </div>
              <div className="p-4 border-t border-border">
                <ActionButtons 
                  selectedService={selectedService}
                  selectedServices={selectedServices}
                  onStart={handleStart}
                  onStop={handleStop}
                  onRestart={handleRestart}
                  onOpenSSH={handleOpenSSH}
                />
              </div>
            </div>
            {selectedService && (
              <div className="w-80 border-l border-border">
                <RightSidebar
                  service={selectedService}
                  onClose={() => setSelectedService(null)}
                  collapsed={rightSidebarCollapsed}
                />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>

      <TableSettingsModal
        open={showTableSettings}
        onOpenChange={setShowTableSettings}
        visibleColumns={visibleColumns}
        onColumnToggle={handleColumnToggle}
      />

      <AddServiceModal
        open={showAddService}
        onOpenChange={setShowAddService}
        onAddService={handleAddService}
      />
    </div>
  )
}

export default Index