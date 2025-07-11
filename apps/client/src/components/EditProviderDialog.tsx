import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Provider } from "@service-peek/shared";
import { Container, Server } from "lucide-react";

interface EditProviderDialogProps {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
  onSave: (providerId: string, updatedData: {
    name: string;
    providerIP: string;
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
    providerIP: "",
    username: "",
    privateKeyFilename: "",
    SSHPort: 22,
    providerType: "VM", // Default to VM
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when provider changes or dialog opens
  useEffect(() => {
    if (provider && open) {
      setFormData({
        name: provider.name,
        providerIP: provider.providerIP || "",
        username: provider.username || "",
        privateKeyFilename: provider.privateKeyFilename || "",
        SSHPort: provider.SSHPort || 22,
        providerType: provider.providerType || 'VM',
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
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      providerType: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider) return;

    setIsLoading(true);
    try {
      await onSave(provider.id.toString(), formData);
      onClose();
    } catch (error) {
      console.error("Error updating provider:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isKubernetes = provider?.providerType === 'K8S' || formData.providerType === 'K8S';
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              {isKubernetes ? (
                <Container className="h-5 w-5 text-blue-500" />
              ) : (
                <Server className="h-5 w-5 text-purple-500" />
              )}
              Edit {isKubernetes ? 'Kubernetes Cluster' : 'Server'}
            </div>
          </DialogTitle>
          <DialogDescription>
            Update the details for this {isKubernetes ? 'Kubernetes cluster' : 'server'}. Click save when you're done.
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
              <Label htmlFor="providerType" className="text-right">
                Type
              </Label>
              <Select 
                value={formData.providerType} 
                onValueChange={handleSelectChange}
                disabled={!!provider} // Disable changing type for existing providers
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select provider type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VM">Server (VM)</SelectItem>
                  <SelectItem value="K8S">Kubernetes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {isKubernetes ? (
              // Kubernetes-specific fields
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="providerIP" className="text-right">
                    API Server
                  </Label>
                  <Input
                    id="providerIP"
                    name="providerIP"
                    value={formData.providerIP}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="e.g., https://kubernetes.default.svc"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="privateKeyFilename" className="text-right">
                    Kubeconfig
                  </Label>
                  <Input
                    id="privateKeyFilename"
                    name="privateKeyFilename"
                    value={formData.privateKeyFilename}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="Path to kubeconfig file"
                    required
                  />
                </div>
              </>
            ) : (
              // Server-specific fields
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="providerIP" className="text-right">
                    Hostname/IP
                  </Label>
                  <Input
                    id="providerIP"
                    name="providerIP"
                    value={formData.providerIP}
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
              </>
            )}
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
