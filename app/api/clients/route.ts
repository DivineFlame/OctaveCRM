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
      notes: body.notes,
      companyProfile: body.companyProfile,
      websiteUrl: body.websiteUrl,
      websiteReference: body.websiteReference
    }
  });
  return NextResponse.json({ client }, { status: 201 });
}

export async function PUT(request: Request) {
  const { tenantId, role } = await getTenantContext();

  if (!role || !["OWNER", "ADMIN", "MANAGER"].includes(role)) {
    return NextResponse.json(
      { error: "You do not have permission to update client AI sources." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const client = await prisma.client.findFirst({
    where: { id: body.id, tenantId },
    select: { id: true }
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found." }, { status: 404 });
  }

  const companyProfile = String(body.companyProfile ?? "").trim();
  const websiteUrl = String(body.websiteUrl ?? "").trim();
  const websiteReference = String(body.websiteReference ?? "").trim();

  if (!companyProfile || !websiteUrl || !websiteReference) {
    return NextResponse.json(
      { error: "Company profile, website URL, and website reference are required." },
      { status: 400 }
    );
  }

  try {
    new URL(websiteUrl);
  } catch {
    return NextResponse.json({ error: "Enter a valid website URL." }, { status: 400 });
  }

  const updatedClient = await prisma.client.update({
    where: { id: client.id },
    data: { companyProfile, websiteUrl, websiteReference }
  });

  return NextResponse.json({ client: updatedClient });
}
