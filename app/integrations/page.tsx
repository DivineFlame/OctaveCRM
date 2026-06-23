import { IntegrationProvider } from "@prisma/client";
import { IntegrationCard } from "@/components/modules/integration-card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const providers = Object.values(IntegrationProvider);

export default async function IntegrationsPage() {
  const { tenantId } = await getTenantContext();
  const accounts = await prisma.channelAccount.findMany({ where: { tenantId } });

  return (
    <>
      <PageHeader title="Integrations" description="Connect channels through Composio.dev adapters with clear permissions and sync status." actionLabel="Connect Channel" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => {
          const account = accounts.find((item) => item.provider === provider);
          return (
            <IntegrationCard
              key={provider}
              provider={provider}
              connected={Boolean(account)}
              accountName={account?.accountName}
              lastSyncedAt={account?.lastSyncedAt}
              permissions={account?.permissions}
            />
          );
        })}
      </div>
    </>
  );
}
