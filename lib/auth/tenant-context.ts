import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { TenantContext } from "@/lib/types/domain";

const demoTenantSlug = process.env.DEMO_TENANT_SLUG || "demo-agency";
const tenantCookieName = "octave_tenant_id";

export async function getTenantContext(): Promise<TenantContext> {
  const cookieStore = await cookies();
  const selectedTenantId = cookieStore.get(tenantCookieName)?.value;

  const tenant =
    (selectedTenantId
      ? await prisma.tenant.findUnique({ where: { id: selectedTenantId } })
      : null) ??
    (await prisma.tenant.findUnique({ where: { slug: demoTenantSlug } })) ??
    (await prisma.tenant.findFirst());

  if (!tenant) {
    throw new Error("No tenant found. Run `npm run seed` before using the app.");
  }

  const membership = await prisma.membership.findFirst({
    where: { tenantId: tenant.id },
    include: { user: true },
    orderBy: { createdAt: "asc" }
  });

  return {
    tenantId: tenant.id,
    userId: membership?.userId,
    role: membership?.role
  };
}

export async function assertTenantAccess(tenantId: string) {
  const context = await getTenantContext();
  if (context.tenantId !== tenantId) {
    throw new Error("Tenant access denied");
  }
  return context;
}
