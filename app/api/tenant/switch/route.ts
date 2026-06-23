import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [{ id: body.tenantId }, { slug: body.slug }]
    }
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("octave_tenant_id", tenant.id, { sameSite: "lax", httpOnly: true });
  return NextResponse.json({ tenant });
}
