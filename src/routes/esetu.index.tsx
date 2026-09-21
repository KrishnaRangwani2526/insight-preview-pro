import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { EsetuShell, Stars } from "@/components/EsetuShell";
import { marketplaceQuery } from "@/lib/esetu-queries";
import { rupees } from "@/lib/esetu-types";

export const Route = createFileRoute("/esetu/")({
  head: () => ({
    meta: [
      { title: "E-Setu — buy handmade work directly from artisans" },
      {
        name: "description",
        content:
          "Browse pottery, textiles, woodwork, brass and more, made by verified Indian artisans. Buy now and follow your order from the maker's workshop to your door.",
      },
      { property: "og:title", content: "E-Setu — buy handmade work directly from artisans" },
      {
        property: "og:description",
        content: "A marketplace where every shop is run by the artisan who makes the work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Discover,
});

function Discover() {
  const { data, isLoading } = useQuery(marketplaceQuery);
  const [query, setQuery] = useState("");
  const [craft, setCraft] = useState("All");

  const products = data?.products ?? [];
  const artisans = data?.artisans ?? [];
  const crafts = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.craft).filter(Boolean)))],
    [products],
  );

  const shown = products.filter((p) => {
    const inCraft = craft === "All" || p.craft === craft;
    const text = `${p.title} ${p.city} ${p.materials} ${p.tags.join(" ")}`.toLowerCase();
    return inCraft && (!query.trim() || text.includes(query.trim().toLowerCase()));
  });

  return (
    <EsetuShell>
      <h1 className="text-[26px] font-bold leading-tight">Handmade, straight from the maker</h1>
      <p className="mt-1 text-[14px] text-muted-foreground">
        {products.length} pieces from {artisans.length} verified artisan workshops.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search vase, shawl, brass, Jaipur…"
          className="w-full bg-transparent text-[14px] outline-none"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {crafts.map((c) => (
          <button
            key={c}
            onClick={() => setCraft(c)}
            className={
              c === craft
                ? "shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground"
                : "shrink-0 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground"
            }
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-8 text-center text-[14px] text-muted-foreground">Loading the marketplace…</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {shown.map((p) => (
            <Link
              key={p.id}
              to="/esetu/product/$id"
              params={{ id: p.id }}
              className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
            >
              <img
                src={p.images[0] ?? "/esetu/product-pottery.jpg"}
                alt={p.title}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />
              <div className="p-3">
                <p className="truncate text-[14px] font-semibold">{p.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                  <MapPin className="size-3" /> {p.city}
                </p>
                <p className="mt-1.5 text-[15px] font-bold">{rupees(p.price)}</p>
              </div>
            </Link>
          ))}
          {!shown.length && (
            <p className="col-span-full py-10 text-center text-[14px] text-muted-foreground">
              Nothing matches that search yet.
            </p>
          )}
        </div>
      )}

      <h2 className="mt-9 text-[18px] font-bold">Artisan shops</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {artisans.map((a) => (
          <Link
            key={a.id}
            to="/esetu/artisan/$id"
            params={{ id: a.id }}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-md"
          >
            <img
              src={a.photo ?? "/esetu/artisan-ramesh.jpg"}
              alt={a.name}
              className="size-14 rounded-xl object-cover"
              loading="lazy"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold">{a.name}</p>
              <p className="truncate text-[12px] text-muted-foreground">
                {a.craft} · {a.city}
              </p>
              <p className="mt-1 flex items-center gap-2 text-[12px]">
                <Stars rating={a.rating} />
                <span className="inline-flex items-center gap-1 text-good">
                  <ShieldCheck className="size-3.5" /> Verified
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </EsetuShell>
  );
}
