import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { composioAdapter } from "@/lib/adapters/composio";

export async function POST(request: Request) {
  const { tenantId, userId } = await getTenantContext();
  const body = await request.json();
  const account = await composioAdapter.connectProvider(body.provider ?? "GMAIL", tenantId, userId);
  return NextResponse.json({ account }, { status: 201 });
}
