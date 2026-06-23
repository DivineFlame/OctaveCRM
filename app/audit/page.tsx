import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listAuditLogs } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const { tenantId } = await getTenantContext();
  const logs = await listAuditLogs(tenantId);

  return (
    <>
      <PageHeader title="Audit logs" description="Trace AI generation, edits, approvals, integration events, scheduling, publishing, and failed sends." />
      <Card>
        <CardHeader><CardTitle>Recent events</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">{log.action.replaceAll("_", " ")}</p>
                <p className="text-muted-foreground">{log.entityType} · {log.user?.email ?? "system"}</p>
              </div>
              <Badge>{log.createdAt.toLocaleString()}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
