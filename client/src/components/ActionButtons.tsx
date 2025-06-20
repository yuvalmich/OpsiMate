import { Button } from "@/components/ui/button"
import { Play, Square, RotateCcw, Terminal } from "lucide-react"
import { Service } from "./ServiceTable"

interface ActionButtonsProps {
  selectedService: Service | null
  onStart: () => void
  onStop: () => void
  onRestart: () => void
  onOpenSSH: () => void
}

export function ActionButtons({ 
  selectedService, 
  onStart, 
  onStop, 
  onRestart, 
  onOpenSSH 
}: ActionButtonsProps) {
  const isDisabled = !selectedService

  return (
    <div className="bg-card border-t border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedService 
            ? `Selected: ${selectedService.serviceName} (${selectedService.serverId})`
            : "No service selected"
          }
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isDisabled || selectedService?.status === 'running'}
            onClick={onStart}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            Start
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isDisabled || selectedService?.status === 'stopped'}
            onClick={onStop}
            className="gap-2"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isDisabled}
            onClick={onRestart}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            disabled={isDisabled}
            onClick={onOpenSSH}
            className="gap-2"
          >
            <Terminal className="h-4 w-4" />
            SSH Terminal
          </Button>
        </div>
      </div>
    </div>
  )
}