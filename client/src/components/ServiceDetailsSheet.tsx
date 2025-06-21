import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, X } from "lucide-react";
import { IntegrationInstance } from "@/pages/MyIntegrations";
import { getIntegrationTypeName, getStatusBadgeColor } from "@/pages/MyIntegrations";

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

export function ServiceDetailsSheet({
  integration,
  onClose,
}: ServiceDetailsSheetProps) {
  if (!integration) return null;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="text-xl font-bold">
            Integration Details
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
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