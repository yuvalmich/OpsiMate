import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { IntegrationType } from "@/pages/Integrations";
import { useToast } from "@/hooks/use-toast";

interface IntegrationSidebarProps {
  integration: {
    id: string;
    type: IntegrationType;
    name: string;
    description: string;
    icon: React.ReactNode;
  };
  onClose: () => void;
}

interface FormField {
  id: string;
  label: string;
  type: "text" | "password" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export function IntegrationSidebar({ integration, onClose }: IntegrationSidebarProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Define form fields based on integration type
  const getFormFields = (): FormField[] => {
    switch (integration.type) {
      case "server":
        return [
          { id: "name", label: "Server Name", type: "text", placeholder: "My Production Server", required: true },
          { id: "hostname", label: "Hostname / IP", type: "text", placeholder: "192.168.1.100", required: true },
          { id: "port", label: "SSH Port", type: "text", placeholder: "22", required: true },
          { id: "username", label: "Username", type: "text", placeholder: "root", required: true },
          { id: "authType", label: "Authentication Type", type: "select", required: true, options: [
            { value: "password", label: "Password" },
            { value: "key", label: "SSH Key" }
          ]},
          { id: "password", label: "Password", type: "password", placeholder: "Enter password" },
          { id: "sshKey", label: "SSH Key Path", type: "text", placeholder: "~/.ssh/id_rsa" }
        ];
      case "kubernetes":
        return [
          { id: "name", label: "Cluster Name", type: "text", placeholder: "Production Cluster", required: true },
          { id: "kubeconfigPath", label: "Kubeconfig Path", type: "text", placeholder: "~/.kube/config", required: true },
          { id: "context", label: "Context", type: "text", placeholder: "my-cluster-context" }
        ];
      case "aws-ec2":
      case "aws-eks":
        return [
          { id: "name", label: "Connection Name", type: "text", placeholder: "AWS Production", required: true },
          { id: "region", label: "AWS Region", type: "select", required: true, options: [
            { value: "us-east-1", label: "US East (N. Virginia)" },
            { value: "us-east-2", label: "US East (Ohio)" },
            { value: "us-west-1", label: "US West (N. California)" },
            { value: "us-west-2", label: "US West (Oregon)" },
            { value: "eu-west-1", label: "EU (Ireland)" },
            { value: "eu-central-1", label: "EU (Frankfurt)" },
            { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" }
          ]},
          { id: "accessKeyId", label: "Access Key ID", type: "text", placeholder: "AKIAIOSFODNN7EXAMPLE", required: true },
          { id: "secretAccessKey", label: "Secret Access Key", type: "password", required: true }
        ];
      case "gcp-compute":
        return [
          { id: "name", label: "Connection Name", type: "text", placeholder: "GCP Production", required: true },
          { id: "projectId", label: "Project ID", type: "text", placeholder: "my-gcp-project", required: true },
          { id: "zone", label: "Zone", type: "text", placeholder: "us-central1-a", required: true },
          { id: "credentialsPath", label: "Service Account Key Path", type: "text", placeholder: "path/to/service-account.json", required: true }
        ];
      case "azure-vm":
        return [
          { id: "name", label: "Connection Name", type: "text", placeholder: "Azure Production", required: true },
          { id: "subscriptionId", label: "Subscription ID", type: "text", required: true },
          { id: "tenantId", label: "Tenant ID", type: "text", required: true },
          { id: "clientId", label: "Client ID", type: "text", required: true },
          { id: "clientSecret", label: "Client Secret", type: "password", required: true },
          { id: "resourceGroup", label: "Resource Group", type: "text", required: true }
        ];
      default:
        return [
          { id: "name", label: "Name", type: "text", placeholder: "Integration name", required: true }
        ];
    }
  };

  const formFields = getFormFields();

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const missingFields = formFields
      .filter(field => field.required && !formData[field.id])
      .map(field => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    // Here you would normally send the data to your backend
    console.log("Integration data:", { type: integration.type, ...formData });
    
    toast({
      title: "Integration added",
      description: `Successfully added ${integration.name} integration`
    });
    
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-md">
              {integration.icon}
            </div>
            <div>
              <SheetTitle>{integration.name}</SheetTitle>
              <SheetDescription>{integration.description}</SheetDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        <Separator className="my-4" />
        
        <div className="space-y-4 py-4">
          {formFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {field.type === "select" ? (
                <Select 
                  value={formData[field.id] || ""} 
                  onValueChange={(value) => handleInputChange(field.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Integration</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
