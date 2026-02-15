import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { detectSearchType, searchTransactionById } from "@/lib/bitshares-api";
import { toast } from "sonner";

interface SearchBarProps {
  compact?: boolean;
}

export function SearchBar({ compact }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const type = detectSearchType(trimmed);
    switch (type) {
      case "block":
        navigate(`/block/${trimmed}`);
        break;
      case "account":
        navigate(`/account/${trimmed}`);
        break;
      case "asset":
        navigate(`/asset/${trimmed}`);
        break;
      case "txid":
        setSearching(true);
        try {
          const result = await searchTransactionById(trimmed);
          if (result) {
            // Pre-populate the react-query cache so TransactionPage renders instantly
            queryClient.setQueryData(
              ["txOpsES", result.block_num, result.trx_in_block],
              { txid: result.txid, operations: result.operations }
            );
            navigate(`/block/${result.block_num}/tx/${result.trx_in_block}`);
          } else {
            toast.error("Transaction not found");
          }
        } catch {
          toast.error("Failed to search for transaction");
        } finally {
          setSearching(false);
        }
        break;
      case "object":
        if (trimmed.startsWith("1.2.")) navigate(`/account/${trimmed}`);
        else if (trimmed.startsWith("1.3.")) navigate(`/asset/${trimmed}`);
        else navigate(`/object/${trimmed}`);
        break;
    }
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={compact ? "Search..." : "Search by block #, account, asset, or TXID..."}
        className={compact ? "h-9" : "h-12 text-base"}
      />
      <Button type="submit" size={compact ? "sm" : "lg"} variant="default" disabled={searching}>
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
