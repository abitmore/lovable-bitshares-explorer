import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getObjects } from "@/lib/bitshares-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ObjectPage() {
  const { objectId } = useParams<{ objectId: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["object", objectId],
    queryFn: () => getObjects([objectId!]),
    enabled: !!objectId,
    select: (result: any[]) => result?.[0] ?? null,
  });

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading object...</div>;
  }

  if (error || data === null) {
    return <div className="text-center py-12 text-destructive">Object not found: {objectId}</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold font-mono">{objectId}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Object Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono whitespace-pre-wrap break-all bg-muted p-4 rounded-md overflow-auto max-h-[70vh]">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
