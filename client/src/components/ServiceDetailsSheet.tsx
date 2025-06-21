import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, X } from "lucide-react";
import { ServiceConfig } from "./AddServiceDialog";

interface ServiceDetailsSheetProps {
  service: ServiceConfig | null;
  serverName: string;
  onClose: () => void;
}

// Mock data to represent the detailed service information from the image
const mockServiceDetails = {
  serverId: "srv-db-01",
  os: "CentOS 7",
  ip: "192.168.1.101",
  port: "5432",
  uptime: "32d 12h 15m",
  memory: "1.2GB",
  cpu: "5%",
  externalLinks: [
    { label: "View in Grafana", url: "#" },
    { label: "View in Coralogix", url: "#" },
    { label: "Server Monitoring", url: "#" },
  ],
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <div className="text-muted-foreground">{label}</div>
    <div className="text-foreground font-medium">{value}</div>
  </>
);

export function ServiceDetailsSheet({ service, serverName, onClose }: ServiceDetailsSheetProps) {
  if (!service) return null;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold">Service Details</SheetTitle>
           <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-6 py-2">
            <div>
                <h3 className="text-lg font-semibold">{service.name}</h3>
                <Badge className={`mt-1 capitalize ${
                    service.status === 'running' ? 'bg-green-100 text-green-800' :
                    service.status === 'stopped' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                }`}>
                    {service.status}
                </Badge>
            </div>

            <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2">
                <DetailRow label="Server:" value={serverName} />
                <DetailRow label="Server ID:" value={mockServiceDetails.serverId} />
                <DetailRow label="OS:" value={mockServiceDetails.os} />
                <DetailRow label="IP:" value={mockServiceDetails.ip} />
                <DetailRow label="Port:" value={mockServiceDetails.port} />
                <DetailRow label="Uptime:" value={mockServiceDetails.uptime} />
                <DetailRow label="Memory:" value={mockServiceDetails.memory} />
                <DetailRow label="CPU:" value={mockServiceDetails.cpu} />
            </div>
            
            <div>
                <h4 className="font-semibold text-lg mb-2">External Links</h4>
                <div className="space-y-2">
                    {mockServiceDetails.externalLinks.map(link => (
                        <Button key={link.label} variant="outline" className="w-full justify-start" asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {link.label}
                            </a>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 