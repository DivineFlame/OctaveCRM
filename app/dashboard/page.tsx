import { Bot, CalendarClock, CheckCircle2, Inbox, Megaphone, Send, Sparkles, Zap } from "lucide-react";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DataList } from "@/components/modules/data-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { getMockAnalytics } from "@/lib/services/analytics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { tenantId } = await getTenantContext();
  const [campaigns, approvals, scheduledPosts, contentItems, accounts, inbox] = await Promise.all([
    prisma.campaign.findMany({ where: { tenantId }, take: 5, orderBy: { updatedAt: "desc" } }),
    prisma.approvalRequest.findMany({ where: { tenantId, status: "PENDING" }, include: { contentItem: true }, take: 5 }),
    prisma.scheduledPost.findMany({ where: { tenantId }, take: 5, orderBy: { scheduledAt: "asc" } }),
    prisma.contentItem.findMany({ where: { tenantId }, take: 5, orderBy: { updatedAt: "desc" } }),
    prisma.channelAccount.findMany({ where: { tenantId } }),
    prisma.inboxItem.findMany({ where: { tenantId, isUnread: true }, take: 5, orderBy: { receivedAt: "desc" } })
  ]);
  const analytics = getMockAnalytics();

  return (
    <>
      <PageHeader
        title="Marketing command center"
        description="Plan campaigns, coordinate approvals, monitor engagement, and keep AI-generated work safely under human control."
        actionLabel="Create Campaign"
      />
      <div className="page-grid">
        <MetricCard label="Active campaigns" value={campaigns.length} helper="Across connected clients" icon={Megaphone} />
        <MetricCard label="Pending approvals" value={approvals.length} helper="Requires human review" icon={CheckCircle2} />
        <MetricCard label="Scheduled posts" value={scheduledPosts.length} helper="Queue checks approval before publish" icon={CalendarClock} />
        <MetricCard label="Unread inbox" value={inbox.length} helper="Gmail and social messages" icon={Inbox} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Campaign performance summary</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceChart data={analytics.platformComparison} />
          </CardContent>
        </Card>
        <DataList
          title="Quick actions"
          items={[
            { title: "Generate content", subtitle: "Open Paperclip Content Writer Agent", right: <Sparkles className="h-4 w-4 text-primary" /> },
            { title: "Connect channel", subtitle: `${accounts.length} channels connected`, right: <Zap className="h-4 w-4 text-primary" /> },
            { title: "Review approvals", subtitle: `${approvals.length} items waiting`, right: <CheckCircle2 className="h-4 w-4 text-primary" /> },
            { title: "Prepare reply", subtitle: "Draft inbox responses, then request approval", right: <Send className="h-4 w-4 text-primary" /> }
          ]}
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <DataList
          title="AI-generated drafts"
          items={contentItems.map((item) => ({
            title: item.title,
            subtitle: item.body,
            meta: item.status,
            right: <Badge tone={item.status === "APPROVED" ? "green" : "amber"}>{item.status.replaceAll("_", " ")}</Badge>
          }))}
        />
        <DataList
          title="Recent engagement"
          items={inbox.map((item) => ({
            title: item.senderName,
            subtitle: item.body,
            meta: `${item.provider} · ${item.urgency ?? "normal"}`
          }))}
        />
        <DataList
          title="Connected channels"
          items={accounts.map((account) => ({
            title: account.accountName,
            subtitle: String(account.provider).replaceAll("_", " "),
            meta: account.lastSyncedAt ? `Synced ${account.lastSyncedAt.toLocaleDateString()}` : "Not synced",
            right: <Bot className="h-4 w-4 text-primary" />
          }))}
        />
      </div>
    </>
  );
}
