import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { listTemplates } from "@/lib/services/crud";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ templates: await listTemplates(tenantId) });
}

export async function POST(request: Request) {
  const { tenantId, userId } = await getTenantContext();
  const body = await request.json();
  const template = await prisma.template.create({
    data: {
      tenantId,
      createdById: userId,
      name: body.name,
      type: body.type,
      body: body.body,
      tags: body.tags ?? []
    }
  });
  return NextResponse.json({ template }, { status: 201 });
}
