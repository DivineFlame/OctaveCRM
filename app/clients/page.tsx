import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listClients } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { tenantId } = await getTenantContext();
  const clients = await listClients(tenantId);

  return (
    <>
      <PageHeader title="Clients" description="CRM-style client management with campaigns, social accounts, contacts, and reports." actionLabel="Add Client" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader><CardTitle>{client.company}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{client.contactPerson} · {client.email}</p>
              <p className="text-muted-foreground">{client.industry}</p>
              <p className="text-muted-foreground">{client.notes}</p>
              <p className="font-medium">{client.campaigns.length} campaigns assigned</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
