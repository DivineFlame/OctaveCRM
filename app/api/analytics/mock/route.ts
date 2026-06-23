import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { getMockAnalytics } from "@/lib/services/analytics";

export async function GET() {
  await getTenantContext();
  return NextResponse.json(getMockAnalytics());
}
