import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  ESetuArtisan,
  ESetuOrder,
  ESetuOrderEvent,
  ESetuProduct,
  ESetuReview,
} from "./esetu-types";

export const marketplaceQuery = queryOptions({
  queryKey: ["esetu", "marketplace"],
  queryFn: async () => {
    const [products, artisans] = await Promise.all([
      supabase.from("esetu_products").select("*").order("likes", { ascending: false }),
      supabase.from("esetu_artisans").select("*").order("rating", { ascending: false }),
    ]);
    if (products.error) throw new Error(products.error.message);
    if (artisans.error) throw new Error(artisans.error.message);
    return {
      products: (products.data ?? []) as unknown as ESetuProduct[],
      artisans: (artisans.data ?? []) as unknown as ESetuArtisan[],
    };
  },
});

export const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["esetu", "product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("esetu_products").select("*").eq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const product = data as unknown as ESetuProduct;
      const [artisan, reviews] = await Promise.all([
        supabase.from("esetu_artisans").select("*").eq("id", product.artisan_id).maybeSingle(),
        supabase.from("esetu_reviews").select("*").eq("artisan_id", product.artisan_id).limit(10),
      ]);
      return {
        product,
        artisan: (artisan.data ?? null) as unknown as ESetuArtisan | null,
        reviews: (reviews.data ?? []) as unknown as ESetuReview[],
      };
    },
  });

export const artisanQuery = (id: string) =>
  queryOptions({
    queryKey: ["esetu", "artisan", id],
    queryFn: async () => {
      const [artisan, products, reviews] = await Promise.all([
        supabase.from("esetu_artisans").select("*").eq("id", id).maybeSingle(),
        supabase.from("esetu_products").select("*").eq("artisan_id", id),
        supabase.from("esetu_reviews").select("*").eq("artisan_id", id).order("created_at", { ascending: false }),
      ]);
      return {
        artisan: (artisan.data ?? null) as unknown as ESetuArtisan | null,
        products: (products.data ?? []) as unknown as ESetuProduct[],
        reviews: (reviews.data ?? []) as unknown as ESetuReview[],
      };
    },
  });

/** Orders that landed in this artisan's app from E-Setu. Polls so new buys appear on their own. */
export const artisanOrdersQuery = (artisanId: string) =>
  queryOptions({
    queryKey: ["esetu", "artisan-orders", artisanId],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("esetu_orders")
        .select("*")
        .eq("artisan_id", artisanId)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as ESetuOrder[];
    },
  });

export const buyerOrdersQuery = (phone: string) =>
  queryOptions({
    queryKey: ["esetu", "buyer-orders", phone],
    enabled: phone.length === 10,
    refetchInterval: 20000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("esetu_orders")
        .select("*")
        .eq("buyer_phone", phone)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      const orders = (data ?? []) as unknown as ESetuOrder[];
      const events = orders.length
        ? await supabase
            .from("esetu_order_events")
            .select("*")
            .in("order_id", orders.map((o) => o.id))
            .order("at", { ascending: true })
        : { data: [], error: null };
      return { orders, events: (events.data ?? []) as unknown as ESetuOrderEvent[] };
    },
  });

/** The artisan's own published catalogue, as buyers see it. */
export const myShopQuery = (artisanId: string) =>
  queryOptions({
    queryKey: ["esetu", "my-shop", artisanId],
    queryFn: async () => {
      const [artisan, products, reviews] = await Promise.all([
        supabase.from("esetu_artisans").select("*").eq("id", artisanId).maybeSingle(),
        supabase.from("esetu_products").select("*").eq("artisan_id", artisanId),
        supabase.from("esetu_reviews").select("*").eq("artisan_id", artisanId),
      ]);
      return {
        artisan: (artisan.data ?? null) as unknown as ESetuArtisan | null,
        products: (products.data ?? []) as unknown as ESetuProduct[],
        reviews: (reviews.data ?? []) as unknown as ESetuReview[],
      };
    },
  });
