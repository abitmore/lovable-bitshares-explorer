import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, X, RefreshCw, UserPlus, Settings, TrendingUp, Repeat, Shield, Award, Vote, Layers, Wallet, Lock, Unlock, Droplets, Coins } from "lucide-react";
import { useObjects } from "@/hooks/use-bitshares";
import { useMemo } from "react";
import { OP_NAMES } from "@/lib/operation-names";
import { AssetAmount } from "@/components/operations/OperationHelpers";
import { OperationDetail } from "@/components/operations/OperationDetail";

// Re-export for backward compatibility
export { OP_NAMES } from "@/lib/operation-names";
export { AccountLink, AssetAmount } from "@/components/operations/OperationHelpers";
export { OperationDetail } from "@/components/operations/OperationDetail";

const OP_ICONS: Record<number, React.ReactNode> = {
  0: <ArrowRight className="h-4 w-4" />,
  1: <Plus className="h-4 w-4" />,
  2: <X className="h-4 w-4" />,
  3: <TrendingUp className="h-4 w-4" />,
  4: <RefreshCw className="h-4 w-4" />,
  5: <UserPlus className="h-4 w-4" />,
  6: <Settings className="h-4 w-4" />,
  7: <Shield className="h-4 w-4" />,
  8: <Award className="h-4 w-4" />,
  9: <ArrowRight className="h-4 w-4" />,
  10: <TrendingUp className="h-4 w-4" />,
  14: <Coins className="h-4 w-4" />,
  17: <Wallet className="h-4 w-4" />,
  19: <TrendingUp className="h-4 w-4" />,
  20: <Vote className="h-4 w-4" />,
  22: <Layers className="h-4 w-4" />,
  25: <Unlock className="h-4 w-4" />,
  32: <Lock className="h-4 w-4" />,
  33: <Unlock className="h-4 w-4" />,
  37: <Wallet className="h-4 w-4" />,
  38: <Repeat className="h-4 w-4" />,
  45: <TrendingUp className="h-4 w-4" />,
  49: <Lock className="h-4 w-4" />,
  59: <Droplets className="h-4 w-4" />,
  61: <Droplets className="h-4 w-4" />,
  62: <Droplets className="h-4 w-4" />,
  63: <Droplets className="h-4 w-4" />,
  69: <Coins className="h-4 w-4" />,
  72: <Coins className="h-4 w-4" />,
  77: <Settings className="h-4 w-4" />,
};

/** Recursively extract all account (1.2.x) and asset (1.3.x) IDs from operations */
export function extractIds(operations: [number, any][]) {
  const accountIds = new Set<string>();
  const assetIds = new Set<string>();

  function scan(val: unknown) {
    if (typeof val === "string") {
      if (/^1\.2\.\d+$/.test(val)) accountIds.add(val);
      if (/^1\.3\.\d+$/.test(val)) assetIds.add(val);
    } else if (Array.isArray(val)) {
      for (const item of val) scan(item);
    } else if (val && typeof val === "object") {
      for (const v of Object.values(val as Record<string, unknown>)) {
        scan(v);
      }
    }
  }

  for (const [, data] of operations) {
    scan(data);
  }
  return { accountIds: [...accountIds], assetIds: [...assetIds] };
}

/** Hook that resolves account/asset IDs for a list of operations */
export function useResolvedOperations(operations: [number, any][] | undefined) {
  const { accountIds, assetIds } = useMemo(
    () => (operations ? extractIds(operations) : { accountIds: [], assetIds: [] }),
    [operations]
  );

  const { data: accountObjs } = useObjects(accountIds);
  const { data: assetObjs } = useObjects(assetIds);

  const accounts = useMemo(() => {
    const map: Record<string, any> = {};
    accountObjs?.forEach((a: any) => { if (a) map[a.id] = a; });
    return map;
  }, [accountObjs]);

  const assets = useMemo(() => {
    const map: Record<string, any> = {};
    assetObjs?.forEach((a: any) => { if (a) map[a.id] = a; });
    return map;
  }, [assetObjs]);

  return { accounts, assets };
}

/** Render a list of operations as cards */
export function OperationCards({ operations, meta }: { operations: [number, any][]; meta?: { block_num: number; trx_in_block?: number; timestamp?: string }[] }) {
  const { accounts, assets } = useResolvedOperations(operations);

  return (
    <>
      {operations.map((op, opIdx) => {
        const m = meta?.[opIdx];
        return (
          <Card key={opIdx}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-muted-foreground">{OP_ICONS[op[0]]}</span>
                {OP_NAMES[op[0]] ?? `Operation Type ${op[0]}`}
                <Badge variant="secondary" className="text-xs ml-auto">#{opIdx}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <OperationDetail opType={op[0]} opData={op[1]} accounts={accounts} assets={assets} />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t border-border">
                {op[1].fee && (
                  <span>Fee: <AssetAmount amount={op[1].fee.amount} assetId={op[1].fee.asset_id} assets={assets} /></span>
                )}
                {m && (
                  <>
                    <Link to={`/block/${m.block_num}`} className="text-primary hover:underline">
                      Block #{m.block_num.toLocaleString()}
                    </Link>
                    {m.trx_in_block != null && (
                      <>
                        <span>·</span>
                        <Link to={`/block/${m.block_num}/tx/${m.trx_in_block}`} className="text-primary hover:underline">
                          Tx #{m.trx_in_block}
                        </Link>
                      </>
                    )}
                    {m.timestamp && <span>{m.timestamp}</span>}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
