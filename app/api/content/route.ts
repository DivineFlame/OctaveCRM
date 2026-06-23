import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listContent } from "@/lib/services/crud";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ content: await listContent(tenantId) });
}
