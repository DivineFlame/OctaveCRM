export const roles = [
  "OWNER",
  "ADMIN",
  "MANAGER",
  "CONTENT_CREATOR",
  "APPROVER",
  "ANALYST",
  "CLIENT_VIEWER"
] as const;

export const integrationProviders = [
  "GMAIL",
  "FACEBOOK_PAGES",
  "INSTAGRAM",
  "META_ADS",
  "LINKEDIN",
  "X_TWITTER",
  "WHATSAPP_BUSINESS",
  "YOUTUBE",
  "WEBSITE_BLOG",
  "CUSTOM_WEBHOOK"
] as const;

export const paperclipAgentTypes = [
  "Content Strategy Agent",
  "Content Writer Agent",
  "Hashtag Agent",
  "SEO Agent",
  "Email Assistant Agent",
  "Social Inbox Reader Agent",
  "Competitor Research Agent",
  "Campaign Planner Agent",
  "Performance Analyst Agent",
  "Approval Recommendation Agent"
] as const;

export type IntegrationProviderKey = (typeof integrationProviders)[number];
export type PaperclipAgentType = (typeof paperclipAgentTypes)[number];

export type TenantContext = {
  tenantId: string;
  userId?: string;
  role?: string;
};
