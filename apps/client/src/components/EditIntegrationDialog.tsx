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
    provider_name: string;
    provider_ip: string;
    username: string;
    private_key_filename: string;
    ssh_port: number;
    provider_type: string;
  }) => Promise<void>;
}

export function EditIntegrationDialog({
  integration,
  open,
  onClose,
  onSave,
}: EditIntegrationDialogProps) {
  const [formData, setFormData] = useState({
    provider_name: "",
    provider_ip: "",
    username: "",
    private_key_filename: "",
    ssh_port: 22,
    provider_type: "VM", // Default to VM
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
        provider_name: integration.name,
        provider_ip: integration.details?.hostname || "",
        username: integration.details?.username || "",
        private_key_filename: integration.details?.private_key_filename || "",
        ssh_port: parseInt(integration.details?.port || "22"),
        provider_type: providerType
      });
    }
  }, [integration, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ssh_port" ? parseInt(value) || 22 : value,
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
              <Label htmlFor="provider_name" className="text-right">
                Name
              </Label>
              <Input
                id="provider_name"
                name="provider_name"
                value={formData.provider_name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="provider_ip" className="text-right">
                Hostname/IP
              </Label>
              <Input
                id="provider_ip"
                name="provider_ip"
                value={formData.provider_ip}
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
              <Label htmlFor="ssh_port" className="text-right">
                SSH Port
              </Label>
              <Input
                id="ssh_port"
                name="ssh_port"
                type="number"
                value={formData.ssh_port}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="private_key_filename" className="text-right">
                SSH Key File
              </Label>
              <Input
                id="private_key_filename"
                name="private_key_filename"
                value={formData.private_key_filename}
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
