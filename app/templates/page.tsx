import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listTemplates } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const { tenantId } = await getTenantContext();
  const templates = await listTemplates(tenantId);

  return (
    <>
      <PageHeader title="Templates" description="Reusable campaign, email, social post, hashtag, brand voice, and approval checklist templates." actionLabel="New Template" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge>{template.type}</Badge>
              <p className="mt-3 text-sm text-muted-foreground">{template.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
