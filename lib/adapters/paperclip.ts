import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/services/audit";
import type { PaperclipAgentType } from "@/lib/types/domain";

export type GenerateContentInput = {
  tenantId: string;
  userId?: string;
  agentType: PaperclipAgentType;
  campaignId?: string;
  topic: string;
  channels: string[];
  tone: string;
  contentType: string;
  brandVoice?: string;
  prompt?: string;
};

export type AgentOutput = {
  title: string;
  body: string;
  hashtags: string[];
  ctas: string[];
  recommendedTimes: string[];
  safety: {
    canPublishDirectly: false;
    approvalRequired: true;
  };
};

export class MockPaperclipAdapter {
  async generateContent(input: GenerateContentInput): Promise<AgentOutput> {
    const config = await prisma.agentConfig.findUnique({
      where: {
        tenantId_agentType: {
          tenantId: input.tenantId,
          agentType: input.agentType
        }
      }
    });

    if (config && !config.enabled) {
      throw new Error(`${input.agentType} is disabled for this tenant.`);
    }

    const channelLine = input.channels.join(", ") || "selected channels";
    const body = [
      `Draft for ${channelLine}: ${input.topic}`,
      "",
      `Tone: ${input.tone}. Format: ${input.contentType}.`,
      input.brandVoice ? `Brand voice guardrail: ${input.brandVoice}.` : "",
      "This is a Paperclip mock draft. Review facts, claims, compliance, and client preferences before approval."
    ]
      .filter(Boolean)
      .join("\n");

    await writeAuditLog({
      tenantId: input.tenantId,
      userId: input.userId,
      action: "AI_CONTENT_GENERATED",
      entityType: "PaperclipAgent",
      metadata: {
        agentType: input.agentType,
        channels: input.channels,
        contentType: input.contentType,
        approvalRequired: true
      }
    });

    return {
      title: `${input.contentType} draft: ${input.topic}`.slice(0, 90),
      body,
      hashtags: ["#OctaveCRM", "#DigitalMarketing", "#CampaignOps"],
      ctas: ["Book a demo", "Reply for the media kit", "Save this post"],
      recommendedTimes: ["10:30 AM", "3:00 PM", "7:30 PM"],
      safety: {
        canPublishDirectly: false,
        approvalRequired: true
      }
    };
  }

  async summarizeInboxMessage(tenantId: string, inboxItemId: string) {
    const item = await prisma.inboxItem.findFirst({
      where: { id: inboxItemId, tenantId }
    });

    if (!item) {
      throw new Error("Inbox item not found for tenant.");
    }

    return prisma.inboxItem.update({
      where: { id: item.id },
      data: {
        aiSummary: `Summary: ${item.body.slice(0, 140)}`,
        suggestedReply: "Draft a helpful reply, then send it for approval before sending."
      }
    });
  }
}

export const paperclipAdapter = new MockPaperclipAdapter();
