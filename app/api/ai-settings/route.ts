import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { tenantId } = await getTenantContext();
  const agents = await prisma.agentConfig.findMany({ where: { tenantId }, orderBy: { agentType: "asc" } });
  return NextResponse.json({ agents });
}

export async function POST(request: Request) {
  const { tenantId } = await getTenantContext();
  const body = await request.json();
  const agent = await prisma.agentConfig.upsert({
    where: { tenantId_agentType: { tenantId, agentType: body.agentType } },
    update: {
      enabled: body.enabled,
      endpoint: body.endpoint,
      modelName: body.modelName,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      approvalRequired: true
    },
    create: {
      tenantId,
      agentType: body.agentType,
      enabled: body.enabled ?? true,
      endpoint: body.endpoint,
      modelName: body.modelName,
      temperature: body.temperature ?? "0.7",
      maxTokens: body.maxTokens ?? 1200,
      approvalRequired: true
    }
  });
  return NextResponse.json({ agent });
}
