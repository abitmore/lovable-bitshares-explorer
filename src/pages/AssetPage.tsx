import { useParams, Link } from "react-router-dom";
import { useAssetBySymbol, useObjects } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function AssetPage() {
  const { assetSymbol } = useParams();

  // Support both symbol and ID (1.3.x)
  const isId = assetSymbol?.startsWith("1.3.");
  const { data: objectData } = useObjects(isId ? [assetSymbol!] : []);
  const resolvedSymbol = isId ? objectData?.[0]?.symbol : assetSymbol;

  const { data: asset, isLoading } = useAssetBySymbol(resolvedSymbol?.toUpperCase());

  const precision = asset?.precision ?? 0;
  const maxSupply = asset?.options?.max_supply
    ? (Number(asset.options.max_supply) / Math.pow(10, precision)).toLocaleString()
    : "—";
  const currentSupply = asset?.dynamic?.current_supply
    ? (Number(asset.dynamic.current_supply) / Math.pow(10, precision)).toLocaleString()
    : undefined;

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
        <Card>
          <CardHeader><CardTitle className="text-lg">Asset Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="Symbol" value={asset.symbol} />
            <InfoRow label="ID" value={asset.id} />
            <InfoRow label="Precision" value={String(asset.precision)} />
            <InfoRow label="Issuer" value={asset.issuer} link={`/account/${asset.issuer}`} />
            <InfoRow label="Max Supply" value={maxSupply} />
            {currentSupply && <InfoRow label="Current Supply" value={currentSupply} />}
            <InfoRow label="Description" value={
              asset.options?.description
                ? (() => { try { return JSON.parse(asset.options.description)?.main ?? asset.options.description; } catch { return asset.options.description; } })()
                : "—"
            } />
          </CardContent>
        </Card>
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
