import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/services/audit";
import {
  buildGroundedAgentPrompt,
  type AiUseCase,
  type AuthoritativeAiSource
} from "@/lib/services/ai-source-context";
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
  useCase: AiUseCase;
  source: AuthoritativeAiSource;
};

export type AgentOutput = {
  title: string;
  body: string;
  hashtags: string[];
  ctas: string[];
  recommendedTimes: string[];
  grounding: {
    sourceOwnerType: "tenant" | "client";
    sourceOwnerId: string;
    companyName: string;
    websiteUrl: string;
    policy: "company-profile-and-website-only";
  };
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
    const groundedPrompt = buildGroundedAgentPrompt(
      input.source,
      input.useCase,
      input.prompt ?? input.topic
    );
    const body = [
      `${input.source.companyName} ${input.contentType} draft for ${channelLine}: ${input.topic}`,
      "",
      `Tone: ${input.tone}. Format: ${input.contentType}.`,
      input.brandVoice ? `Brand voice guardrail: ${input.brandVoice}.` : "",
      `Source: ${input.source.websiteUrl}`,
      `Company context: ${input.source.companyProfile}`,
      `Website context: ${input.source.websiteReference}`,
      "",
      "This draft is grounded exclusively in the configured company profile and website reference. Review it before approval."
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
        useCase: input.useCase,
        sourcePolicy: "company-profile-and-website-only",
        sourceOwnerType: input.source.ownerType,
        sourceOwnerId: input.source.ownerId,
        websiteUrl: input.source.websiteUrl,
        groundedPrompt,
        approvalRequired: true
      }
    });

    return {
      title: `${input.contentType} draft: ${input.topic}`.slice(0, 90),
      body,
      hashtags: [
        `#${input.source.companyName.replace(/[^a-zA-Z0-9]/g, "")}`,
        "#CompanyUpdate"
      ],
      ctas: [`Learn more at ${input.source.websiteUrl}`],
      recommendedTimes: ["10:30 AM", "3:00 PM", "7:30 PM"],
      grounding: {
        sourceOwnerType: input.source.ownerType,
        sourceOwnerId: input.source.ownerId,
        companyName: input.source.companyName,
        websiteUrl: input.source.websiteUrl,
        policy: "company-profile-and-website-only"
      },
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
