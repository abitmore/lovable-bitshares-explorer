import { useParams, Link } from "react-router-dom";
import { useAccountByName, useAccountBalances, useAssets, useObjects, useAccountStatistics, useRelativeAccountHistory } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { OperationCards } from "@/components/OperationDisplay";
import { useMemo, useState } from "react";
import { AccountNameSchema, AccountIdSchema } from "@/lib/validation";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious, PaginationEllipsis,
} from "@/components/ui/pagination";

const PAGE_SIZE = 20;
const BALANCE_PAGE_SIZE = 10;

export default function AccountPage() {
  const { accountName } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [balancePage, setBalancePage] = useState(1);

  const isId = AccountIdSchema.safeParse(accountName).success;
  const isValidName = isId || AccountNameSchema.safeParse(accountName).success;

  const { data: objectData } = useObjects(isId ? [accountName!] : []);
  const resolvedName = isId ? objectData?.[0]?.name : accountName;

  const { data: account, isLoading } = useAccountByName(isValidName ? resolvedName : undefined);
  const { data: balances } = useAccountBalances(account?.id);

  const assetIds = balances?.map((b: any) => b.asset_id) ?? [];
  const { data: assets } = useAssets(assetIds);

  const registrarId = account?.registrar as string | undefined;
  const referrerId = account?.referrer as string | undefined;
  const idsToResolve = [registrarId, referrerId].filter(Boolean) as string[];
  const { data: resolvedAccounts } = useObjects(idsToResolve.length > 0 ? idsToResolve : []);
  const nameMap = new Map<string, string>();
  resolvedAccounts?.forEach((a: any) => { if (a?.id && a?.name) nameMap.set(a.id, a.name); });

  // Account statistics for pagination
  const { data: stats } = useAccountStatistics(account?.id);
  const totalOps = (stats?.total_ops as number) ?? 0;
  const removedOps = (stats?.removed_ops as number) ?? 0;
  const availableOps = totalOps - removedOps;
  const totalPages = Math.max(1, Math.ceil(availableOps / PAGE_SIZE));

  // Clamp page
  const page = Math.min(currentPage, totalPages);

  // Calculate start sequence number for get_relative_account_history
  // Most recent ops are at the highest sequence numbers
  // Page 1 = most recent, so start = totalOps (or 0 which means latest)
  // For page N, start = totalOps - (N-1) * PAGE_SIZE
  const start = totalOps > 0 ? totalOps - (page - 1) * PAGE_SIZE : 0;

  const { data: history, isLoading: historyLoading } = useRelativeAccountHistory(
    account?.id,
    start,
    PAGE_SIZE
  );

  // Convert history entries to operations format for OperationCards
  const operations = useMemo(() => {
    if (!history || history.length === 0) return undefined;
    return history.map((entry: any) => entry.op as [number, any]);
  }, [history]);

  const operationMeta = useMemo(() => {
    if (!history) return undefined;
    return history.map((entry: any) => ({
      block_num: entry.block_num as number,
      trx_in_block: entry.trx_in_block as number,
      timestamp: entry.block_time?.replace("T", " "),
      is_virtual: !!entry.is_virtual,
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
              <InfoRow label="Registrar" value={nameMap.get(account.registrar) ?? account.registrar} link={`/account/${nameMap.get(account.registrar) ?? account.registrar}`} />
              <InfoRow label="Referrer" value={nameMap.get(account.referrer) ?? account.referrer} link={`/account/${nameMap.get(account.referrer) ?? account.referrer}`} />
              <InfoRow label="Membership" value={account.membership_expiration_date?.startsWith("1970-01-01") ? "Basic Member" : "Lifetime Member"} />
            </CardContent>
          </Card>

          {balances && balances.length > 0 && (() => {
            const filteredBalances = balances.filter((bal: any) => {
              const asset = assets?.find((a: any) => a.id === bal.asset_id);
              return Number(bal.amount) !== 0 || asset?.symbol === "BTS" || bal.asset_id === "1.3.0";
            });
            if (filteredBalances.length === 0) return null;
            const totalBalancePages = Math.ceil(filteredBalances.length / BALANCE_PAGE_SIZE);
            const clampedBalancePage = Math.min(balancePage, totalBalancePages);
            const startIdx = (clampedBalancePage - 1) * BALANCE_PAGE_SIZE;
            const pagedBalances = filteredBalances.slice(startIdx, startIdx + BALANCE_PAGE_SIZE);
            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Balances</CardTitle>
                    {filteredBalances.length > BALANCE_PAGE_SIZE && (
                      <span className="text-sm text-muted-foreground">{filteredBalances.length} assets</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pagedBalances.map((bal: any, i: number) => {
                      const asset = assets?.find((a: any) => a.id === bal.asset_id);
                      const precision = asset?.precision ?? 0;
                      const amount = (Number(bal.amount) / Math.pow(10, precision)).toLocaleString(undefined, {
                        maximumFractionDigits: precision,
                      });
                      return (
                        <div key={startIdx + i} className="flex justify-between items-center p-2 rounded border border-border">
                          <Link to={`/asset/${asset?.symbol ?? bal.asset_id}`} className="text-primary hover:underline font-medium">
                            {asset?.symbol ?? bal.asset_id}
                          </Link>
                          <span className="font-mono">{amount}</span>
                        </div>
                      );
                    })}
                  </div>
                  {totalBalancePages > 1 && (
                    <div className="mt-4">
                      <HistoryPagination currentPage={clampedBalancePage} totalPages={totalBalancePages} onPageChange={setBalancePage} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })()}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Activity</h2>
              {availableOps > 0 && (
                <span className="text-sm text-muted-foreground">
                  {availableOps.toLocaleString()} operations available
                </span>
              )}
            </div>

            {historyLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : operations && operations.length > 0 ? (
              <OperationCards operations={operations} meta={operationMeta} />
            ) : (
              <p className="text-muted-foreground">No activity found</p>
            )}

            {totalPages > 1 && (
              <HistoryPagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryPagination({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {getPageNumbers().map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e${i}`}><PaginationEllipsis /></PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                isActive={p === currentPage}
                onClick={() => onPageChange(p)}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
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
