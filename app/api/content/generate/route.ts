import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { paperclipAdapter } from "@/lib/adapters/paperclip";
import { getAuthoritativeAiSource, type AiUseCase } from "@/lib/services/ai-source-context";

const supportedUseCases = new Set<AiUseCase>(["lead", "campaign", "email", "content"]);

export async function POST(request: Request) {
  try {
    const { tenantId, userId } = await getTenantContext();
    const body = await request.json();
    const useCase = (body.useCase ?? (body.contentType === "email" ? "email" : "content")) as AiUseCase;

    if (!supportedUseCases.has(useCase)) {
      return NextResponse.json(
        { error: "useCase must be one of: lead, campaign, email, content." },
        { status: 400 }
      );
    }

    const source = await getAuthoritativeAiSource(tenantId, body.campaignId);
    const output = await paperclipAdapter.generateContent({
      tenantId,
      userId,
      agentType: body.agentType ?? "Content Writer Agent",
      campaignId: body.campaignId,
      topic: body.topic ?? body.prompt ?? "Campaign update",
      channels: body.channels ?? ["LinkedIn"],
      tone: body.tone ?? "professional",
      contentType: body.contentType ?? "post",
      prompt: body.prompt,
      useCase,
      source
    });

    const content = await prisma.contentItem.create({
      data: {
        tenantId,
        campaignId: body.campaignId,
        createdById: userId,
        title: output.title,
        contentType: body.contentType ?? "post",
        channels: body.channels ?? ["LinkedIn"],
        body: output.body,
        prompt: body.prompt ?? body.topic,
        tone: body.tone ?? "professional",
        status: "AI_GENERATED",
        aiMetadata: { ...output, useCase, approvalRequired: true }
      }
    });

    await prisma.contentVersion.create({
      data: {
        tenantId,
        contentItemId: content.id,
        version: 1,
        body: content.body,
        editedById: userId,
        changeSummary: "Generated from company profile and website reference"
      }
    });

    return NextResponse.json({ content, output }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate AI draft.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
