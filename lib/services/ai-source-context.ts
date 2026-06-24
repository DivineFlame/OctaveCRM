import { prisma } from "@/lib/prisma";

export type AiUseCase = "lead" | "campaign" | "email" | "content";

export type AuthoritativeAiSource = {
  ownerType: "tenant" | "client";
  ownerId: string;
  companyName: string;
  companyProfile: string;
  websiteUrl: string;
  websiteReference: string;
};

type SourceRecord = {
  id: string;
  name: string;
  companyProfile: string | null;
  websiteUrl: string | null;
  websiteReference: string | null;
};

function requireCompleteSource(record: SourceRecord, ownerType: "tenant" | "client"): AuthoritativeAiSource {
  const companyProfile = record.companyProfile?.trim();
  const websiteUrl = record.websiteUrl?.trim();
  const websiteReference = record.websiteReference?.trim();

  if (!companyProfile || !websiteUrl || !websiteReference) {
    throw new Error(
      `${ownerType === "client" ? "Client" : "Workspace"} AI source is incomplete. Add the company profile, website URL, and website reference before using AI.`
    );
  }

  return {
    ownerType,
    ownerId: record.id,
    companyName: record.name,
    companyProfile,
    websiteUrl,
    websiteReference
  };
}

export async function getAuthoritativeAiSource(tenantId: string, campaignId?: string) {
  if (campaignId) {
    const campaign = await prisma.campaign.findFirst({
      where: { id: campaignId, tenantId },
      select: {
        client: {
          select: {
            id: true,
            company: true,
            companyProfile: true,
            websiteUrl: true,
            websiteReference: true
          }
        }
      }
    });

    if (!campaign) {
      throw new Error("Campaign not found for this workspace.");
    }

    if (campaign.client) {
      return requireCompleteSource(
        {
          id: campaign.client.id,
          name: campaign.client.company,
          companyProfile: campaign.client.companyProfile,
          websiteUrl: campaign.client.websiteUrl,
          websiteReference: campaign.client.websiteReference
        },
        "client"
      );
    }
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      companyProfile: true,
      websiteUrl: true,
      websiteReference: true
    }
  });

  if (!tenant) {
    throw new Error("Workspace not found.");
  }

  return requireCompleteSource(tenant, "tenant");
}

export function buildGroundedAgentPrompt(
  source: AuthoritativeAiSource,
  useCase: AiUseCase,
  taskInstruction: string
) {
  return [
    `Create a ${useCase} draft using only the authoritative source material below.`,
    "Do not add facts, claims, offers, statistics, products, services, contact details, or capabilities that are not explicitly supported by these sources.",
    "If the requested draft needs unsupported information, clearly mark it as requiring human input instead of guessing.",
    "",
    `Company: ${source.companyName}`,
    `Company profile: ${source.companyProfile}`,
    `Website: ${source.websiteUrl}`,
    `Website reference: ${source.websiteReference}`,
    "",
    `Task instruction: ${taskInstruction}`
  ].join("\n");
}
