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
import { ProviderInstance } from "@/pages/MyProviders";

interface EditProviderDialogProps {
  provider: ProviderInstance | null;
  open: boolean;
  onClose: () => void;
  onSave: (providerId: string, updatedData: {
    name: string;
    providerIp: string;
    username: string;
    privateKeyFilename: string;
    SSHPort: number;
    providerType: string;
  }) => Promise<void>;
}

export function EditProviderDialog({
  provider,
  open,
  onClose,
  onSave,
}: EditProviderDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    providerIp: "",
    username: "",
    privateKeyFilename: "",
    SSHPort: 22,
    providerType: "VM", // Default to VM
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when provider changes or dialog opens
  useEffect(() => {
    if (provider && open) {
      // Get the private key filename from the provider details
      console.log('Provider details:', provider.details);
      
      // Determine provider_type based on provider.type
      let providerType = 'VM'; // Default to VM
      
      // Map provider types to provider types
      if (provider.type.includes('kubernetes')) {
        providerType = 'K8S';
      }
      
      setFormData({
        name: provider.name,
        providerIp: provider.details?.Hostname || "",
        username: provider.details?.Username || "",
        privateKeyFilename: provider.details?.Private_key_filename || "",
        SSHPort: parseInt(provider.details?.Port || "22"),
        providerType: providerType
      });
    }
  }, [provider, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "SSHPort" ? parseInt(value) || 22 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;
    
    setIsLoading(true);
    try {
      await onSave(provider.id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Provider</DialogTitle>
          <DialogDescription>
            Update the details for this provider. Click save when you're done.
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
