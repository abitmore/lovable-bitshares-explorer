import { Link } from "react-router-dom";

/** Link to an account page, resolving ID to name */
export function AccountLink({ id, accounts }: { id: string; accounts: Record<string, any> }) {
  const acc = accounts[id];
  const name = acc?.name ?? id;
  return (
    <Link to={`/account/${name}`} className="text-primary hover:underline font-medium">
      {name}
    </Link>
  );
}

/** Display a formatted asset amount with link to asset page */
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

/** Display a generic object ID as monospaced text */
export function ObjectId({ id }: { id: string }) {
  return <span className="font-mono text-xs text-muted-foreground">{id}</span>;
}

/** Label + value row used in operation details */
export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      {children}
    </div>
  );
}
