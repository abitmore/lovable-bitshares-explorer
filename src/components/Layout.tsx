import { Link, Outlet } from "react-router-dom";
import { Search } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="font-bold text-lg tracking-tight shrink-0">
            BitShares Explorer
          </Link>
          <div className="flex-1 max-w-md">
            <SearchBar compact />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
