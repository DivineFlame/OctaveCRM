import { IntegrationProvider, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/services/audit";

export type ProviderName = keyof typeof IntegrationProvider;

export type DraftActionPayload = {
  tenantId: string;
  userId?: string;
  provider: ProviderName;
  action: "post" | "email" | "reply" | "webhook";
  content: string;
  metadata?: Record<string, unknown>;
};

export type ScheduledPayload = DraftActionPayload & {
  scheduledAt: Date;
  contentItemId: string;
  campaignId?: string;
};

export class MockComposioAdapter {
  private json(input: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(input ?? {})) as Prisma.InputJsonValue;
  }

  async connectProvider(providerName: ProviderName, tenantId: string, userId?: string) {
    const account = await prisma.channelAccount.create({
      data: {
        tenantId,
        provider: IntegrationProvider[providerName],
        accountName: `${providerName.toLowerCase()} demo account`,
        permissions: ["read", "draft", "publish.approved", "send.approved"],
        lastSyncedAt: new Date(),
        credentialsRef: `vault://${tenantId}/${providerName.toLowerCase()}`
      }
    });

    await writeAuditLog({
      tenantId,
      userId,
      action: "INTEGRATION_CONNECTED",
      entityType: "ChannelAccount",
      entityId: account.id,
      metadata: { providerName, mocked: true }
    });

    return account;
  }

  async listConnectedAccounts(tenantId: string) {
    return prisma.channelAccount.findMany({
      where: { tenantId },
      orderBy: [{ provider: "asc" }, { updatedAt: "desc" }]
    });
  }

  async fetchInbox(provider: ProviderName, tenantId: string) {
    return prisma.inboxItem.findMany({
      where: { tenantId, provider: IntegrationProvider[provider] },
      orderBy: { receivedAt: "desc" }
    });
  }

  async fetchPosts(provider: ProviderName, tenantId: string) {
    return prisma.publishedPost.findMany({
      where: { tenantId, provider: IntegrationProvider[provider] },
      orderBy: { publishedAt: "desc" }
    });
  }

  async createDraftAction(payload: DraftActionPayload) {
    await writeAuditLog({
      tenantId: payload.tenantId,
      userId: payload.userId,
      action: "INTEGRATION_EVENT",
      entityType: "DraftAction",
      metadata: this.json({
        provider: payload.provider,
        action: payload.action,
        content: payload.content,
        metadata: payload.metadata ?? {},
        mocked: true
      })
    });

    return {
      id: `mock-draft-${Date.now()}`,
      provider: payload.provider,
      status: "draft_created",
      approvalRequired: true
    };
  }

  async schedulePost(payload: ScheduledPayload) {
    const post = await prisma.scheduledPost.create({
      data: {
        tenantId: payload.tenantId,
        campaignId: payload.campaignId,
        contentItemId: payload.contentItemId,
        provider: IntegrationProvider[payload.provider],
        payload: this.json({
          action: payload.action,
          content: payload.content,
          metadata: payload.metadata ?? {},
          approvalRequired: true
        }),
        scheduledAt: payload.scheduledAt,
        status: "queued"
      }
    });

    await writeAuditLog({
      tenantId: payload.tenantId,
      userId: payload.userId,
      action: "SCHEDULED",
      entityType: "ScheduledPost",
      entityId: post.id,
      metadata: { provider: payload.provider }
    });

    return post;
  }

  async publishApprovedPost(payload: ScheduledPayload) {
    const content = await prisma.contentItem.findFirst({
      where: {
        id: payload.contentItemId,
        tenantId: payload.tenantId,
        status: { in: ["APPROVED", "SCHEDULED"] }
      }
    });

    if (!content) {
      throw new Error("Publishing blocked: content must be approved for this tenant.");
    }

    const published = await prisma.publishedPost.create({
      data: {
        tenantId: payload.tenantId,
        contentItemId: payload.contentItemId,
        provider: IntegrationProvider[payload.provider],
        externalPostId: `mock-post-${Date.now()}`,
        platformResponse: { mocked: true, status: "published" }
      }
    });

    await prisma.contentItem.update({
      where: { id: payload.contentItemId },
      data: { status: "PUBLISHED" }
    });

    await writeAuditLog({
      tenantId: payload.tenantId,
      userId: payload.userId,
      action: "PUBLISHED",
      entityType: "PublishedPost",
      entityId: published.id,
      metadata: { provider: payload.provider, mocked: true }
    });

    return published;
  }

  async sendApprovedEmail(payload: ScheduledPayload) {
    return this.publishApprovedPost({ ...payload, action: "email" });
  }
}

export const composioAdapter = new MockComposioAdapter();
