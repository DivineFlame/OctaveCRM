import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/services/audit";

export async function GET() {
  const { tenantId } = await getTenantContext();
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      name: true,
      companyProfile: true,
      websiteUrl: true,
      websiteReference: true
    }
  });

  return NextResponse.json({ profile: tenant });
}

export async function PUT(request: Request) {
  const { tenantId, userId, role } = await getTenantContext();

  if (!role || !["OWNER", "ADMIN"].includes(role)) {
    return NextResponse.json(
      { error: "Only workspace owners and admins can update the authoritative AI source." },
      { status: 403 }
    );
  }

  const body = await request.json();
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

  const profile = await prisma.tenant.update({
    where: { id: tenantId },
    data: { companyProfile, websiteUrl, websiteReference },
    select: {
      name: true,
      companyProfile: true,
      websiteUrl: true,
      websiteReference: true
    }
  });

  await writeAuditLog({
    tenantId,
    userId,
    action: "INTEGRATION_EVENT",
    entityType: "TenantCompanyProfile",
    entityId: tenantId,
    metadata: {
      event: "ai_source_updated",
      sourcePolicy: "company-profile-and-website-only",
      websiteUrl
    }
  });

  return NextResponse.json({ profile });
}
