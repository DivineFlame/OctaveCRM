import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";
import { paperclipAgentTypes } from "@/lib/types/domain";

export const dynamic = "force-dynamic";

export default async function AiAgentsPage() {
  const { tenantId } = await getTenantContext();
  const configs = await prisma.agentConfig.findMany({ where: { tenantId } });

  return (
    <>
      <PageHeader title="AI Agents" description="Configure Paperclip agents. Publishing and external sends always require approval." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {paperclipAgentTypes.map((agent) => {
          const config = configs.find((item) => item.agentType === agent);
          return (
            <Card key={agent}>
              <CardHeader className="flex-row items-start justify-between">
                <CardTitle>{agent}</CardTitle>
                <Badge tone={config?.enabled === false ? "default" : "green"}>{config?.enabled === false ? "Off" : "On"}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Provider: {config?.provider ?? "paperclip"}</p>
                <p>Model: {config?.modelName ?? "paperclip-marketing-v1"}</p>
                <p>Temperature: {String(config?.temperature ?? "0.7")}</p>
                <p className="font-medium text-foreground">Approval required: locked on</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
