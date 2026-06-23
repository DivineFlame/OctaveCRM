import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listInbox } from "@/lib/services/crud";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ inbox: await listInbox(tenantId) });
}
