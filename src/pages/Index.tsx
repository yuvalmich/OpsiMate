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

  const handleColumnToggle = (column: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }))
  }

  const handleStart = () => {
    if (selectedService) {
      toast({
        title: "Starting Service",
        description: `Starting ${selectedService.serviceName}...`
      })
    }
  }

  const handleStop = () => {
    if (selectedService) {
      toast({
        title: "Stopping Service", 
        description: `Stopping ${selectedService.serviceName}...`
      })
    }
  }

  const handleRestart = () => {
    if (selectedService) {
      toast({
        title: "Restarting Service",
        description: `Restarting ${selectedService.serviceName}...`
      })
    }
  }

  const handleOpenSSH = () => {
    if (selectedService) {
      toast({
        title: "Opening SSH Terminal",
        description: `Connecting to ${selectedService.serverId}...`
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <button
          className="p-2 rounded-md border border-border bg-background"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-semibold text-lg">Service Manager</span>
        <div />
      </div>

      {/* Mobile Sidebar (Overlay) */}
      <div className={
        `md:hidden ${mobileSidebarOpen ? 'block fixed inset-0 z-40 bg-black/40' : 'hidden'}`
      }>
        <div className={`fixed left-0 top-0 h-full z-50 bg-card w-64`}>
          <LeftSidebar
            onShowServices={handleShowServices}
            onAddService={() => setShowAddService(true)}
            collapsed={false}
          />
          <button
            className="absolute top-4 right-4 p-2 rounded-md border border-border bg-background"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <span className="text-xl">×</span>
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
          defaultSize={20}
          onCollapse={() => setFilterPanelCollapsed(true)}
          onExpand={() => setFilterPanelCollapsed(false)}
        >
          <FilterPanel
            services={services}
            filters={filters}
            onFilterChange={setFilters}
            collapsed={filterPanelCollapsed}
          />
        </ResizablePanel>
        <ResizableHandle withArrow onCollapse={toggleFilterPanel} collapsed={filterPanelCollapsed} />

        {/* Main content with Right Sidebar */}
        <ResizablePanel defaultSize={65}>
            <div className="flex flex-1 h-full">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 p-2 sm:p-4 md:p-6 overflow-auto">
                        <ServiceTable
                            services={filteredServices}
                            selectedService={selectedService}
                            onServiceSelect={handleServiceSelect}
                            onSettingsClick={() => setShowTableSettings(true)}
                            visibleColumns={visibleColumns}
                        />
                    </div>
                     <ActionButtons
                        selectedService={selectedService}
                        onStart={handleStart}
                        onStop={handleStop}
                        onRestart={handleRestart}
                        onOpenSSH={handleOpenSSH}
                    />
                </div>

                {selectedService && (
                <>
                    <Separator orientation="vertical" />
                    <ResizablePanel
                        ref={rightSidebarRef}
                        collapsible
                        collapsedSize={4}
                        minSize={15}
                        defaultSize={25}
                        onCollapse={() => setRightSidebarCollapsed(true)}
                        onExpand={() => setRightSidebarCollapsed(false)}
                        className="h-full"
                        >
                        <RightSidebar
                            service={selectedService}
                            onClose={() => setSelectedService(null)}
                            collapsed={rightSidebarCollapsed}
                        />
                    </ResizablePanel>
                </>
                )}
            </div>
        </ResizablePanel>
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