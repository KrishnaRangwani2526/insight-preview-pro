import { createServerFn } from "@tanstack/react-start";
import type { OrderStage } from "./esetu-types";

interface PublishInput {
  artisan: {
    id: string;
    name: string;
    craft: string;
    city: string;
    photo?: string | null;
    about: string;
    phone?: string | null;
    languages?: string[];
    verified?: string[];
  };
  products: Array<{
    id: string;
    title: string;
    craft: string;
    price: number;
    bulkPrice: number;
    moq: number;
    city: string;
    images: string[];
    description: string;
    materials: string;
    size: string;
    makeDays: number;
    tags: string[];
    stock: number;
  }>;
}

/** One-tap publish: creates / refreshes the artisan's E-Setu shop and catalogue. */
export const publishShop = createServerFn({ method: "POST" })
  .inputValidator((input: PublishInput) => {
    if (!input?.artisan?.id || !input.artisan.name) throw new Error("Shop details are missing.");
    if (!Array.isArray(input.products)) throw new Error("Catalogue is missing.");
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const a = data.artisan;

    const { error: artisanError } = await supabaseAdmin.from("esetu_artisans").upsert(
      {
        id: a.id,
        name: a.name,
        craft: a.craft ?? "",
        city: a.city ?? "",
        photo: a.photo ?? null,
        about: a.about ?? "",
        phone: a.phone ?? null,
        languages: a.languages ?? [],
        verified: a.verified ?? [],
        source: "app",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (artisanError) throw new Error(artisanError.message);

    const rows = data.products.map((p) => ({
      id: `${a.id}--${p.id}`,
      artisan_id: a.id,
      title: p.title,
      craft: p.craft ?? "",
      price: p.price ?? 0,
      bulk_price: p.bulkPrice ?? p.price ?? 0,
      moq: p.moq ?? 1,
      city: p.city ?? a.city ?? "",
      images: p.images ?? [],
      description: p.description ?? "",
      materials: p.materials ?? "",
      size: p.size ?? "",
      make_days: p.makeDays ?? 7,
      tags: p.tags ?? [],
      stock: p.stock ?? 0,
      updated_at: new Date().toISOString(),
    }));

    if (rows.length) {
      const { error } = await supabaseAdmin.from("esetu_products").upsert(rows, { onConflict: "id" });
      if (error) throw new Error(error.message);
    }

    return { artisanId: a.id, published: rows.length };
  });

interface PlaceOrderInput {
  productId: string;
  quantity: number;
  buyerName: string;
  buyerPhone: string;
  city: string;
}

/** Buyer "Buy now" — lands straight in the artisan's app. */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: PlaceOrderInput) => {
    if (!input?.productId) throw new Error("Product missing.");
    if (!input.buyerName?.trim()) throw new Error("Please enter your name.");
    if (!/^\d{10}$/.test((input.buyerPhone ?? "").replace(/\D/g, "").slice(-10)))
      throw new Error("Please enter a valid 10-digit phone number.");
    return {
      ...input,
      quantity: Math.max(1, Math.min(999, Math.round(input.quantity || 1))),
      buyerPhone: input.buyerPhone.replace(/\D/g, "").slice(-10),
    };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: product, error: prodError } = await supabaseAdmin
      .from("esetu_products")
      .select("*")
      .eq("id", data.productId)
      .maybeSingle();
    if (prodError) throw new Error(prodError.message);
    if (!product) throw new Error("This product is no longer available.");

    const id = `ES${Date.now().toString(36).toUpperCase()}`;
    const unit = Number(product.price);
    const order = {
      id,
      kind: "single",
      product_id: product.id,
      product_title: product.title,
      image: (product.images as string[])?.[0] ?? null,
      artisan_id: product.artisan_id,
      quantity: data.quantity,
      unit_price: unit,
      total: unit * data.quantity,
      buyer_name: data.buyerName.trim(),
      buyer_phone: data.buyerPhone,
      city: data.city?.trim() ?? "",
      stage: "artisan_notified" as OrderStage,
      expected_days: product.make_days ?? 7,
    };

    const { error } = await supabaseAdmin.from("esetu_orders").insert(order);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("esetu_order_events").insert([
      { order_id: id, stage: "placed", note: "Buyer placed the order on E-Setu." },
      { order_id: id, stage: "artisan_notified", note: "Sent to the artisan's app." },
    ]);

    return { orderId: id, phone: data.buyerPhone };
  });

interface StageInput {
  orderId: string;
  stage: OrderStage;
  note?: string;
  trackingId?: string;
  courier?: string;
}

/** Artisan moves an order forward with one tap. */
export const setOrderStage = createServerFn({ method: "POST" })
  .inputValidator((input: StageInput) => {
    if (!input?.orderId || !input.stage) throw new Error("Order or stage missing.");
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch = {
      stage: data.stage,
      updated_at: new Date().toISOString(),
      ...(data.trackingId ? { tracking_id: data.trackingId } : {}),
      ...(data.courier ? { courier: data.courier } : {}),
    };

    const { error } = await supabaseAdmin.from("esetu_orders").update(patch).eq("id", data.orderId);
    if (error) throw new Error(error.message);

    await supabaseAdmin
      .from("esetu_order_events")
      .insert({ order_id: data.orderId, stage: data.stage, note: data.note ?? null });

    return { ok: true };
  });

interface ReviewInput {
  artisanId: string;
  productId?: string;
  buyerName: string;
  place: string;
  rating: number;
  body: string;
}

export const addReview = createServerFn({ method: "POST" })
  .inputValidator((input: ReviewInput) => {
    if (!input?.artisanId) throw new Error("Artisan missing.");
    if (!input.body?.trim()) throw new Error("Please write a few words.");
    return input;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("esetu_reviews").insert({
      artisan_id: data.artisanId,
      product_id: data.productId ?? null,
      buyer_name: data.buyerName?.trim() || "Buyer",
      place: data.place?.trim() ?? "",
      rating: Math.max(1, Math.min(5, Math.round(data.rating || 5))),
      body: data.body.trim(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
