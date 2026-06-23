import { prisma } from "@/lib/prisma";

export async function listCampaigns(tenantId: string) {
  return prisma.campaign.findMany({
    where: { tenantId },
    include: { client: true, contentItems: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function listContent(tenantId: string) {
  return prisma.contentItem.findMany({
    where: { tenantId },
    include: { campaign: true, approvalRequests: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function listApprovals(tenantId: string) {
  return prisma.approvalRequest.findMany({
    where: { tenantId },
    include: { contentItem: true, approver: true, requestedBy: true, comments: true },
    orderBy: { requestedAt: "desc" }
  });
}

export async function listInbox(tenantId: string) {
  return prisma.inboxItem.findMany({
    where: { tenantId },
    orderBy: [{ isUnread: "desc" }, { receivedAt: "desc" }]
  });
}

export async function listTemplates(tenantId: string) {
  return prisma.template.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" }
  });
}

export async function listClients(tenantId: string) {
  return prisma.client.findMany({
    where: { tenantId },
    include: { campaigns: true },
    orderBy: { updatedAt: "desc" }
  });
}

export async function listTasks(tenantId: string) {
  return prisma.task.findMany({
    where: { tenantId },
    include: { campaign: true, client: true, contentItem: true, assignedUser: true },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }]
  });
}

export async function listAuditLogs(tenantId: string) {
  return prisma.auditLog.findMany({
    where: { tenantId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
}
