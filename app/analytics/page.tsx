import { PerformanceChart } from "@/components/charts/performance-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DataList } from "@/components/modules/data-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { getMockAnalytics } from "@/lib/services/analytics";
import { BarChart3, Clock3, MousePointerClick, RadioTower, Send, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await getTenantContext();
  const analytics = getMockAnalytics();

  return (
    <>
      <PageHeader title="Analytics" description="Campaign performance, platform comparison, AI content outcomes, and approval turnaround." />
      <div className="page-grid">
        <MetricCard label="Posts published" value={analytics.summary.postsPublished} helper="Approved and published" icon={Send} />
        <MetricCard label="Engagement" value={analytics.summary.engagement.toLocaleString()} helper="Across social channels" icon={BarChart3} />
        <MetricCard label="Reach" value={analytics.summary.reach.toLocaleString()} helper="Mock cross-platform reach" icon={RadioTower} />
        <MetricCard label="Leads" value={analytics.summary.leadsGenerated} helper="Attributed leads" icon={Users} />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader><CardTitle>Platform comparison</CardTitle></CardHeader>
          <CardContent><PerformanceChart data={analytics.platformComparison} /></CardContent>
        </Card>
        <DataList
          title="Best performing content"
          items={analytics.bestContent.map((item) => ({
            title: item.title,
            subtitle: `Performance score ${item.score}`,
            right: <MousePointerClick className="h-4 w-4 text-primary" />
          }))}
        />
      </div>
      <div className="mt-5">
        <MetricCard label="Approval turnaround" value={`${analytics.summary.approvalTurnaroundHours}h`} helper="Average time from request to decision" icon={Clock3} />
      </div>
    </>
  );
}
