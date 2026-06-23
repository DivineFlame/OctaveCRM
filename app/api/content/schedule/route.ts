import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { composioAdapter } from "@/lib/adapters/composio";
import { enqueuePublishJob } from "@/lib/services/publishing-queue";

export async function POST(request: Request) {
  const { tenantId, userId } = await getTenantContext();
  const body = await request.json();
  const scheduled = await composioAdapter.schedulePost({
    tenantId,
    userId,
    provider: body.provider ?? "LINKEDIN",
    action: body.action ?? "post",
    content: body.content,
    contentItemId: body.contentItemId,
    campaignId: body.campaignId,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(Date.now() + 3600000),
    metadata: body.metadata
  });

  const queue = await enqueuePublishJob(
    {
      tenantId,
      scheduledPostId: scheduled.id,
      contentItemId: scheduled.contentItemId,
      provider: String(scheduled.provider)
    },
    scheduled.scheduledAt
  );

  return NextResponse.json({ scheduled, queue }, { status: 201 });
}
