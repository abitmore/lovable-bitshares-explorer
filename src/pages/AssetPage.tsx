import { useParams, Link } from "react-router-dom";
import { useAssetBySymbol, useObjects, useAssetHolders, useAccounts } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssetSymbolSchema, AssetIdSchema } from "@/lib/validation";

export default function AssetPage() {
  const { assetSymbol } = useParams();

  const isId = AssetIdSchema.safeParse(assetSymbol).success;
  const isValid = isId || AssetSymbolSchema.safeParse(assetSymbol).success;

  const { data: objectData } = useObjects(isId ? [assetSymbol!] : []);
  const resolvedSymbol = isId ? objectData?.[0]?.symbol : assetSymbol;

  const { data: asset, isLoading } = useAssetBySymbol(isValid ? resolvedSymbol?.toUpperCase() : undefined);

  const assetId = asset?.id as string | undefined;
  const dynamicId = assetId ? `2.3.${assetId.split('.')[2]}` : undefined;
  const issuerId = asset?.issuer as string | undefined;
  const { data: dynamicData } = useObjects(dynamicId ? [dynamicId] : []);
  const { data: issuerData } = useObjects(issuerId ? [issuerId] : []);
  const issuerName = issuerData?.[0]?.name ?? asset?.issuer;
  const { data: holders, isLoading: holdersLoading } = useAssetHolders(assetId);

  const holderAccountIds = holders?.map(h => h.account_id).filter(Boolean) ?? [];
  const { data: holderAccounts } = useAccounts(holderAccountIds);

  const accountMap = new Map<string, string>();
  if (holderAccounts) {
    for (const acc of holderAccounts) {
      if (acc?.id && acc?.name) accountMap.set(acc.id, acc.name);
    }
  }

  if (!isValid) {
    return <p className="text-destructive">Invalid asset symbol</p>;
  }

  const precision = asset?.precision ?? 0;
  const divisor = Math.pow(10, precision);
  const maxSupply = asset?.options?.max_supply
    ? (Number(asset.options.max_supply) / divisor).toLocaleString()
    : "—";
  const dynamicObj = dynamicData?.[0];
  const currentSupplyRaw = dynamicObj?.current_supply ? Number(dynamicObj.current_supply) : 0;
  const currentSupply = currentSupplyRaw ? (currentSupplyRaw / divisor).toLocaleString() : undefined;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Asset: {resolvedSymbol ?? assetSymbol}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold">Asset: {resolvedSymbol ?? assetSymbol}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      ) : !asset ? (
        <p className="text-muted-foreground">Asset not found</p>
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="text-lg">Asset Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Symbol" value={asset.symbol} />
              <InfoRow label="ID" value={asset.id} />
              <InfoRow label="Precision" value={String(asset.precision)} />
              <InfoRow label="Issuer" value={issuerName} link={`/account/${issuerName}`} />
              <InfoRow label="Max Supply" value={maxSupply} />
              {currentSupply && <InfoRow label="Current Supply" value={currentSupply} />}
              <InfoRow label="Description" value={
                asset.options?.description
                  ? (() => { try { return JSON.parse(asset.options.description)?.main ?? asset.options.description; } catch { return asset.options.description; } })()
                  : "—"
              } />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Top Holders</CardTitle></CardHeader>
            <CardContent>
              {holdersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
                </div>
              ) : !holders || holders.length === 0 ? (
                <p className="text-muted-foreground text-sm">No holder data available</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">% of Supply</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holders.map((h, i) => {
                      const name = accountMap.get(h.account_id);
                      const bal = h.balance / divisor;
                      const pct = currentSupplyRaw > 0 ? (h.balance / currentSupplyRaw) * 100 : 0;
                      return (
                        <TableRow key={h.account_id}>
                          <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                          <TableCell>
                            <Link to={`/account/${name ?? h.account_id}`} className="text-primary hover:underline">
                              {name ?? h.account_id}
                            </Link>
                          </TableCell>
                          <TableCell className="text-right font-mono">{bal.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono">{pct.toFixed(2)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value, link }: { label: string; value?: string; link?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1">
      <span className="font-medium text-muted-foreground w-48 shrink-0">{label}</span>
      {link ? (
        <Link to={link} className="text-primary hover:underline break-all">{value}</Link>
      ) : (
        <span className="break-all">{value ?? "—"}</span>
      )}
    </div>
  );
}