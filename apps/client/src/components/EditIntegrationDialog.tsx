import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IntegrationInstance } from "@/pages/MyIntegrations";

interface EditIntegrationDialogProps {
  integration: IntegrationInstance | null;
  open: boolean;
  onClose: () => void;
  onSave: (integrationId: string, updatedData: {
    name: string;
    providerIp: string;
    username: string;
    privateKeyFilename: string;
    SSHPort: number;
    providerType: string;
  }) => Promise<void>;
}

export function EditIntegrationDialog({
  integration,
  open,
  onClose,
  onSave,
}: EditIntegrationDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    providerIp: "",
    username: "",
    privateKeyFilename: "",
    SSHPort: 22,
    providerType: "VM", // Default to VM
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when integration changes or dialog opens
  useEffect(() => {
    if (integration && open) {
      // Get the private key filename from the integration details
      console.log('Integration details:', integration.details);
      
      // Determine provider_type based on integration.type
      let providerType = 'VM'; // Default to VM
      
      // Map integration types to provider types
      if (integration.type.includes('kubernetes')) {
        providerType = 'K8S';
      }
      
      setFormData({
        name: integration.name,
        providerIp: integration.details?.Hostname || "",
        username: integration.details?.Username || "",
        privateKeyFilename: integration.details?.Private_key_filename || "",
        SSHPort: parseInt(integration.details?.Port || "22"),
        providerType: providerType
      });
    }
  }, [integration, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "SSHPort" ? parseInt(value) || 22 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!integration) return;
    
    setIsLoading(true);
    try {
      await onSave(integration.id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating integration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Integration</DialogTitle>
          <DialogDescription>
            Update the details for this integration. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="providerIp" className="text-right">
                Hostname/IP
              </Label>
              <Input
                id="providerIp"
                name="providerIp"
                value={formData.providerIp}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="SSHPort" className="text-right">
                SSH Port
              </Label>
              <Input
                id="SSHPort"
                name="SSHPort"
                type="number"
                value={formData.SSHPort}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="privateKeyFilename" className="text-right">
                SSH Key File
              </Label>
              <Input
                id="privateKeyFilename"
                name="privateKeyFilename"
                value={formData.privateKeyFilename}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Path to SSH private key file"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
