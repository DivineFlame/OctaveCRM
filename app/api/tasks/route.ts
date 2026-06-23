import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { listTasks } from "@/lib/services/crud";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ tasks: await listTasks(tenantId) });
}

export async function POST(request: Request) {
  const { tenantId } = await getTenantContext();
  const body = await request.json();
  const task = await prisma.task.create({
    data: {
      tenantId,
      title: body.title,
      description: body.description,
      assignedUserId: body.assignedUserId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      priority: body.priority ?? "MEDIUM",
      status: body.status ?? "TODO",
      campaignId: body.campaignId,
      contentItemId: body.contentItemId,
      clientId: body.clientId
    }
  });
  return NextResponse.json({ task }, { status: 201 });
}
