import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { CompanyProfileForm } from "@/components/settings/company-profile-form";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { tenantId } = await getTenantContext();
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: { companyProfile: true, websiteUrl: true, websiteReference: true }
  });

  return (
    <>
      <PageHeader title="Settings" description="Tenant settings, API keys, AI provider configuration, storage, and approval policy." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Authoritative AI source</CardTitle></CardHeader>
          <CardContent>
            <CompanyProfileForm
              initialProfile={{
                companyProfile: tenant.companyProfile ?? "",
                websiteUrl: tenant.websiteUrl ?? "",
                websiteReference: tenant.websiteReference ?? ""
              }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>AI settings</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Input placeholder="Default AI provider: Paperclip" />
            <Input placeholder="Paperclip endpoint" />
            <Input placeholder="Local LLM endpoint" />
            <Input placeholder="Model name" />
            <p className="text-sm text-muted-foreground">Approval required for publishing actions is enabled by default and locked.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Integration credentials</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Input placeholder="COMPOSIO_API_KEY is set in environment variables" disabled />
            <Input placeholder="S3 endpoint or local storage path" />
            <Input placeholder="Webhook signing secret" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
