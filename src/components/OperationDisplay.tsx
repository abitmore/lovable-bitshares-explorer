import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Plus, X, RefreshCw, UserPlus, Settings, TrendingUp } from "lucide-react";
import { useObjects } from "@/hooks/use-bitshares";
import { useMemo } from "react";

export const OP_NAMES: Record<number, string> = {
  0: "Transfer", 1: "Limit Order Create", 2: "Limit Order Cancel",
  3: "Call Order Update", 4: "Fill Order", 5: "Account Create",
  6: "Account Update", 7: "Account Whitelist", 8: "Account Upgrade",
  9: "Account Transfer", 10: "Asset Create", 11: "Asset Update",
  12: "Asset Update Bitasset", 13: "Asset Update Feed Producers",
  14: "Asset Issue", 15: "Asset Reserve", 16: "Asset Fund Fee Pool",
  17: "Asset Settle", 18: "Asset Global Settle", 19: "Asset Publish Feed",
  22: "Proposal Create", 23: "Proposal Update",
  33: "Vesting Balance Withdraw", 37: "Balance Claim",
};

const OP_ICONS: Record<number, React.ReactNode> = {
  0: <ArrowRight className="h-4 w-4" />,
  1: <Plus className="h-4 w-4" />,
  2: <X className="h-4 w-4" />,
  4: <RefreshCw className="h-4 w-4" />,
  5: <UserPlus className="h-4 w-4" />,
  6: <Settings className="h-4 w-4" />,
  10: <TrendingUp className="h-4 w-4" />,
};

export function AccountLink({ id, accounts }: { id: string; accounts: Record<string, any> }) {
  const acc = accounts[id];
  const name = acc?.name ?? id;
  return (
    <Link to={`/account/${name}`} className="text-primary hover:underline font-medium">
      {name}
    </Link>
  );
}

export function AssetAmount({ amount, assetId, assets }: { amount: string | number; assetId: string; assets: Record<string, any> }) {
  const asset = assets[assetId];
  const precision = asset?.precision ?? 0;
  const symbol = asset?.symbol ?? assetId;
  const value = Number(amount) / Math.pow(10, precision);
  return (
    <span className="font-semibold">
      {value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: precision })}{" "}
      <Link to={`/asset/${symbol}`} className="text-primary hover:underline">{symbol}</Link>
    </span>
  );
}

export function OperationDetail({ opType, opData, accounts, assets }: {
  opType: number; opData: any; accounts: Record<string, any>; assets: Record<string, any>;
}) {
  switch (opType) {
    case 0:
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <AccountLink id={opData.from} accounts={accounts} />
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <AccountLink id={opData.to} accounts={accounts} />
          <span className="text-muted-foreground">·</span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
          {opData.memo && <Badge variant="outline" className="text-xs">memo</Badge>}
        </div>
      );
    case 1:
      return (
        <div className="space-y-1 text-sm">
          <div><span className="text-muted-foreground">Seller:</span> <AccountLink id={opData.seller} accounts={accounts} /></div>
          <div><span className="text-muted-foreground">Selling:</span> <AssetAmount amount={opData.amount_to_sell.amount} assetId={opData.amount_to_sell.asset_id} assets={assets} /></div>
          <div><span className="text-muted-foreground">For at least:</span> <AssetAmount amount={opData.min_to_receive.amount} assetId={opData.min_to_receive.asset_id} assets={assets} /></div>
        </div>
      );
    case 2:
      return (
        <div className="text-sm">
          <AccountLink id={opData.fee_paying_account} accounts={accounts} />
          <span className="text-muted-foreground"> cancelled order </span>
          <span className="font-mono text-xs">{opData.order}</span>
        </div>
      );
    case 4:
      return (
        <div className="space-y-1 text-sm">
          <div><AccountLink id={opData.account_id} accounts={accounts} /></div>
          <div><span className="text-muted-foreground">Paid:</span> <AssetAmount amount={opData.pays.amount} assetId={opData.pays.asset_id} assets={assets} /></div>
          <div><span className="text-muted-foreground">Received:</span> <AssetAmount amount={opData.receives.amount} assetId={opData.receives.asset_id} assets={assets} /></div>
        </div>
      );
    case 5:
      return (
        <div className="text-sm">
          <AccountLink id={opData.registrar} accounts={accounts} />
          <span className="text-muted-foreground"> registered </span>
          <span className="font-semibold">{opData.name}</span>
        </div>
      );
    case 14:
      return (
        <div className="text-sm">
          <AccountLink id={opData.issuer} accounts={accounts} />
          <span className="text-muted-foreground"> issued </span>
          <AssetAmount amount={opData.asset_to_issue.amount} assetId={opData.asset_to_issue.asset_id} assets={assets} />
          <span className="text-muted-foreground"> to </span>
          <AccountLink id={opData.issue_to_account} accounts={accounts} />
        </div>
      );
    case 19:
      return (
        <div className="text-sm">
          <AccountLink id={opData.publisher} accounts={accounts} />
          <span className="text-muted-foreground"> published price feed for </span>
          <span className="font-mono text-xs">{opData.asset_id}</span>
        </div>
      );
    case 33:
      return (
        <div className="text-sm">
          <AccountLink id={opData.owner} accounts={accounts} />
          <span className="text-muted-foreground"> withdrew </span>
          <AssetAmount amount={opData.amount.amount} assetId={opData.amount.asset_id} assets={assets} />
        </div>
      );
    default:
      return (
        <pre className="text-xs font-mono bg-muted p-3 rounded-md overflow-auto max-h-48">
          {JSON.stringify(opData, null, 2)}
        </pre>
      );
  }
}

/** Extract all account (1.2.x) and asset (1.3.x) IDs from operations */
export function extractIds(operations: [number, any][]) {
  const accountIds = new Set<string>();
  const assetIds = new Set<string>();

  for (const [, data] of operations) {
    for (const [, val] of Object.entries(data)) {
      if (typeof val === "string") {
        if (/^1\.2\.\d+$/.test(val)) accountIds.add(val);
        if (/^1\.3\.\d+$/.test(val)) assetIds.add(val);
      }
      if (val && typeof val === "object" && "asset_id" in (val as any)) {
        assetIds.add((val as any).asset_id);
      }
    }
    if (data.fee?.asset_id) assetIds.add(data.fee.asset_id);
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
export function OperationCards({ operations, meta }: { operations: [number, any][]; meta?: { block_num: number; timestamp?: string }[] }) {
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