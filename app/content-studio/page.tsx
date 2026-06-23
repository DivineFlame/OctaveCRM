import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ContentStudioPage() {
  const { tenantId } = await getTenantContext();
  const campaigns = await prisma.campaign.findMany({ where: { tenantId }, orderBy: { updatedAt: "desc" } });

  return (
    <>
      <PageHeader title="Content Studio" description="Generate, edit, preview, and send content for approval. AI cannot publish directly." actionLabel="Save Draft" />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Paperclip generation brief</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <select className="h-10 rounded-md border bg-background px-3 text-sm">
              {campaigns.map((campaign) => <option key={campaign.id}>{campaign.name}</option>)}
            </select>
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Channels: Instagram, LinkedIn" />
              <Input placeholder="Tone: professional" />
              <Input placeholder="Type: carousel, email, ad copy" />
            </div>
            <Textarea placeholder="Enter topic, campaign idea, or content prompt..." />
            <div className="flex flex-wrap gap-2">
              {["shorter", "longer", "professional", "casual", "persuasive", "Hindi", "Hinglish"].map((option) => (
                <Button key={option} variant="secondary" size="sm">{option}</Button>
              ))}
            </div>
            <Button className="w-fit">
              <Sparkles className="h-4 w-4" />
              Generate with Paperclip
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Channel preview and approval guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-background p-4">
              <p className="text-xs text-muted-foreground">LinkedIn preview · 2,847 characters remaining</p>
              <p className="mt-3 text-sm">
                Your AI-generated draft will appear here with hashtag suggestions, CTA options, brand voice score, and channel-specific limits.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Button variant="secondary">Save as draft</Button>
              <Button>Send for approval</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Publishing and sending are locked until an approver marks the item as Approved.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
