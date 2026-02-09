import { Link } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { useDynamicGlobalProperties, useBlock } from "@/hooks/use-bitshares";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: dgp, isLoading } = useDynamicGlobalProperties();
  const headBlockNum = dgp?.head_block_number;

  // Fetch last 10 blocks
  const blockNumbers = headBlockNum
    ? Array.from({ length: 10 }, (_, i) => headBlockNum - i)
    : [];

  return (
    <div className="space-y-8">
      {/* Hero search */}
      <section className="text-center py-12 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">BitShares Blockchain Explorer</h1>
        <p className="text-muted-foreground">
          Search for blocks, accounts, and assets on the BitShares network
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Head Block" value={isLoading ? undefined : `#${dgp?.head_block_number}`} />
        <StatCard label="Current Witness" value={isLoading ? undefined : dgp?.current_witness} />
        <StatCard label="Time" value={isLoading ? undefined : dgp?.time?.replace("T", " ")} />
      </section>

      {/* Latest blocks */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Latest Blocks</h2>
        <div className="space-y-2">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))
            : blockNumbers.map((num) => <BlockRow key={num} blockNum={num} />)}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {value ? (
          <p className="text-lg font-semibold truncate">{value}</p>
        ) : (
          <Skeleton className="h-6 w-32" />
        )}
      </CardContent>
    </Card>
  );
}

function BlockRow({ blockNum }: { blockNum: number }) {
  const { data: block } = useBlock(blockNum);

  return (
    <Link
      to={`/block/${blockNum}`}
      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      <div className="flex items-center gap-4">
        <span className="font-mono font-semibold text-primary">#{blockNum}</span>
        {block ? (
          <span className="text-sm text-muted-foreground">
            {block.timestamp?.replace("T", " ")}
          </span>
        ) : (
          <Skeleton className="h-4 w-32" />
        )}
      </div>
      <div>
        {block ? (
          <span className="text-sm text-muted-foreground">
            {block.transactions?.length ?? 0} txns
          </span>
        ) : (
          <Skeleton className="h-4 w-12" />
        )}
      </div>
    </Link>
  );
}
