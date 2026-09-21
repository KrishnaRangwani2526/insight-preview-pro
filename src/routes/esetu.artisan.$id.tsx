import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ShieldCheck } from "lucide-react";
import { EsetuShell, Stars } from "@/components/EsetuShell";
import { artisanQuery } from "@/lib/esetu-queries";
import { rupees } from "@/lib/esetu-types";

export const Route = createFileRoute("/esetu/artisan/$id")({
  head: () => ({
    meta: [
      { title: "Artisan shop on E-Setu" },
      {
        name: "description",
        content: "The artisan's story, full catalogue and buyer reviews — order directly from their workshop.",
      },
      { property: "og:title", content: "Artisan shop on E-Setu" },
      { property: "og:description", content: "Catalogue, story and reviews from a verified Indian artisan." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArtisanPage,
});

function ArtisanPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery(artisanQuery(id));

  if (isLoading) {
    return (
      <EsetuShell>
        <p className="py-16 text-center text-[14px] text-muted-foreground">Loading…</p>
      </EsetuShell>
    );
  }
  if (!data?.artisan) {
    return (
      <EsetuShell>
        <p className="py-16 text-center text-[14px] text-muted-foreground">This shop is not open yet.</p>
      </EsetuShell>
    );
  }

  const { artisan, products, reviews } = data;

  return (
    <EsetuShell>
      <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
        <img
          src={artisan.photo ?? "/esetu/artisan-ramesh.jpg"}
          alt={artisan.name}
          className="size-20 rounded-2xl object-cover"
        />
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold leading-tight">{artisan.name}</h1>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="size-3.5" /> {artisan.city} · {artisan.craft}
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px]">
            <Stars rating={artisan.rating} />
            {artisan.verified.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-good">
                <ShieldCheck className="size-3" /> {v}
              </span>
            ))}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[14px] leading-relaxed">{artisan.about}</p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-muted px-3 py-3">
          <p className="text-[18px] font-bold">{artisan.orders_done}</p>
          <p className="text-[11px] text-muted-foreground">Orders completed</p>
        </div>
        <div className="rounded-2xl bg-muted px-3 py-3">
          <p className="text-[18px] font-bold">{artisan.on_time}%</p>
          <p className="text-[11px] text-muted-foreground">On time</p>
        </div>
        <div className="rounded-2xl bg-muted px-3 py-3">
          <p className="text-[18px] font-bold">{artisan.repeat_buyers}</p>
          <p className="text-[11px] text-muted-foreground">Repeat buyers</p>
        </div>
      </div>

      <h2 className="mt-8 text-[18px] font-bold">Catalogue</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.id}
            to="/esetu/product/$id"
            params={{ id: p.id }}
            className="overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md"
          >
            <img src={p.images[0] ?? ""} alt={p.title} className="aspect-square w-full object-cover" loading="lazy" />
            <div className="p-3">
              <p className="truncate text-[14px] font-semibold">{p.title}</p>
              <p className="mt-1 text-[15px] font-bold">{rupees(p.price)}</p>
            </div>
          </Link>
        ))}
        {!products.length && (
          <p className="col-span-full py-8 text-center text-[13px] text-muted-foreground">
            This shop has not added pieces yet.
          </p>
        )}
      </div>

      <h2 className="mt-8 text-[18px] font-bold">Reviews</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-card p-3">
            <p className="text-[13px] font-semibold">
              {r.buyer_name} <span className="text-muted-foreground">· {r.place}</span>
            </p>
            <Stars rating={r.rating} />
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{r.body}</p>
          </div>
        ))}
        {!reviews.length && <p className="text-[13px] text-muted-foreground">No reviews yet.</p>}
      </div>
    </EsetuShell>
  );
}
