import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { composioAdapter } from "@/lib/adapters/composio";

export async function POST(request: Request) {
  const { tenantId, userId } = await getTenantContext();
  const body = await request.json();

  const published = await composioAdapter.publishApprovedPost({
    tenantId,
    userId,
    provider: body.provider ?? "LINKEDIN",
    action: "post",
    content: body.content,
    contentItemId: body.contentItemId,
    campaignId: body.campaignId,
    scheduledAt: new Date(),
    metadata: body.metadata
  });

  return NextResponse.json({ published });
}
