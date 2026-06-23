import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listApprovals } from "@/lib/services/crud";
import { requestApproval, reviewApproval } from "@/lib/services/approval";

export async function GET() {
  const { tenantId } = await getTenantContext();
  return NextResponse.json({ approvals: await listApprovals(tenantId) });
}

export async function POST(request: Request) {
  const { tenantId, userId } = await getTenantContext();
  const body = await request.json();

  if (body.decision && body.approvalRequestId) {
    const approval = await reviewApproval(tenantId, body.approvalRequestId, body.decision, userId, body.reason);
    return NextResponse.json({ approval });
  }

  const approval = await requestApproval(tenantId, body.contentItemId, userId, body.approverId);
  return NextResponse.json({ approval }, { status: 201 });
}
