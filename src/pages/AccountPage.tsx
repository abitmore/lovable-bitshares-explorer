import { useParams, Link } from "react-router-dom";
import { useAccountByName, useAccountBalances, useAccountHistory, useAssets, useObjects } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { OperationCards } from "@/components/OperationDisplay";
import { useMemo } from "react";
import { AccountNameSchema, AccountIdSchema } from "@/lib/validation";

export default function AccountPage() {
  const { accountName } = useParams();

  const isId = AccountIdSchema.safeParse(accountName).success;
  const isValidName = isId || AccountNameSchema.safeParse(accountName).success;

  const { data: objectData } = useObjects(isId ? [accountName!] : []);
  const resolvedName = isId ? objectData?.[0]?.name : accountName;

  const { data: account, isLoading } = useAccountByName(isValidName ? resolvedName : undefined);
  const { data: balances } = useAccountBalances(account?.id);

  const assetIds = balances?.map((b: any) => b.asset_id) ?? [];
  const { data: assets } = useAssets(assetIds);

  const { data: history } = useAccountHistory(account?.id);

  // Convert history entries to operations format for OperationCards
  const operations = useMemo(() => {
    if (!history || history.length === 0) return undefined;
    return history.map((entry: any) => entry.op as [number, any]);
  }, [history]);

  // Build metadata from history entries (block_time is included in API response)
  const operationMeta = useMemo(() => {
    if (!history) return undefined;
    return history.map((entry: any) => ({
      block_num: entry.block_num as number,
      trx_in_block: entry.trx_in_block as number,
      timestamp: entry.block_time?.replace("T", " "),
    }));
  }, [history]);

  if (!isValidName) {
    return <p className="text-destructive">Invalid account name</p>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Account: {resolvedName ?? accountName}</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold">Account: {resolvedName ?? accountName}</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-full" />)}
        </div>
      ) : !account ? (
        <p className="text-muted-foreground">Account not found</p>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Account Info</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <InfoRow label="Name" value={account.name} />
              <InfoRow label="ID" value={account.id} />
              <InfoRow label="Registrar" value={account.registrar} />
              <InfoRow label="Referrer" value={account.referrer} />
              <InfoRow label="Membership Expiration" value={account.membership_expiration_date?.replace("T", " ")} />
            </CardContent>
          </Card>

          {balances && balances.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Balances</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {balances.map((bal: any, i: number) => {
                    const asset = assets?.find((a: any) => a.id === bal.asset_id);
                    const precision = asset?.precision ?? 0;
                    const amount = (Number(bal.amount) / Math.pow(10, precision)).toLocaleString(undefined, {
                      maximumFractionDigits: precision,
                    });
                    return (
                      <div key={i} className="flex justify-between items-center p-2 rounded border border-border">
                        <Link to={`/asset/${asset?.symbol ?? bal.asset_id}`} className="text-primary hover:underline font-medium">
                          {asset?.symbol ?? bal.asset_id}
                        </Link>
                        <span className="font-mono">{amount}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {operations && operations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              <OperationCards operations={operations} meta={operationMeta} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-1">
      <span className="font-medium text-muted-foreground w-48 shrink-0">{label}</span>
      <span className="break-all">{value ?? "—"}</span>
    </div>
  );
}
