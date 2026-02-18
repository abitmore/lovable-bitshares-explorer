import { useParams, Link } from "react-router-dom";
import { useBlock, useTransactionIds } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { BlockNumSchema } from "@/lib/validation";

export default function BlockPage() {
  const { blockNum } = useParams();
  const parsed = BlockNumSchema.safeParse(blockNum);
  const num = parsed.success ? parsed.data : 0;
  const { data: block, isLoading, error } = useBlock(num || undefined);
  const { data: txIds } = useTransactionIds(block?.transactions);

  if (!parsed.success) return <p className="text-destructive">Invalid block number</p>;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Block #{num}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Block #{num}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/block/${num - 1}`}><ChevronLeft className="h-4 w-4" /> Prev</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/block/${num + 1}`}>Next <ChevronRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      ) : error ? (
        <p className="text-destructive">Failed to load block</p>
      ) : block ? (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Block Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Timestamp" value={block.timestamp?.replace("T", " ")} />
              <InfoRow label="Witness" value={block.witness} />
              <InfoRow label="Previous" value={block.previous} mono />
              <InfoRow label="Transaction Merkle Root" value={block.transaction_merkle_root} mono />
              <InfoRow label="Transactions" value={String(block.transactions?.length ?? 0)} />
            </CardContent>
          </Card>

          {block.transactions?.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Transactions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {block.transactions.map((tx: any, idx: number) => (
                  <Link
                    key={idx}
                    to={`/block/${num}/tx/${idx}`}
                    className="block p-3 border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-primary">TX #{idx}</span>
                      <span className="text-sm text-muted-foreground">
                        {tx.operations?.length ?? 0} op{(tx.operations?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {txIds?.[idx] && (
                      <span className="font-mono text-xs text-muted-foreground break-all mt-1 block">{txIds[idx]}</span>
                    )}
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground">Block not found</p>
      )}
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="font-medium text-muted-foreground w-48 shrink-0">{label}</span>
      <span className={`break-all ${mono ? "font-mono text-xs" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}
