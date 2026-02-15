import { useParams, Link } from "react-router-dom";
import { useTransactionOperationsES } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { OperationCards } from "@/components/OperationDisplay";
import { useMemo } from "react";
import { BlockNumSchema, TxIndexSchema } from "@/lib/validation";

export default function TransactionPage() {
  const { blockNum, txIndex } = useParams();
  const parsedBlock = BlockNumSchema.safeParse(blockNum);
  const parsedTx = TxIndexSchema.safeParse(txIndex);
  const num = parsedBlock.success ? parsedBlock.data : 0;
  const idx = parsedTx.success ? parsedTx.data : 0;
  const isValid = parsedBlock.success && parsedTx.success;

  const { data: txData, isLoading } = useTransactionOperationsES(isValid ? num : undefined, isValid ? idx : undefined);

  const operations = useMemo(() => txData?.operations.map(o => o.op) ?? [], [txData]);
  const meta = useMemo(() => txData?.operations.map(o => ({
    block_num: num,
    trx_in_block: idx,
    is_virtual: o.is_virtual,
  })) ?? [], [txData, num, idx]);

  if (!isValid) {
    return <p className="text-destructive">Invalid block number or transaction index</p>;
  }

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
      ) : operations.length === 0 ? (
        <p className="text-muted-foreground">Transaction not found</p>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Transaction Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {txData?.txid && (
                <div className="flex flex-col sm:flex-row gap-1">
                  <span className="font-medium text-muted-foreground w-48 shrink-0">TXID</span>
                  <span className="font-mono text-xs break-all">{txData.txid}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-1">
                <span className="font-medium text-muted-foreground w-48 shrink-0">Block</span>
                <Link to={`/block/${num}`} className="text-primary hover:underline">#{num}</Link>
              </div>
              <div className="flex flex-col sm:flex-row gap-1">
                <span className="font-medium text-muted-foreground w-48 shrink-0">Operations</span>
                <span>{operations.length}</span>
              </div>
            </CardContent>
          </Card>

          <OperationCards operations={operations} meta={meta} />
        </div>
      )}
    </div>
  );
}
