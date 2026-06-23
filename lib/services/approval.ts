import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/services/audit";

export async function requestApproval(tenantId: string, contentItemId: string, userId?: string, approverId?: string) {
  const content = await prisma.contentItem.findFirst({
    where: { id: contentItemId, tenantId }
  });

  if (!content) {
    throw new Error("Content item not found for this tenant.");
  }

  const approval = await prisma.approvalRequest.create({
    data: {
      tenantId,
      contentItemId,
      requestedById: userId,
      approverId,
      status: "PENDING"
    }
  });

  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: ContentStatus.PENDING_APPROVAL }
  });

  await writeAuditLog({
    tenantId,
    userId,
    action: "APPROVAL_REQUESTED",
    entityType: "ApprovalRequest",
    entityId: approval.id,
    metadata: { contentItemId }
  });

  return approval;
}

export async function reviewApproval(
  tenantId: string,
  approvalRequestId: string,
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED",
  userId?: string,
  reason?: string
) {
  const approval = await prisma.approvalRequest.findFirst({
    where: { id: approvalRequestId, tenantId },
    include: { contentItem: true }
  });

  if (!approval) {
    throw new Error("Approval request not found for this tenant.");
  }

  const contentStatus =
    decision === "APPROVED"
      ? ContentStatus.APPROVED
      : decision === "REJECTED"
        ? ContentStatus.REJECTED
        : ContentStatus.HUMAN_EDITED;

  const updated = await prisma.approvalRequest.update({
    where: { id: approval.id },
    data: {
      status: decision,
      reviewedAt: new Date(),
      reason
    }
  });

  await prisma.contentItem.update({
    where: { id: approval.contentItemId },
    data: { status: contentStatus }
  });

  await writeAuditLog({
    tenantId,
    userId,
    action: decision === "APPROVED" ? "APPROVED" : decision === "REJECTED" ? "REJECTED" : "CHANGES_REQUESTED",
    entityType: "ApprovalRequest",
    entityId: approval.id,
    metadata: { contentItemId: approval.contentItemId, reason }
  });

  return updated;
}
