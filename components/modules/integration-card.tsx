import type { IntegrationProvider } from "@prisma/client";
import { PlugZap, RefreshCw, Unplug } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type IntegrationCardProps = {
  provider: IntegrationProvider | string;
  accountName?: string;
  connected?: boolean;
  lastSyncedAt?: Date | string | null;
  permissions?: unknown;
};

export function IntegrationCard({ provider, accountName, connected, lastSyncedAt, permissions }: IntegrationCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-accent p-2 text-accent-foreground">
            <PlugZap className="h-4 w-4" />
          </div>
          <CardTitle className="text-sm">{String(provider).replaceAll("_", " ")}</CardTitle>
        </div>
        <Badge tone={connected ? "green" : "default"}>{connected ? "Connected" : "Available"}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="font-medium">{accountName ?? "No account connected"}</p>
          <p className="text-xs text-muted-foreground">
            Last synced: {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never"}
          </p>
        </div>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          Permissions: {Array.isArray(permissions) ? permissions.join(", ") : "read, draft, publish.approved"}
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary">
            <RefreshCw className="h-3.5 w-3.5" />
            Sync
          </Button>
          <Button size="sm" variant="ghost">
            <Unplug className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
