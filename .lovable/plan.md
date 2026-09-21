# E-Setu marketplace inside the artisan app

Bring the Artisan Bridge marketplace into this app as the buyer-facing side of E-Setu, and add a simple E-Commerce section for the artisan. No separate signup, no manual re-typing: one tap publishes the catalogue, and buyer orders land back in the artisan's phone.

## What the artisan sees

A new **E-Commerce** entry (home tile + menu) opens one screen with four simple cards:

- **Inventory** — every product, stock left, low-stock warning, "Published on E-Setu" tick.
- **Orders** — new / making / shipped / delivered, with Accept, Mark as making, Mark as shipped, Mark as delivered buttons. Orders from E-Setu buyers arrive here automatically.
- **My profile** — shop name, photo, city, craft, since-year, verification ticks, rating, orders completed, on-time percentage.
- **Catalogue & reviews** — the products buyers see, plus the reviews buyers left.

One button at the top: **Publish my shop on E-Setu (one tap)**. It creates the artisan's marketplace page automatically from the profile and catalogue already in the app — no form, no account, no password — and after that every new or edited product is pushed automatically. A "View my E-Setu page" link opens exactly what buyers see.

## What the buyer sees

The marketplace pages from the Artisan Bridge project, rebuilt inside this app under `/esetu`:

- Home, Discover (search + filters), Product page with **Buy now** and bulk enquiry, Artisan profile with catalogue and reviews, Post a requirement, Order tracking timeline, Trade fairs.
- Buyers browse without login; Buy now asks only for name, phone, city.

## The automated loop

```text
Artisan app catalogue --one tap--> E-Setu artisan page + products (live)
Buyer taps Buy now on E-Setu -----> order row created
Order appears instantly in the artisan's Orders screen (new order alert)
Artisan taps Accept / Making / Shipped / Delivered
Buyer's tracking timeline updates on E-Setu
```

Same for bulk requirements: a buyer posts a requirement, matching artisans get a "I can make this" card in the app, the buyer picks one, and that job moves into the artisan's orders.

## Technical notes

- Enable Lovable Cloud. Tables: `artisans`, `esetu_products`, `esetu_orders`, `order_events`, `artisan_responses`, `reviews`, all with row-level security; buyer-facing reads are public, writes go through server functions.
- Publishing is a server function that upserts the artisan row plus every active product (idempotent on artisan id + product id), so re-tapping never duplicates.
- Orders and events are read with TanStack Query and refetched on an interval, so the artisan's phone shows buyer orders without a manual refresh.
- Artisan identity is a device-scoped id generated on first publish and stored with the app state — no login for the artisan, no login for buyers.
- Marketplace routes: `/esetu`, `/esetu/discover`, `/esetu/product/$id`, `/esetu/artisan/$id`, `/esetu/post`, `/esetu/orders`, `/esetu/fairs`, each with its own page title and description. The existing in-app `/e-setu` preview page stays and links into the live marketplace.
- Marketplace visuals, copy and demo artisans come from the Artisan Bridge repo; its `data.ts` demo arrays seed the database once via the migration so the marketplace is never empty.
- Everything stays bilingual (English plus the chosen language) like the rest of the app.
