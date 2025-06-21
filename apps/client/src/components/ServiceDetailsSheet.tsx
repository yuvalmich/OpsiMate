import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, X } from "lucide-react";
import { IntegrationInstance } from "@/pages/MyIntegrations";
import { getIntegrationTypeName, getStatusBadgeColor } from "@/pages/MyIntegrations";
import { ServiceConfig } from "./AddServiceDialog";

interface ServiceDetailsSheetProps {
  integration: IntegrationInstance | null;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <div className="text-muted-foreground">{label}</div>
    <div className="text-foreground font-medium">{value}</div>
  </>
);

const getServiceStatusBadgeColor = (status: ServiceConfig["status"]) => {
  switch (status) {
    case "running": return "bg-green-500/20 text-green-700 hover:bg-green-500/30";
    case "stopped": return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30";
    case "error": return "bg-red-500/20 text-red-700 hover:bg-red-500/30";
    case "unknown":
    default: return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/30";
  }
};

export function ServiceDetailsSheet({
  integration,
  onClose,
}: ServiceDetailsSheetProps) {
  if (!integration) return null;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            Integration Details
          </SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <div className="space-y-6 py-2">
          <div>
            <h3 className="text-lg font-semibold">{integration.name}</h3>
            <p className="text-sm text-muted-foreground">{getIntegrationTypeName(integration.type)}</p>
            <Badge className={`mt-1 capitalize ${getStatusBadgeColor(integration.status ?? 'unknown')}`}>
              {integration.status}
            </Badge>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2">
            {Object.entries(integration.details).map(([key, value]) => (
              <DetailRow key={key} label={`${key.charAt(0).toUpperCase() + key.slice(1)}:`} value={value} />
            ))}
          </div>

          {integration.services && integration.services.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg mb-2">Services</h4>
              <div className="space-y-2">
                {integration.services.map((service) => (
                   <div key={service.id} className="p-3 rounded-lg border bg-card">
                     <div className="flex justify-between items-center">
                       <div>
                         <p className="font-semibold">{service.name}</p>
                         {service.port && <p className="text-sm text-muted-foreground">Port: {service.port}</p>}
                       </div>
                       <Badge className={`${getServiceStatusBadgeColor(service.status)} capitalize`}>
                         {service.status}
                       </Badge>
                     </div>
                   </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="font-semibold text-lg mb-2">External Links</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Logs
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Metrics
                </a>
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 