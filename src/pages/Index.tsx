import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { LeftSidebar } from "@/components/LeftSidebar"
import { ServiceTable, Service } from "@/components/ServiceTable"
import { RightSidebar } from "@/components/RightSidebar"
import { ActionButtons } from "@/components/ActionButtons"
import { TableSettingsModal } from "@/components/TableSettingsModal"
import { AddServiceModal } from "@/components/AddServiceModal"

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
      <div className="flex h-screen">
        <LeftSidebar 
          onShowServices={handleShowServices}
          onAddService={() => setShowAddService(true)}
        />
        
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 p-6 overflow-hidden">
              <ServiceTable
                services={services}
                selectedService={selectedService}
                onServiceSelect={handleServiceSelect}
                onSettingsClick={() => setShowTableSettings(true)}
                visibleColumns={visibleColumns}
              />
            </div>
            
            {selectedService && (
              <RightSidebar 
                service={selectedService}
                onClose={() => setSelectedService(null)}
              />
            )}
          </div>
          
          <ActionButtons
            selectedService={selectedService}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
            onOpenSSH={handleOpenSSH}
          />
        </div>
      </div>

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