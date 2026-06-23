import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Tenant settings, API keys, AI provider configuration, storage, and approval policy." />
      <div className="grid gap-5 xl:grid-cols-2">
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
