import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Column = {
  title: string;
  items: { title: string; detail: string; status?: string }[];
};

export function StatusBoard({ columns }: { columns: Column[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {columns.map((column) => (
        <Card key={column.title}>
          <CardHeader>
            <CardTitle className="text-sm">{column.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {column.items.map((item) => (
              <div key={item.title} className="rounded-md border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.status ? <Badge tone="blue">{item.status}</Badge> : null}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
