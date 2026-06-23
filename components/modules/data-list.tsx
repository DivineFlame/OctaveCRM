import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type DataListItem = {
  title: string;
  subtitle: string;
  meta?: string;
  right?: React.ReactNode;
};

export function DataList({ title, items }: { title: string; items: DataListItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={`${item.title}-${item.subtitle}`} className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.subtitle}</p>
              {item.meta ? <p className="mt-2 text-xs text-muted-foreground">{item.meta}</p> : null}
            </div>
            {item.right}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
