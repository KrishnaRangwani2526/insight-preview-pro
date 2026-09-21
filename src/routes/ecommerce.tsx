import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ShoppingBag,
  Boxes,
  ClipboardList,
  Store,
  Rocket,
  ExternalLink,
  ShieldCheck,
  Star,
  Phone,
  MapPin,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Card, PageHeader, SectionLabel, productImage } from "@/components/ui-kit";
import { useApp, inr } from "@/lib/store";
import { artisanOrdersQuery, myShopQuery } from "@/lib/esetu-queries";
import { publishShop, setOrderStage } from "@/lib/esetu.functions";
import { artisanSlug, ORDER_STAGES, STAGE_LABEL, type OrderStage } from "@/lib/esetu-types";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/ecommerce")({
  head: () => ({
    meta: [
      { title: "E-Commerce — your shop, stock and orders" },
      {
        name: "description",
        content:
          "One place for your stock, your E-Setu orders and your shop profile. Publish your whole catalogue to the E-Setu marketplace with a single tap.",
      },
      { property: "og:title", content: "E-Commerce — your shop, stock and orders" },
      {
        property: "og:description",
        content: "Stock, orders, catalogue and reviews in one simple screen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ECommerce,
});

type Tab = "orders" | "inventory" | "shop";

const NEXT_STAGE: Partial<Record<OrderStage, OrderStage>> = {
  artisan_notified: "artisan_accepted",
  artisan_accepted: "in_making",
  artisan_chosen: "in_making",
  in_making: "shipped",
  shipped: "out_for_delivery",
  out_for_delivery: "delivered",
};

const NEXT_LABEL: Partial<Record<OrderStage, string>> = {
  artisan_notified: "Accept this order",
  artisan_accepted: "Start making",
  artisan_chosen: "Start making",
  in_making: "Mark as shipped",
  shipped: "Out for delivery",
  out_for_delivery: "Mark delivered",
};

function coverFor(p: Product) {
  if (p.enhancedImage && p.enhancedImage.length < 400000) return p.enhancedImage;
  return productImage(p.image);
}

function ECommerce() {
  const { state } = useApp();
  const business = state.business;
  const artisanId = artisanSlug(business.name);
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>("orders");
  const [publishing, setPublishing] = useState(false);

  const publish = useServerFn(publishShop);
  const advance = useServerFn(setOrderStage);

  const shop = useQuery(myShopQuery(artisanId));
  const orders = useQuery(artisanOrdersQuery(artisanId));

  const active = useMemo(() => state.products.filter((p) => p.status === "active"), [state.products]);
  const publishedIds = new Set((shop.data?.products ?? []).map((p) => p.id));
  const notPublished = active.filter((p) => !publishedIds.has(`${artisanId}--${p.id}`));
  const live = Boolean(shop.data?.artisan);

  const onePublish = async () => {
    setPublishing(true);
    try {
      const res = await publish({
        data: {
          artisan: {
            id: artisanId,
            name: business.name,
            craft: business.category,
            city: `${business.village}, ${business.district}, ${business.state}`,
            photo: null,
            about: business.about,
            phone: state.store.whatsapp || null,
            languages: ["Hindi", "English"],
            verified: business.verified ? ["Identity", "Phone"] : [],
          },
          products: active.map((p) => ({
            id: p.id,
            title: p.name,
            craft: p.category,
            price: p.price,
            bulkPrice: Math.round(p.price * 0.85),
            moq: 10,
            city: business.district,
            images: [coverFor(p)],
            description: p.seoDescription ?? p.description ?? "",
            materials: p.material ?? "",
            size: p.size ?? "",
            makeDays: 7,
            tags: p.keywords ?? [],
            stock: p.stock,
          })),
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["esetu"] });
      toast.success("Your shop is live on E-Setu", {
        description: `${res.published} product${res.published === 1 ? "" : "s"} are now visible to buyers. No account, no forms.`,
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not publish right now.");
    } finally {
      setPublishing(false);
    }
  };

  const moveOrder = async (orderId: string, stage: OrderStage) => {
    try {
      await advance({ data: { orderId, stage } });
      await queryClient.invalidateQueries({ queryKey: ["esetu", "artisan-orders", artisanId] });
      toast.success(STAGE_LABEL[stage]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the order.");
    }
  };

  const orderList = orders.data ?? [];
  const openOrders = orderList.filter((o) => o.stage !== "delivered");
  const earned = orderList.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <AppShell>
      <PageHeader
        title="E-Commerce"
        subtitle="Your stock, your orders and your shop — in one place"
        icon={ShoppingBag}
      />

      {/* One tap publish */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Rocket className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-tight">
              {live ? "Your shop is live on E-Setu" : "Sell on the E-Setu marketplace"}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {live
                ? notPublished.length
                  ? `${notPublished.length} new product${notPublished.length === 1 ? "" : "s"} are waiting to go up. One tap sends them.`
                  : "Everything in your catalogue is up to date for buyers."
                : "One tap makes your shop page and puts your whole catalogue in front of buyers. No account to create, nothing to fill in."}
            </p>
          </div>
        </div>
        <button
          onClick={onePublish}
          disabled={publishing || !active.length}
          className="mt-3 w-full rounded-2xl bg-primary px-4 py-3.5 text-[15px] font-bold text-primary-foreground disabled:opacity-60"
        >
          {publishing
            ? "Sending your shop…"
            : live
              ? "Update my shop on E-Setu"
              : "Publish my shop on E-Setu"}
        </button>
        {live && (
          <Link
            to="/esetu/artisan/$id"
            params={{ id: artisanId }}
            className="mt-2 flex items-center justify-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-[14px] font-semibold"
          >
            <ExternalLink className="size-4" /> See my shop the way buyers see it
          </Link>
        )}
        <Link
          to="/esetu"
          className="mt-2 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-primary"
        >
          Open the E-Setu marketplace
        </Link>
      </Card>

      {/* Quick numbers */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-border bg-card px-3 py-3 text-center">
          <p className="text-[18px] font-bold">{openOrders.length}</p>
          <p className="text-[11px] text-muted-foreground">Orders to do</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-3 py-3 text-center">
          <p className="text-[18px] font-bold">{shop.data?.products.length ?? 0}</p>
          <p className="text-[11px] text-muted-foreground">Live products</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-3 py-3 text-center">
          <p className="text-[18px] font-bold">{inr(earned)}</p>
          <p className="text-[11px] text-muted-foreground">From E-Setu</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(
          [
            ["orders", "Orders", ClipboardList],
            ["inventory", "Inventory", Boxes],
            ["shop", "My profile", Store],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              tab === key
                ? "flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2.5 text-[13px] font-bold text-primary-foreground"
                : "flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2.5 text-[13px] font-semibold text-muted-foreground"
            }
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="mt-4 grid gap-3">
          <SectionLabel>Orders from buyers</SectionLabel>
          {orderList.map((o) => {
            const next = NEXT_STAGE[o.stage as OrderStage];
            return (
              <Card key={o.id}>
                <div className="flex items-start gap-3">
                  {o.image && <img src={o.image} alt="" className="size-16 rounded-xl object-cover" />}
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">{o.product_title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {o.quantity} piece{o.quantity === 1 ? "" : "s"} · {inr(Number(o.total))}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                      <Phone className="size-3" /> {o.buyer_name} · {o.buyer_phone}
                    </p>
                    <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
                      <MapPin className="size-3" /> {o.city || "City not given"}
                    </p>
                    <p className="mt-1.5 inline-block rounded-full bg-primary-soft px-2.5 py-0.5 text-[12px] font-semibold text-primary">
                      {STAGE_LABEL[o.stage as OrderStage] ?? o.stage}
                    </p>
                  </div>
                </div>
                {next && (
                  <button
                    onClick={() => moveOrder(o.id, next)}
                    className="mt-3 w-full rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-primary-foreground"
                  >
                    {NEXT_LABEL[o.stage as OrderStage]}
                  </button>
                )}
                {o.stage === "artisan_notified" && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    The buyer is waiting for your yes.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ORDER_STAGES.filter((s) => s !== "artisan_chosen").map((s) => {
                    const reached = ORDER_STAGES.indexOf(s) <= ORDER_STAGES.indexOf(o.stage as OrderStage);
                    return (
                      <span
                        key={s}
                        className={
                          reached
                            ? "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold"
                            : "rounded-full px-2 py-0.5 text-[10px] text-muted-foreground"
                        }
                      >
                        {STAGE_LABEL[s]}
                      </span>
                    );
                  })}
                </div>
              </Card>
            );
          })}
          {!orderList.length && (
            <Card>
              <p className="text-[14px] text-muted-foreground">
                No E-Setu orders yet. Publish your shop and buyers can start ordering — every order lands here
                on its own.
              </p>
            </Card>
          )}
        </div>
      )}

      {tab === "inventory" && (
        <div className="mt-4 grid gap-3">
          <SectionLabel>Stock in your workshop</SectionLabel>
          {state.products.map((p) => {
            const isLive = publishedIds.has(`${artisanId}--${p.id}`);
            return (
              <Card key={p.id}>
                <div className="flex items-center gap-3">
                  <img src={coverFor(p)} alt={p.name} className="size-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{p.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {inr(p.price)} · {p.stock} in stock
                    </p>
                  </div>
                  <span
                    className={
                      isLive
                        ? "rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary"
                        : "rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
                    }
                  >
                    {isLive ? "On E-Setu" : "Not listed"}
                  </span>
                </div>
                {p.stock <= p.reorderLevel && (
                  <p className="mt-2 text-[12px] font-medium text-warn">
                    Running low — make more before the next order.
                  </p>
                )}
              </Card>
            );
          })}
          <Link
            to="/products/add"
            className="rounded-2xl border border-dashed border-border px-4 py-3 text-center text-[14px] font-semibold text-primary"
          >
            Add a new product
          </Link>
        </div>
      )}

      {tab === "shop" && (
        <div className="mt-4 grid gap-3">
          <Card>
            <div className="flex items-start gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-soft font-mono text-[18px] font-bold text-primary">
                {business.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-bold leading-tight">{business.name}</p>
                <p className="text-[12px] text-muted-foreground">{business.owner} · {business.category}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-muted-foreground">
                  <MapPin className="size-3" /> {business.village}, {business.district}, {business.state}
                </p>
                {business.verified && (
                  <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-good">
                    <ShieldCheck className="size-3" /> Verified artisan
                  </p>
                )}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{business.about}</p>
          </Card>

          <SectionLabel>My catalogue on E-Setu</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {(shop.data?.products ?? []).map((p) => (
              <Link
                key={p.id}
                to="/esetu/product/$id"
                params={{ id: p.id }}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img src={p.images[0] ?? ""} alt={p.title} className="aspect-square w-full object-cover" />
                <div className="p-2.5">
                  <p className="truncate text-[13px] font-semibold">{p.title}</p>
                  <p className="text-[13px] font-bold">{inr(Number(p.price))}</p>
                </div>
              </Link>
            ))}
            {!shop.data?.products.length && (
              <p className="col-span-2 text-[13px] text-muted-foreground">
                Nothing published yet — use the button at the top.
              </p>
            )}
          </div>

          <SectionLabel>Reviews from buyers</SectionLabel>
          {(shop.data?.reviews ?? []).map((r) => (
            <Card key={r.id}>
              <p className="flex items-center gap-2 text-[13px] font-semibold">
                {r.buyer_name}
                <span className="text-muted-foreground">· {r.place}</span>
                <span className="ml-auto inline-flex items-center gap-0.5 text-warn">
                  <Star className="size-3.5 fill-current" /> {r.rating}
                </span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{r.body}</p>
            </Card>
          ))}
          {!shop.data?.reviews.length && (
            <p className="text-[13px] text-muted-foreground">No reviews yet.</p>
          )}
        </div>
      )}
    </AppShell>
  );
}
