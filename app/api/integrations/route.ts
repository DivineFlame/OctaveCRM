import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { composioAdapter } from "@/lib/adapters/composio";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ accounts: await composioAdapter.listConnectedAccounts(tenantId) });
}
