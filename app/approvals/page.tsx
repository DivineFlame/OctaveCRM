import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listApprovals } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const { tenantId } = await getTenantContext();
  const approvals = await listApprovals(tenantId);

  return (
    <>
      <PageHeader title="Approvals" description="Human approval pipeline for drafts, replies, scheduled posts, and external sends." />
      <div className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{approval.contentItem.title}</CardTitle>
              <Badge tone={approval.status === "APPROVED" ? "green" : approval.status === "REJECTED" ? "red" : "amber"}>{approval.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{approval.contentItem.body}</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Approve</Button>
                <Button size="sm" variant="secondary">Request changes</Button>
                <Button size="sm" variant="destructive">Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
