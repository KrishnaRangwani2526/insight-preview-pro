import { Link } from "@tanstack/react-router";
import { Globe, PackageSearch, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";

export function EsetuShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/esetu" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary">
              <Globe className="size-5" />
            </span>
            <span className="text-[17px] font-bold leading-none">
              E-Setu
              <span className="block text-[11px] font-medium text-muted-foreground">
                Buy directly from artisans
              </span>
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-[13px] font-semibold">
            <Link
              to="/esetu"
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted"
              activeOptions={{ exact: true }}
              activeProps={{ className: "rounded-lg px-3 py-2 bg-muted text-foreground" }}
            >
              <PackageSearch className="mr-1 inline size-4" />
              Browse
            </Link>
            <Link
              to="/esetu/orders"
              search={{ phone: "" }}
              className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted"
              activeProps={{ className: "rounded-lg px-3 py-2 bg-muted text-foreground" }}
            >
              <ShoppingBag className="mr-1 inline size-4" />
              My orders
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-5">{children}</main>
      <footer className="border-t border-border/70 py-6 text-center text-[12px] text-muted-foreground">
        Every shop here is run by the artisan who makes the work.
      </footer>
    </div>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="text-[13px] font-semibold text-warn" aria-label={`${rating} out of 5`}>
      {"★".repeat(full)}
      <span className="text-muted-foreground">{"★".repeat(5 - full)}</span>
    </span>
  );
}
