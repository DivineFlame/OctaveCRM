import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getTenantContext } from "@/lib/auth/tenant-context";
import { listTasks } from "@/lib/services/crud";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const { tenantId } = await getTenantContext();
  const tasks = await listTasks(tenantId);

  return (
    <>
      <PageHeader title="Tasks" description="Assign, prioritize, and link execution tasks to campaigns, clients, content, and inbox items." actionLabel="New Task" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader className="flex-row items-start justify-between">
              <CardTitle>{task.title}</CardTitle>
              <Badge tone={task.priority === "HIGH" || task.priority === "URGENT" ? "red" : "blue"}>{task.priority}</Badge>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">{task.description ?? "No description"}</p>
              <p className="mt-3">Assigned to: {task.assignedUser?.name ?? "Unassigned"}</p>
              <p>Status: {task.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
