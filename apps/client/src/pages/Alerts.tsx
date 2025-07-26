import { useAlerts } from "@/hooks/queries/alerts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Alert } from "@service-peek/shared";

export default function Alerts() {
  const { data: alerts = [], isLoading } = useAlerts();
  const [search, setSearch] = useState("");

  const filteredAlerts = useMemo(() => {
    if (!search.trim()) return alerts;
    const lower = search.toLowerCase();
    return alerts.filter(
      (a: Alert) =>
        a.alertName.toLowerCase().includes(lower) ||
        a.status.toLowerCase().includes(lower) ||
        (a.summary && a.summary.toLowerCase().includes(lower)) ||
        a.tag.toLowerCase().includes(lower)
    );
  }, [alerts, search]);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full p-6 gap-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="text-muted-foreground mt-1">All system alerts</p>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search alerts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No alerts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.alertName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alert.status === "firing"
                              ? "destructive"
                              : alert.status === "pending"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{alert.tag}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{alert.summary || "-"}</TableCell>
                      <TableCell>
                        {new Date(alert.startsAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 