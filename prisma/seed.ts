import { PrismaClient, Role, CampaignStatus, ContentStatus, ApprovalStatus, IntegrationProvider, InboxType, Priority, TaskStatus, AuditAction } from "@prisma/client";
import bcrypt from "bcryptjs";
import { paperclipAgentTypes } from "../lib/types/domain";

const prisma = new PrismaClient();

async function main() {
  const existingTenant = await prisma.tenant.findUnique({
    where: { slug: "demo-agency" },
    include: {
      _count: {
        select: {
          campaigns: true,
          memberships: true
        }
      }
    }
  });

  if (existingTenant?._count.campaigns && existingTenant._count.memberships) {
    await prisma.tenant.update({
      where: { id: existingTenant.id },
      data: {
        companyProfile:
          existingTenant.companyProfile ??
          "Octave Digital Studio is a digital marketing agency helping Indian MSMEs plan campaigns, create approved content, and manage customer engagement.",
        websiteUrl: existingTenant.websiteUrl ?? "https://octavecrm.example",
        websiteReference:
          existingTenant.websiteReference ??
          "OctaveCRM provides campaign planning, approval workflows, content operations, inbox management, and channel analytics for agencies and MSMEs."
      }
    });
    console.log(`Seed skipped; tenant ${existingTenant.name} already has demo data.`);
    return;
  }

  const passwordHash = await bcrypt.hash("OctaveDemo123!", 10);

  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo-agency" },
    update: {},
    create: {
      name: "Octave Digital Studio",
      slug: "demo-agency",
      plan: "growth",
      companyProfile: "Octave Digital Studio is a digital marketing agency helping Indian MSMEs plan campaigns, create approved content, and manage customer engagement.",
      websiteUrl: "https://octavecrm.example",
      websiteReference: "OctaveCRM provides campaign planning, approval workflows, content operations, inbox management, and channel analytics for agencies and MSMEs.",
      settings: {
        timezone: "Asia/Kolkata",
        approvalRequired: true,
        brandSafetyMode: "strict"
      }
    }
  });

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "owner@octavecrm.test" },
      update: {},
      create: { name: "Aarav Owner", email: "owner@octavecrm.test", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "creator@octavecrm.test" },
      update: {},
      create: { name: "Meera Creator", email: "creator@octavecrm.test", passwordHash }
    }),
    prisma.user.upsert({
      where: { email: "approver@octavecrm.test" },
      update: {},
      create: { name: "Nisha Approver", email: "approver@octavecrm.test", passwordHash }
    })
  ]);

  const [owner, creator, approver] = users;

  await Promise.all([
    prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: owner.id } },
      update: { role: Role.OWNER },
      create: { tenantId: tenant.id, userId: owner.id, role: Role.OWNER }
    }),
    prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: creator.id } },
      update: { role: Role.CONTENT_CREATOR },
      create: { tenantId: tenant.id, userId: creator.id, role: Role.CONTENT_CREATOR, invitedBy: owner.id }
    }),
    prisma.membership.upsert({
      where: { tenantId_userId: { tenantId: tenant.id, userId: approver.id } },
      update: { role: Role.APPROVER },
      create: { tenantId: tenant.id, userId: approver.id, role: Role.APPROVER, invitedBy: owner.id }
    })
  ]);

  const client = await prisma.client.create({
    data: {
      tenantId: tenant.id,
      name: "Northstar Foods",
      company: "Northstar Foods Pvt Ltd",
      contactPerson: "Riya Shah",
      email: "riya@northstar.test",
      phone: "+91 98765 43210",
      industry: "FMCG",
      notes: "Launching a premium millet snack range across India.",
      companyProfile: "Northstar Foods Pvt Ltd is an Indian FMCG company launching premium, clean-label millet snacks for modern retail and health-conscious consumers.",
      websiteUrl: "https://northstar.example",
      websiteReference: "The Northstar product range focuses on millet-based snacks, modern retail distribution, transparent product information, and Indian consumer markets.",
      connectedSocialAccounts: ["instagram:northstarfoods", "facebook:northstarfoods"]
    }
  });

  const campaign = await prisma.campaign.create({
    data: {
      tenantId: tenant.id,
      clientId: client.id,
      name: "Millet Snack Launch",
      objective: "Generate awareness and qualified leads for modern retail buyers.",
      targetAudience: "Urban health-conscious buyers, retail distributors, and food bloggers.",
      platforms: ["Instagram", "Facebook Pages", "LinkedIn", "Gmail"],
      budget: "450000",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2026-08-15"),
      status: CampaignStatus.ACTIVE,
      assignedUsers: [creator.id, approver.id],
      brandVoice: "Bright, credible, helpful, Indian-market aware",
      keywords: ["millets", "healthy snacking", "retail launch"],
      hashtags: ["#MilletSnacks", "#HealthyIndia", "#RetailReady"],
      assets: [{ name: "product-shoot.zip", type: "image-archive" }]
    }
  });

  await prisma.channelAccount.createMany({
    data: [
      {
        tenantId: tenant.id,
        provider: IntegrationProvider.GMAIL,
        accountName: "marketing@northstar.test",
        permissions: ["email.read", "email.send.approved"],
        lastSyncedAt: new Date()
      },
      {
        tenantId: tenant.id,
        provider: IntegrationProvider.INSTAGRAM,
        accountName: "@northstarfoods",
        permissions: ["posts.read", "comments.read", "posts.publish.approved"],
        lastSyncedAt: new Date()
      },
      {
        tenantId: tenant.id,
        provider: IntegrationProvider.LINKEDIN,
        accountName: "Northstar Foods",
        permissions: ["organization.read", "posts.publish.approved"],
        lastSyncedAt: new Date()
      }
    ]
  });

  const content = await prisma.contentItem.create({
    data: {
      tenantId: tenant.id,
      campaignId: campaign.id,
      createdById: creator.id,
      title: "Launch teaser carousel",
      contentType: "carousel",
      channels: ["Instagram", "Facebook Pages"],
      body: "Meet the snack that brings ancient grains into modern shelves. Northstar's new millet bites are clean-label, retail-ready, and made for India's next wave of conscious snackers.",
      prompt: "Create a launch teaser for millet snacks",
      tone: "Professional and warm",
      status: ContentStatus.PENDING_APPROVAL,
      aiMetadata: {
        agent: "Content Writer Agent",
        provider: "paperclip",
        approvalRequired: true
      },
      brandVoiceScore: 91
    }
  });

  await prisma.contentVersion.create({
    data: {
      tenantId: tenant.id,
      contentItemId: content.id,
      version: 1,
      body: content.body,
      editedById: creator.id,
      changeSummary: "AI draft edited for retail audience."
    }
  });

  const approval = await prisma.approvalRequest.create({
    data: {
      tenantId: tenant.id,
      contentItemId: content.id,
      requestedById: creator.id,
      approverId: approver.id,
      status: ApprovalStatus.PENDING
    }
  });

  await prisma.approvalComment.create({
    data: {
      tenantId: tenant.id,
      approvalRequestId: approval.id,
      userId: creator.id,
      body: "Please verify product claims before scheduling."
    }
  });

  await prisma.scheduledPost.create({
    data: {
      tenantId: tenant.id,
      campaignId: campaign.id,
      contentItemId: content.id,
      provider: IntegrationProvider.INSTAGRAM,
      payload: { caption: content.body, media: ["product-shot-1.jpg"] },
      scheduledAt: new Date("2026-07-05T10:30:00+05:30"),
      status: "waiting_for_approval"
    }
  });

  await prisma.inboxItem.createMany({
    data: [
      {
        tenantId: tenant.id,
        provider: IntegrationProvider.GMAIL,
        type: InboxType.EMAIL,
        senderName: "Retail Buyer",
        senderHandle: "buyer@retail.test",
        subject: "Interested in millet snack range",
        body: "Can you send distributor pricing and shelf-life information?",
        sentiment: "positive",
        urgency: "high",
        aiSummary: "Buyer is asking for pricing and shelf-life details.",
        suggestedReply: "Share catalog, pricing slab, and propose a quick call."
      },
      {
        tenantId: tenant.id,
        provider: IntegrationProvider.INSTAGRAM,
        type: InboxType.COMMENT,
        senderName: "Food Blogger",
        senderHandle: "@snackreviewer",
        body: "Are these gluten-free?",
        sentiment: "curious",
        urgency: "medium",
        aiSummary: "Potential influencer asks about product claim.",
        suggestedReply: "Answer only after claim is verified by the brand team."
      }
    ]
  });

  await prisma.template.createMany({
    data: [
      {
        tenantId: tenant.id,
        name: "Launch Announcement",
        type: "social-post",
        body: "Introducing {{product}}: built for {{audience}} and ready for {{channel}}.",
        tags: ["launch", "social", "awareness"],
        createdById: creator.id
      },
      {
        tenantId: tenant.id,
        name: "Retail Buyer Email",
        type: "email",
        body: "Hi {{name}}, sharing the product sheet and pricing range for {{product}}.",
        tags: ["email", "sales", "retail"],
        createdById: creator.id
      }
    ]
  });

  await prisma.task.createMany({
    data: [
      {
        tenantId: tenant.id,
        campaignId: campaign.id,
        contentItemId: content.id,
        clientId: client.id,
        assignedUserId: approver.id,
        title: "Approve launch teaser",
        description: "Check claims and approve schedule.",
        dueDate: new Date("2026-07-02"),
        priority: Priority.HIGH,
        status: TaskStatus.TODO
      },
      {
        tenantId: tenant.id,
        campaignId: campaign.id,
        clientId: client.id,
        assignedUserId: creator.id,
        title: "Prepare influencer reply templates",
        priority: Priority.MEDIUM,
        status: TaskStatus.IN_PROGRESS
      }
    ]
  });

  await Promise.all(
    paperclipAgentTypes.map((agentType) =>
      prisma.agentConfig.upsert({
        where: { tenantId_agentType: { tenantId: tenant.id, agentType } },
        update: {},
        create: {
          tenantId: tenant.id,
          agentType,
          enabled: true,
          provider: "paperclip",
          endpoint: process.env.PAPERCLIP_ENDPOINT || "http://paperclip:8080",
          modelName: "paperclip-marketing-v1",
          temperature: "0.7",
          maxTokens: 1400,
          approvalRequired: true
        }
      })
    )
  );

  await prisma.auditLog.createMany({
    data: [
      {
        tenantId: tenant.id,
        userId: creator.id,
        action: AuditAction.AI_CONTENT_GENERATED,
        entityType: "ContentItem",
        entityId: content.id,
        metadata: { agent: "Content Writer Agent", approvalRequired: true }
      },
      {
        tenantId: tenant.id,
        userId: creator.id,
        action: AuditAction.APPROVAL_REQUESTED,
        entityType: "ApprovalRequest",
        entityId: approval.id,
        metadata: { contentItemId: content.id }
      },
      {
        tenantId: tenant.id,
        userId: owner.id,
        action: AuditAction.INTEGRATION_CONNECTED,
        entityType: "ChannelAccount",
        metadata: { provider: "GMAIL" }
      }
    ]
  });

  console.log(`Seeded tenant ${tenant.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
