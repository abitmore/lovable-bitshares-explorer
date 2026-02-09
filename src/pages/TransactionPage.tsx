import { useParams, Link } from "react-router-dom";
import { useBlock } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const OP_NAMES: Record<number, string> = {
  0: "Transfer",
  1: "Limit Order Create",
  2: "Limit Order Cancel",
  3: "Call Order Update",
  4: "Fill Order",
  5: "Account Create",
  6: "Account Update",
  7: "Account Whitelist",
  8: "Account Upgrade",
  9: "Account Transfer",
  10: "Asset Create",
  11: "Asset Update",
  12: "Asset Update Bitasset",
  13: "Asset Update Feed Producers",
  14: "Asset Issue",
  15: "Asset Reserve",
  16: "Asset Fund Fee Pool",
  17: "Asset Settle",
  18: "Asset Global Settle",
  19: "Asset Publish Feed",
  22: "Proposal Create",
  23: "Proposal Update",
  33: "Vesting Balance Withdraw",
  37: "Balance Claim",
};

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

          {tx.operations?.map((op: [number, any], opIdx: number) => (
            <Card key={opIdx}>
              <CardHeader>
                <CardTitle className="text-base">
                  {OP_NAMES[op[0]] ?? `Operation Type ${op[0]}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-64">
                  {JSON.stringify(op[1], null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
