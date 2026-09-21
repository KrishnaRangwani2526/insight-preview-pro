import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EsetuShell } from "@/components/EsetuShell";
import { buyerOrdersQuery } from "@/lib/esetu-queries";
import { ORDER_STAGES, STAGE_LABEL, rupees, type OrderStage } from "@/lib/esetu-types";

export const Route = createFileRoute("/esetu/orders")({
  validateSearch: (search: Record<string, unknown>) => ({
    phone: typeof search['phone'] === "string" ? (search['phone'] as string) : "",
  }),
  head: () => ({
    meta: [
      { title: "Track your E-Setu orders" },
      {
        name: "description",
        content: "Enter your phone number to follow every order from the artisan's workshop to your door.",
      },
      { property: "og:title", content: "Track your E-Setu orders" },
      { property: "og:description", content: "Live order progress, straight from the artisan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BuyerOrders,
});

function BuyerOrders() {
  const { phone: initial } = Route.useSearch();
  const [phone, setPhone] = useState(initial);
  const { data } = useQuery(buyerOrdersQuery(phone.replace(/\D/g, "").slice(-10)));

  const orders = data?.orders ?? [];
  const events = data?.events ?? [];

  return (
    <EsetuShell>
      <h1 className="text-[22px] font-bold">My orders</h1>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Enter the phone number you used when ordering.
      </p>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        inputMode="numeric"
        placeholder="10-digit mobile"
        className="mt-3 w-full max-w-xs rounded-xl border border-border bg-card px-3 py-2.5 text-[14px]"
      />

      <div className="mt-5 grid gap-3">
        {orders.map((o) => {
          const done = ORDER_STAGES.indexOf(o.stage as OrderStage);
          const timeline = events.filter((e) => e.order_id === o.id);
          return (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                {o.image && <img src={o.image} alt="" className="size-16 rounded-xl object-cover" />}
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold">{o.product_title}</p>
                  <p className="text-[12px] text-muted-foreground">
                    Order {o.id} · {o.quantity} piece{o.quantity === 1 ? "" : "s"} · {rupees(o.total)}
                  </p>
                  <p className="mt-1 inline-block rounded-full bg-primary-soft px-2.5 py-0.5 text-[12px] font-semibold text-primary">
                    {STAGE_LABEL[o.stage as OrderStage] ?? o.stage}
                  </p>
                </div>
              </div>

              <ol className="mt-3 grid gap-1.5">
                {ORDER_STAGES.filter((s) => s !== "artisan_chosen").map((s) => {
                  const idx = ORDER_STAGES.indexOf(s);
                  const reached = idx <= done;
                  const at = timeline.find((e) => e.stage === s);
                  return (
                    <li key={s} className="flex items-center gap-2 text-[12px]">
                      <span
                        className={
                          reached ? "size-2 rounded-full bg-primary" : "size-2 rounded-full bg-border"
                        }
                      />
                      <span className={reached ? "font-medium" : "text-muted-foreground"}>
                        {STAGE_LABEL[s]}
                      </span>
                      {at && (
                        <span className="ml-auto text-muted-foreground">
                          {new Date(at.at).toLocaleDateString("en-IN")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>

              {o.tracking_id && (
                <p className="mt-2 text-[12px] text-muted-foreground">
                  {o.courier ?? "Courier"} · tracking {o.tracking_id}
                </p>
              )}
            </div>
          );
        })}
        {phone.replace(/\D/g, "").length === 10 && !orders.length && (
          <p className="py-8 text-center text-[13px] text-muted-foreground">
            No orders found for that number yet.
          </p>
        )}
      </div>
    </EsetuShell>
  );
}
