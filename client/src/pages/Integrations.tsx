import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Cloud, Database, Globe } from "lucide-react";
import { IntegrationSidebar } from "../components/IntegrationSidebar";
import { DashboardLayout } from "../components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

// Integration types
export type IntegrationType = "server" | "kubernetes" | "aws-ec2" | "aws-eks" | "gcp-compute" | "azure-vm";

interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: "server" | "kubernetes" | "cloud";
}

const integrations: Integration[] = [
  {
    id: "server",
    type: "server",
    name: "Server",
    description: "Connect to a physical or virtual server via SSH",
    icon: <Server className="h-6 w-6" />,
    category: "server"
  },
  {
    id: "kubernetes",
    type: "kubernetes",
    name: "Kubernetes Cluster",
    description: "Connect to a Kubernetes cluster using kubeconfig",
    icon: <Globe className="h-6 w-6" />,
    category: "kubernetes"
  },
  {
    id: "aws-ec2",
    type: "aws-ec2",
    name: "AWS EC2",
    description: "Connect to Amazon EC2 instances",
    icon: <Cloud className="h-6 w-6" />,
    category: "cloud"
  },
  {
    id: "aws-eks",
    type: "aws-eks",
    name: "AWS EKS",
    description: "Connect to Amazon Elastic Kubernetes Service",
    icon: <Cloud className="h-6 w-6" />,
    category: "cloud"
  },
  {
    id: "gcp-compute",
    type: "gcp-compute",
    name: "GCP Compute",
    description: "Connect to Google Cloud Platform Compute instances",
    icon: <Cloud className="h-6 w-6" />,
    category: "cloud"
  },
  {
    id: "azure-vm",
    type: "azure-vm",
    name: "Azure VM",
    description: "Connect to Microsoft Azure Virtual Machines",
    icon: <Cloud className="h-6 w-6" />,
    category: "cloud"
  }
];

export function Integrations() {
  const { toast } = useToast();
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredIntegrations = activeTab === "all" 
    ? integrations 
    : integrations.filter(integration => integration.category === activeTab);
    
  return (
    <DashboardLayout>
      <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your infrastructure and services to Service Peek Dashboard
          </p>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="server">Servers</TabsTrigger>
          <TabsTrigger value="kubernetes">Kubernetes</TabsTrigger>
          <TabsTrigger value="cloud">Cloud Services</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map((integration) => (
              <Card key={integration.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-md">
                      {integration.icon}
                    </div>
                    <CardTitle>{integration.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{integration.description}</CardDescription>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    Configure
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedIntegration && (
        <IntegrationSidebar
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
        />
      )}
    </div>
    </DashboardLayout>
  );
}

export default Integrations;
