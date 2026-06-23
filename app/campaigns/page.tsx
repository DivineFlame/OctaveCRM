import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listCampaigns } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { tenantId } = await getTenantContext();
  const campaigns = await listCampaigns(tenantId);

  return (
    <>
      <PageHeader title="Campaigns" description="Manage campaign strategy, content, approvals, calendar, and performance by tenant." actionLabel="New Campaign" />
      <div className="grid gap-4 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{campaign.name}</CardTitle>
                <Badge tone={campaign.status === "ACTIVE" ? "green" : "default"}>{campaign.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{campaign.objective}</p>
              <p><span className="font-medium">Audience:</span> {campaign.targetAudience}</p>
              <p><span className="font-medium">Client:</span> {campaign.client?.company ?? "Internal"}</p>
              <div className="flex flex-wrap gap-2">
                {(campaign.platforms as string[]).map((platform) => <Badge key={platform}>{platform}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
