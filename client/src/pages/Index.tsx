import { useState, useMemo, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { LeftSidebar } from "@/components/LeftSidebar"
import { ServiceTable, Service } from "@/components/ServiceTable"
import { RightSidebar } from "@/components/RightSidebar"
import { ActionButtons } from "@/components/ActionButtons"
import { TableSettingsModal } from "@/components/TableSettingsModal"
import { AddServiceModal } from "@/components/AddServiceModal"
import { Menu } from "lucide-react"
import { FilterPanel, Filters } from "@/components/FilterPanel"
import { Separator } from "@/components/ui/separator"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Filters>({})
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false)
  const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)

  const leftSidebarRef = useRef<PanelRef>(null)
  const filterPanelRef = useRef<PanelRef>(null)
  const rightSidebarRef = useRef<PanelRef>(null)

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

  const toggleLeftSidebar = () => {
    const panel = leftSidebarRef.current
    if (panel) {
      panel.isCollapsed() ? panel.expand() : panel.collapse()
    }
  }

  const toggleFilterPanel = () => {
    const panel = filterPanelRef.current
    if (panel) {
      panel.isCollapsed() ? panel.expand() : panel.collapse()
    }
  }

  const toggleRightSidebar = () => {
    const panel = rightSidebarRef.current
    if (panel) {
      panel.isCollapsed() ? panel.expand() : panel.collapse()
    }
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
    <div className="min-h-screen bg-background">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card shadow-sm">
        <button
          className="p-2 rounded-md border border-border bg-background hover:bg-muted transition-colors"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-lg">Service Peek Dashboard</span>
        <div className="w-9" /> {/* Empty div for balance */}
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${mobileSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileSidebarOpen(false)}
      >
        <div 
          className={`fixed left-0 top-0 h-full z-50 bg-card w-72 shadow-xl transition-transform duration-200 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={e => e.stopPropagation()}
        >
          <LeftSidebar
            onShowServices={handleShowServices}
            onAddService={() => setShowAddService(true)}
            collapsed={false}
          />
          <button
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-muted transition-colors"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="text-xl font-medium">×</span>
          </button>
        </div>
      </div>

      {/* Desktop Layout (Resizable) */}
      <ResizablePanelGroup direction="horizontal" className="hidden md:flex h-screen w-full">
        {/* Left Action Sidebar */}
        <ResizablePanel
          ref={leftSidebarRef}
          collapsible
          collapsedSize={4}
          minSize={15}
          defaultSize={15}
          onCollapse={() => setLeftSidebarCollapsed(true)}
          onExpand={() => setLeftSidebarCollapsed(false)}
          className="p-0"
        >
          <LeftSidebar
            onShowServices={handleShowServices}
            onAddService={() => setShowAddService(true)}
            collapsed={leftSidebarCollapsed}
          />
        </ResizablePanel>
        <ResizableHandle withArrow onCollapse={toggleLeftSidebar} collapsed={leftSidebarCollapsed} />

        {/* Filter Panel */}
        <ResizablePanel
          ref={filterPanelRef}
          collapsible
          collapsedSize={4}
          minSize={15}
          defaultSize={15}
          onCollapse={() => setFilterPanelCollapsed(true)}
          onExpand={() => setFilterPanelCollapsed(false)}
          className="p-0"
        >
          <FilterPanel
            services={services}
            filters={filters}
            onFilterChange={setFilters}
            collapsed={filterPanelCollapsed}
          />
        </ResizablePanel>
        <ResizableHandle withArrow onCollapse={toggleFilterPanel} collapsed={filterPanelCollapsed} />

        {/* Main content */}
        <ResizablePanel defaultSize={65} className="flex flex-col overflow-hidden">
            <div className="flex-1 p-3 overflow-hidden">
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
            <ActionButtons
                selectedService={selectedService}
                selectedServices={selectedServices}
                onStart={handleStart}
                onStop={handleStop}
                onRestart={handleRestart}
                onOpenSSH={handleOpenSSH}
            />
        </ResizablePanel>
        
        {/* Right Sidebar - Only shown when a service is selected */}
        {selectedService && (
            <ResizablePanel
                ref={rightSidebarRef}
                collapsible
                collapsedSize={4}
                minSize={10}
                maxSize={15}
                defaultSize={12}
                onCollapse={() => setRightSidebarCollapsed(true)}
                onExpand={() => setRightSidebarCollapsed(false)}
                className="p-0"
            >
                <RightSidebar
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                    collapsed={rightSidebarCollapsed}
                />
            </ResizablePanel>
        )}
      </ResizablePanelGroup>

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