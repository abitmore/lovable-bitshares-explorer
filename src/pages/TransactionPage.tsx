import { useParams, Link } from "react-router-dom";
import { useBlock } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { OperationCards } from "@/components/OperationDisplay";

export default function TransactionPage() {
  const { blockNum, txIndex } = useParams();
  const num = Number(blockNum);
  const idx = Number(txIndex);
  const { data: block, isLoading } = useBlock(num || undefined);

  const tx = block?.transactions?.[idx];

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink asChild><Link to={`/block/${num}`}>Block #{num}</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>TX #{idx}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold">Transaction #{idx} in Block #{num}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      ) : !tx ? (
        <p className="text-muted-foreground">Transaction not found</p>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Transaction Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex flex-col sm:flex-row gap-1">
                <span className="font-medium text-muted-foreground w-48 shrink-0">Block</span>
                <Link to={`/block/${num}`} className="text-primary hover:underline">#{num}</Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-1">
                <span className="font-medium text-muted-foreground w-48 shrink-0">Operations</span>
                <span>{tx.operations?.length ?? 0}</span>
              </div>
            </CardContent>
          </Card>

          {tx.operations && <OperationCards operations={tx.operations} />}
        </div>
      )}
    </div>
  );
}
