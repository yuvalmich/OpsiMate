import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface TableSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  visibleColumns: Record<string, boolean>
  onColumnToggle: (column: string) => void
}

const columnLabels = {
  os: 'Operating System',
  serverId: 'Server ID',
  serviceName: 'Service Name',
  status: 'Status',
  ipAddress: 'IP Address',
  port: 'Port',
  uptime: 'Uptime',
  memory: 'Memory Usage',
  cpu: 'CPU Usage'
}

export function TableSettingsModal({ 
  open, 
  onOpenChange, 
  visibleColumns, 
  onColumnToggle 
}: TableSettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Table Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Select which columns to display in the services table.
          </p>
          
          <div className="space-y-3">
            {Object.entries(columnLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={visibleColumns[key]}
                  onCheckedChange={() => onColumnToggle(key)}
                />
                <label
                  htmlFor={key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}