import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { detectSearchType } from "@/lib/bitshares-api";

interface SearchBarProps {
  compact?: boolean;
}

export function SearchBar({ compact }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
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
      case "object":
        // Try to route based on object type
        if (trimmed.startsWith("1.2.")) navigate(`/account/${trimmed}`);
        else if (trimmed.startsWith("1.3.")) navigate(`/asset/${trimmed}`);
        else navigate(`/account/${trimmed}`);
        break;
    }
    setQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={compact ? "Search..." : "Search by block #, account name, or asset symbol..."}
        className={compact ? "h-9" : "h-12 text-base"}
      />
      <Button type="submit" size={compact ? "sm" : "lg"} variant="default">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
