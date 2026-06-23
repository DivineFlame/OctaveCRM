import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { listClients } from "@/lib/services/crud";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ clients: await listClients(tenantId) });
}

export async function POST(request: Request) {
  const { tenantId } = await getTenantContext();
  const body = await request.json();
  const client = await prisma.client.create({
    data: {
      tenantId,
      name: body.name,
      company: body.company,
      contactPerson: body.contactPerson,
      email: body.email,
      phone: body.phone,
      industry: body.industry,
      notes: body.notes
    }
  });
  return NextResponse.json({ client }, { status: 201 });
}
