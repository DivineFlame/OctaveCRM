import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const { tenantId } = await getTenantContext();
  const posts = await prisma.scheduledPost.findMany({ where: { tenantId }, include: { contentItem: true }, orderBy: { scheduledAt: "asc" } });

  return (
    <>
      <PageHeader title="Calendar" description="Schedule approved content across channels with queue-based publishing and retry logs." actionLabel="Schedule Post" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="text-sm">{post.scheduledAt.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{post.contentItem.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{String(post.provider).replaceAll("_", " ")}</p>
              <Badge tone={post.status.includes("approval") ? "amber" : "blue"} className="mt-3">{post.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
