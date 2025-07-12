import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { ServiceTable, Service } from "@/components/ServiceTable"
import { RightSidebarWithLogs as RightSidebar } from "@/components/RightSidebarWithLogs"
import { ActionButtons } from "@/components/ActionButtons"
import { TableSettingsModal } from "@/components/TableSettingsModal"
import { AddServiceModal } from "@/components/AddServiceModal"
import { FilterPanel, Filters } from "@/components/FilterPanel"
import { SavedViewsManager } from "@/components/SavedViewsManager"
import { DashboardLayout } from "../components/DashboardLayout"
import { SavedView } from "@/types/SavedView"
import { getSavedViews, saveView, deleteView, getActiveViewId, setActiveViewId } from "@/lib/savedViews"
import { providerApi, alertsApi } from "@/lib/api"
import { Alert } from "@service-peek/shared"


const Index = () => {
    const {toast} = useToast()
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [selectedServices, setSelectedServices] = useState<Service[]>([])
    const [showTableSettings, setShowTableSettings] = useState(false)
    const [showAddService, setShowAddService] = useState(false)
    const [visibleColumns, setVisibleColumns] = useState({
        name: true,
        serviceIP: true,
        serviceStatus: true,
        provider: true,
        containerDetails: false,
        alerts: true
    })
    const [filters, setFilters] = useState<Filters>({})
    const [filterPanelCollapsed, setFilterPanelCollapsed] = useState(false)
    const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [savedViews, setSavedViews] = useState<SavedView[]>([])
    const [activeViewId, setActiveViewId] = useState<string | undefined>()
    const [alerts, setAlerts] = useState<Alert[]>([])

    // Fetch services from API
    const fetchServices = useCallback(async () => {
        try {
            setLoading(true)
            const response = await providerApi.getAllServices()

            if (response.success && response.data) {
                const transformedServices: Service[] = response.data.map((service: any) => ({
                        id: service.id.toString(),
                        name: service.name,
                        serviceIP: service.serviceIP,
                        serviceStatus: service.serviceStatus,
                        serviceType: service.serviceType,
                        createdAt: service.createdAt,
                        provider: service.provider,
                        containerDetails: service.containerDetails,
                        tags: service.tags || [] // Include tags from backend
                    }
                ))

                setServices(transformedServices)
            } else {
                toast({
                    title: "Error loading services",
                    description: response.error || "Failed to load services",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error("Error fetching services:", error)
            toast({
                title: "Error loading services",
                description: "An unexpected error occurred",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch alerts from API with enhanced tag-based logic
    const fetchAlerts = useCallback(async () => {
        try {
            const response = await alertsApi.getAllAlerts()
            if (response.success && response.data) {
                setAlerts(response.data.alerts)
            } else {
                console.error('Error fetching alerts:', response.error)
            }
        } catch (error) {
            console.error('Error fetching alerts:', error)
        }
    }, [])

    // Enhanced alert calculation: each service gets alerts for ALL its tags
    const servicesWithAlerts = useMemo(() => {
        console.log('🔍 Debug - Services:', services.length, 'Alerts:', alerts.length)
        return services.map(service => {
            console.log(`🏷️  Service ${service.name} tags:`, service.tags?.map(t => t.name) || [])
            
            // Get all unique alerts that match any of the service's tags (including dismissed)
            const serviceAlerts = alerts.filter(alert => {
                console.log(`🚨 Checking alert ${alert.id} (tag: ${alert.tag}) against service ${service.name}`)
                
                // Check if alert tag matches any of the service's tags
                const matches = service.tags?.some(tag => tag.name === alert.tag)
                console.log(`   Match result: ${matches}`)
                return matches
            })
            
            // Remove duplicates (in case an alert matches multiple tags of the same service)
            const uniqueAlerts = serviceAlerts.filter((alert, index, self) => 
                index === self.findIndex(a => a.id === alert.id)
            )
            
            // Count only non-dismissed alerts for the badge count
            const activeAlerts = uniqueAlerts.filter(alert => !alert.isDismissed);
            
            console.log(`✅ Service ${service.name} final result: ${activeAlerts.length} active, ${uniqueAlerts.length - activeAlerts.length} dismissed`)
            
            return {
                ...service,
                alertsCount: activeAlerts.length, // Only count non-dismissed alerts
                serviceAlerts: uniqueAlerts // Store ALL alerts for sidebar display (including dismissed)
            }
        })
    }, [services, alerts])

    // Load services on component mount and set up periodic refresh
    useEffect(() => {
        fetchServices()
        fetchAlerts()
        
        // Set up automatic refresh every 30 seconds (30000 ms)
        const refreshInterval = setInterval(() => {
            console.log('Auto-refreshing services and alerts data...')
            fetchServices()
            fetchAlerts()
        }, 30000)
        
        // Clean up interval on component unmount
        return () => clearInterval(refreshInterval)
    }, [fetchServices, fetchAlerts])

    // Load saved views and active view on component mount
    useEffect(() => {
        const loadViews = async () => {
            try {
                // Load saved views from API
                const views = await getSavedViews();
                setSavedViews(views);

                // Get active view ID from API
                const activeId = await getActiveViewId();
                if (activeId) {
                    const activeView = views.find(view => view.id === activeId);
                    if (activeView) {
                        setActiveViewId(activeId);
                        applyView(activeView);
                    } else if (activeId === 'default-view') {
                        // If the active view is 'default-view' but it doesn't exist, create a default state
                        setActiveViewId('default-view');
                        // Apply default filters and settings
                        setFilters({});
                        setSearchTerm('');
                        setVisibleColumns({
                            name: true,
                            serviceIP: true,
                            serviceStatus: true,
                            provider: true,
                            containerDetails: true,
                            alerts: true
                        });
                    } else {
                        // If the active view ID doesn't exist, fall back to the first available view or default
                        const firstView = views[0];
                        if (firstView) {
                            setActiveViewId(firstView.id);
                            applyView(firstView);
                        } else {
                            setActiveViewId('default-view');
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading saved views:', error);
                toast({
                    title: "Error",
                    description: "Failed to load saved views",
                    variant: "destructive"
                });
            }
        };

        loadViews();
    }, []);

    const filteredServices = useMemo(() => {
        const activeFilterKeys = Object.keys(filters).filter(key => filters[key].length > 0);
        if (activeFilterKeys.length === 0) {
            return servicesWithAlerts;
        }

        return servicesWithAlerts.filter(service => {
            return activeFilterKeys.every(key => {
                const filterValues = filters[key];
                const serviceValue = service[key as keyof Service];
                if (Array.isArray(filterValues) && filterValues.length > 0) {
                    return filterValues.includes(String(serviceValue));
                }
                return true;
            });
        });
    }, [servicesWithAlerts, filters]);

    const toggleFilterPanel = () => {
        setFilterPanelCollapsed(!filterPanelCollapsed)
    }

    const handleSaveView = async (view: SavedView) => {
        try {
            await saveView(view);
            const updatedViews = await getSavedViews();
            setSavedViews(updatedViews);
            await setActiveViewId(view.id);
            return Promise.resolve();
        } catch (error) {
            console.error('Error saving view:', error);
            return Promise.reject(error);
        }
    }

    const handleDeleteView = async (viewId: string) => {
        try {
            await deleteView(viewId);
            const updatedViews = await getSavedViews();
            setSavedViews(updatedViews);

            if (activeViewId === viewId) {
                await setActiveViewId(undefined);
            }

            toast({
                title: "View Deleted",
                description: "The saved view has been deleted."
            });
        } catch (error) {
            console.error('Error deleting view:', error);
            toast({
                title: "Error",
                description: "Failed to delete view",
                variant: "destructive"
            });
        }
    }

    const applyView = async (view: SavedView) => {
        try {
            setFilters(view.filters);
            // Ensure visibleColumns has all required properties
            setVisibleColumns(prev => ({
                ...prev,
                ...view.visibleColumns
            }));
            setSearchTerm(view.searchTerm);
            await setActiveViewId(view.id);

            toast({
                title: "View Applied",
                description: `"${view.name}" view has been applied.`
            });
        } catch (error) {
            console.error('Error applying view:', error);
            toast({
                title: "Error",
                description: "Failed to apply view",
                variant: "destructive"
            });
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
            description: `${serviceData.name} has been added successfully.`
        })
    }

    const handleServicesSelect = (services: Service[]) => {
        setSelectedServices(services)
        if (services.length === 1) {
            setSelectedService(services[0])
        } else {
            setSelectedService(null)
        }
    }

    const handleColumnToggle = (column: string) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    const handleServiceUpdate = (updatedService: Service) => {
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
        if (selectedService && selectedService.id === updatedService.id) {
            setSelectedService(updatedService);
        }
    };

    const handleStart = async () => {
        if (selectedServices.length > 0) {
            toast({
                title: "Starting Services",
                description: `Starting ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`
            })

            // Track success and failures
            let successCount = 0;
            let failureCount = 0;

            // Process each service
            for (const service of selectedServices) {
                try {
                    const serviceId = parseInt(service.id);
                    const response = await providerApi.startService(serviceId);

                    if (response.success) {
                        successCount++;
                        // Update the service status in the local state
                        setServices(prev => prev.map(s =>
                            s.id === service.id ? {...s, serviceStatus: 'running'} : s
                        ));
                    } else {
                        failureCount++;
                        console.error(`Failed to start service ${service.name}:`, response.error);
                    }
                } catch (error) {
                    failureCount++;
                    console.error(`Error starting service ${service.name}:`, error);
                }
            }

            // Show result toast
            if (successCount > 0 && failureCount === 0) {
                toast({
                    title: "Services Started",
                    description: `Successfully started ${successCount} service${successCount !== 1 ? 's' : ''}.`
                });
            } else if (successCount > 0 && failureCount > 0) {
                toast({
                    title: "Partial Success",
                    description: `Started ${successCount} service${successCount !== 1 ? 's' : ''}, but ${failureCount} failed.`,
                    variant: "default"
                });
            } else {
                toast({
                    title: "Failed to Start Services",
                    description: `All ${failureCount} service${failureCount !== 1 ? 's' : ''} failed to start.`,
                    variant: "destructive"
                });
            }

            // Refresh the services list to get updated statuses
            fetchServices();
        }
    }

    const handleStop = async () => {
        if (selectedServices.length > 0) {
            toast({
                title: "Stopping Services",
                description: `Stopping ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`
            })

            // Track success and failures
            let successCount = 0;
            let failureCount = 0;

            // Process each service
            for (const service of selectedServices) {
                try {
                    const serviceId = parseInt(service.id);
                    const response = await providerApi.stopService(serviceId);

                    if (response.success) {
                        successCount++;
                        // Update the service status in the local state
                        setServices(prev => prev.map(s =>
                            s.id === service.id ? {...s, serviceStatus: 'stopped'} : s
                        ));
                    } else {
                        failureCount++;
                        console.error(`Failed to stop service ${service.name}:`, response.error);
                    }
                } catch (error) {
                    failureCount++;
                    console.error(`Error stopping service ${service.name}:`, error);
                }
            }

            // Show result toast
            if (successCount > 0 && failureCount === 0) {
                toast({
                    title: "Services Stopped",
                    description: `Successfully stopped ${successCount} service${successCount !== 1 ? 's' : ''}.`
                });
            } else if (successCount > 0 && failureCount > 0) {
                toast({
                    title: "Partial Success",
                    description: `Stopped ${successCount} service${successCount !== 1 ? 's' : ''}, but ${failureCount} failed.`,
                    variant: "default"
                });
            } else {
                toast({
                    title: "Failed to Stop Services",
                    description: `All ${failureCount} service${failureCount !== 1 ? 's' : ''} failed to stop.`,
                    variant: "destructive"
                });
            }

            // Refresh the services list to get updated statuses
            fetchServices();
        }
    }

    const handleRestart = async () => {
        if (selectedServices.length > 0) {
            toast({
                title: "Restarting Services",
                description: `Restarting ${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''}...`
            })

            // Track success and failures
            let successCount = 0;
            let failureCount = 0;

            // Process each service - first stop, then start
            for (const service of selectedServices) {
                try {
                    const serviceId = parseInt(service.id);

                    // First stop the service
                    const stopResponse = await providerApi.stopService(serviceId);
                    if (!stopResponse.success) {
                        failureCount++;
                        console.error(`Failed to stop service ${service.name} during restart:`, stopResponse.error);
                        continue; // Skip to next service if stop fails
                    }

                    // Then start the service
                    const startResponse = await providerApi.startService(serviceId);
                    if (startResponse.success) {
                        successCount++;
                        // Update the service status in the local state
                        setServices(prev => prev.map(s =>
                            s.id === service.id ? {...s, serviceStatus: 'running'} : s
                        ));
                    } else {
                        failureCount++;
                        console.error(`Failed to start service ${service.name} during restart:`, startResponse.error);
                    }
                } catch (error) {
                    failureCount++;
                    console.error(`Error restarting service ${service.name}:`, error);
                }
            }

            // Show result toast
            if (successCount > 0 && failureCount === 0) {
                toast({
                    title: "Services Restarted",
                    description: `Successfully restarted ${successCount} service${successCount !== 1 ? 's' : ''}.`
                });
            } else if (successCount > 0 && failureCount > 0) {
                toast({
                    title: "Partial Success",
                    description: `Restarted ${successCount} service${successCount !== 1 ? 's' : ''}, but ${failureCount} failed.`,
                    variant: "default"
                });
            } else {
                toast({
                    title: "Failed to Restart Services",
                    description: `All ${failureCount} service${failureCount !== 1 ? 's' : ''} failed to restart.`,
                    variant: "destructive"
                });
            }

            // Refresh the services list to get updated statuses
            fetchServices();
        }
    }

    const handleOpenSSH = () => {
        if (selectedServices.length === 1) {
            toast({
                title: "Opening SSH Terminal",
                description: `Connecting to ${selectedServices[0].serviceIP}...`
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

    const handleAlertDismiss = (alertId: string) => {
        // Update the alerts state to mark the alert as dismissed
        setAlerts(prevAlerts => 
            prevAlerts.map(alert => 
                alert.id === alertId 
                    ? { ...alert, isDismissed: true }
                    : alert
            )
        )
        // Optionally refresh alerts from server
        fetchAlerts()
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
                            <div className="flex-1 p-4 overflow-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <SavedViewsManager
                                        currentFilters={filters}
                                        currentVisibleColumns={visibleColumns}
                                        currentSearchTerm={searchTerm}
                                        savedViews={savedViews}
                                        onSaveView={handleSaveView}
                                        onDeleteView={handleDeleteView}
                                        onLoadView={applyView}
                                        activeViewId={activeViewId}
                                    />
                                </div>
                                <ServiceTable
                                    services={filteredServices}
                                    selectedServices={selectedServices}
                                    onServicesSelect={handleServicesSelect}
                                    onSettingsClick={() => setShowTableSettings(true)}
                                    visibleColumns={visibleColumns}
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    loading={loading}
                                />
                            </div>
                            <div className="flex-shrink-0 p-4 border-t border-border">
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
                        {selectedServices.length === 1 && selectedService && (
                            <div className="w-80 border-l border-border">
                                <RightSidebar
                                    service={selectedService}
                                    onClose={() => setSelectedService(null)}
                                    collapsed={rightSidebarCollapsed}
                                    onServiceUpdate={handleServiceUpdate}
                                    alerts={alerts}
                                    onAlertDismiss={handleAlertDismiss}
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