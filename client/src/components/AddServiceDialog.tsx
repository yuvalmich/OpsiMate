import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  port: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export interface ServiceConfig {
  id: string;
  name: string;
  port?: string;
  status: "running" | "stopped" | "error" | "unknown";
}

interface AddServiceDialogProps {
  serverId: string;
  serverName: string;
  open: boolean;
  onClose: () => void;
  onServiceAdded: (service: ServiceConfig) => void;
}

export function AddServiceDialog({ serverId, serverName, open, onClose, onServiceAdded }: AddServiceDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      port: "",
    }
  });

  const onSubmit = (data: ServiceFormData) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const newService: ServiceConfig = {
        id: `svc-${Date.now()}`,
        name: data.name,
        port: data.port,
        status: "unknown"
      };
      onServiceAdded(newService);
      setLoading(false);
      reset();
      onClose();
      toast({
        title: "Service Added",
        description: `${data.name} has been added to ${serverName}.`
      })
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        reset();
        onClose();
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Service to {serverName}</DialogTitle>
          <DialogDescription>
            Manually add a service by providing its details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid grid-cols-3 gap-x-4 gap-y-2">
            <div className="col-span-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" {...register("name")} placeholder="e.g., Nginx" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="col-span-1">
              <Label htmlFor="port">Port</Label>
              <Input id="port" {...register("port")} placeholder="e.g., 80" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { reset(); onClose(); }} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Service
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
