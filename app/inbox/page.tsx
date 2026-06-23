import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listInbox } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { tenantId } = await getTenantContext();
  const inbox = await listInbox(tenantId);

  return (
    <>
      <PageHeader title="Unified Inbox" description="Gmail, social comments, DMs, mentions, replies, and reviews with AI summaries and reply suggestions." />
      <div className="space-y-4">
        {inbox.map((item) => (
          <Card key={item.id}>
            <CardHeader className="flex-row items-start justify-between">
              <div>
                <CardTitle>{item.senderName}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{item.subject ?? item.senderHandle}</p>
              </div>
              <Badge tone={item.isUnread ? "blue" : "default"}>{item.provider}</Badge>
            </CardHeader>
            <CardContent className="grid gap-3 lg:grid-cols-[1fr_0.8fr]">
              <div>
                <p className="text-sm">{item.body}</p>
                <div className="mt-3 flex gap-2">
                  <Badge tone="green">{item.sentiment ?? "neutral"}</Badge>
                  <Badge tone={item.urgency === "high" ? "red" : "amber"}>{item.urgency ?? "normal"}</Badge>
                </div>
              </div>
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <p className="font-medium">AI suggestion</p>
                <p className="mt-2 text-muted-foreground">{item.aiSummary}</p>
                <p className="mt-2">{item.suggestedReply}</p>
                <Button className="mt-3" size="sm">Send reply for approval</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
