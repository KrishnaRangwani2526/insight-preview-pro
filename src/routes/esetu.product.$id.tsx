import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, ShieldCheck, Clock, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EsetuShell, Stars } from "@/components/EsetuShell";
import { productQuery } from "@/lib/esetu-queries";
import { placeOrder } from "@/lib/esetu.functions";
import { rupees } from "@/lib/esetu-types";

export const Route = createFileRoute("/esetu/product/$id")({
  head: () => ({
    meta: [
      { title: "Handmade piece on E-Setu" },
      {
        name: "description",
        content: "See how this piece is made, who makes it, and buy it directly from the artisan's workshop.",
      },
      { property: "og:title", content: "Handmade piece on E-Setu" },
      {
        property: "og:description",
        content: "Materials, size, making time and the artisan behind the work.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(productQuery(id));
  const buy = useServerFn(placeOrder);

  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [shot, setShot] = useState(0);

  if (isLoading) {
    return (
      <EsetuShell>
        <p className="py-16 text-center text-[14px] text-muted-foreground">Loading…</p>
      </EsetuShell>
    );
  }
  if (!data?.product) {
    return (
      <EsetuShell>
        <p className="py-16 text-center text-[14px] text-muted-foreground">This piece is no longer listed.</p>
      </EsetuShell>
    );
  }

  const { product, artisan, reviews } = data;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await buy({
        data: { productId: product.id, quantity: qty, buyerName: name, buyerPhone: phone, city },
      });
      toast.success("Order placed", {
        description: "The artisan has it in their app already.",
      });
      navigate({ to: "/esetu/orders", search: { phone: res.phone } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not place the order.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <EsetuShell>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <img
            src={product.images[shot] ?? product.images[0]}
            alt={product.title}
            className="aspect-square w-full rounded-2xl border border-border object-cover"
          />
          <div className="mt-2 flex gap-2">
            {product.images.map((img, i) => (
              <button key={img} onClick={() => setShot(i)} className="shrink-0">
                <img
                  src={img}
                  alt=""
                  className={
                    i === shot
                      ? "size-16 rounded-xl border-2 border-primary object-cover"
                      : "size-16 rounded-xl border border-border object-cover"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-[22px] font-bold leading-tight">{product.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-[13px] text-muted-foreground">
            <MapPin className="size-3.5" /> {product.city} · {product.craft}
          </p>
          <p className="mt-3 text-[26px] font-bold">{rupees(product.price)}</p>
          <p className="text-[12px] text-muted-foreground">
            {rupees(product.bulk_price)} each for {product.moq}+ pieces
          </p>

          <p className="mt-3 text-[14px] leading-relaxed">{product.description}</p>

          <dl className="mt-4 grid grid-cols-2 gap-2 text-[13px]">
            <div className="rounded-xl bg-muted px-3 py-2">
              <dt className="text-[11px] text-muted-foreground">Materials</dt>
              <dd className="font-medium">{product.materials}</dd>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2">
              <dt className="text-[11px] text-muted-foreground">Size</dt>
              <dd className="font-medium">{product.size}</dd>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2">
              <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3" /> Making time
              </dt>
              <dd className="font-medium">{product.make_days} days</dd>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2">
              <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Package className="size-3" /> Ready now
              </dt>
              <dd className="font-medium">{product.stock > 0 ? `${product.stock} in stock` : "Made to order"}</dd>
            </div>
          </dl>

          {artisan && (
            <Link
              to="/esetu/artisan/$id"
              params={{ id: artisan.id }}
              className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <img src={artisan.photo ?? ""} alt={artisan.name} className="size-12 rounded-xl object-cover" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{artisan.name}</p>
                <p className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Stars rating={artisan.rating} />
                  <span className="inline-flex items-center gap-1 text-good">
                    <ShieldCheck className="size-3.5" /> Verified
                  </span>
                </p>
              </div>
            </Link>
          )}

          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <p className="text-[15px] font-bold">Buy now</p>
            <div className="mt-3 grid gap-2">
              <label className="text-[12px] font-medium text-muted-foreground">
                Quantity
                <input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground"
                />
              </label>
              <label className="text-[12px] font-medium text-muted-foreground">
                Your name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground"
                />
              </label>
              <label className="text-[12px] font-medium text-muted-foreground">
                Phone number
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground"
                />
              </label>
              <label className="text-[12px] font-medium text-muted-foreground">
                Delivery city
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-[14px] text-foreground"
                />
              </label>
            </div>
            <p className="mt-3 text-[13px] font-semibold">
              Total {rupees(product.price * Math.max(1, qty))}
            </p>
            <button
              onClick={submit}
              disabled={busy}
              className="mt-3 w-full rounded-xl bg-primary px-4 py-3 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Placing order…" : "Buy now"}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              The artisan sees this order in their app immediately.
            </p>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <>
          <h2 className="mt-9 text-[18px] font-bold">What buyers say</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  {r.buyer_name} <span className="text-muted-foreground">· {r.place}</span>
                </p>
                <Stars rating={r.rating} />
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </EsetuShell>
  );
}
