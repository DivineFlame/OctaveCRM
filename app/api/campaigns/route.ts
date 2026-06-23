import { NextResponse } from "next/server";
import { CampaignStatus } from "@prisma/client";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { listCampaigns } from "@/lib/services/crud";
import { writeAuditLog } from "@/lib/services/audit";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ campaigns: await listCampaigns(tenantId) });
}

export async function POST(request: Request) {
  const { tenantId, userId } = await getTenantContext();
  const body = await request.json();

  const campaign = await prisma.campaign.create({
    data: {
      tenantId,
      name: body.name,
      objective: body.objective ?? "Awareness",
      targetAudience: body.targetAudience ?? "Target audience",
      platforms: body.platforms ?? [],
      budget: body.budget,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      status: body.status ?? CampaignStatus.DRAFT,
      brandVoice: body.brandVoice,
      keywords: body.keywords ?? [],
      hashtags: body.hashtags ?? [],
      assets: body.assets ?? []
    }
  });

  await writeAuditLog({ tenantId, userId, action: "INTEGRATION_EVENT", entityType: "Campaign", entityId: campaign.id, metadata: { event: "campaign_created" } });
  return NextResponse.json({ campaign }, { status: 201 });
}
