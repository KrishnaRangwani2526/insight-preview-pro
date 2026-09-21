import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApp } from "./store";
import { publishShop } from "./esetu.functions";
import { artisanSlug } from "./esetu-types";
import { productImage } from "@/components/ui-kit";
import type { Product } from "./types";

function cover(p: Product) {
  if (p.enhancedImage && p.enhancedImage.length < 400000) return p.enhancedImage;
  return productImage(p.image);
}

export function buildShopPayload(state: ReturnType<typeof useApp>["state"]) {
  const business = state.business;
  const active = state.products.filter((p) => p.status === "active");
  return {
    artisan: {
      id: artisanSlug(business.name),
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
      images: [cover(p)],
      description: p.seoDescription ?? p.description ?? "",
      materials: p.material ?? "",
      size: p.size ?? "",
      makeDays: 7,
      tags: p.keywords ?? [],
      stock: p.stock,
    })),
  };
}

/**
 * Keeps the artisan's E-Setu shop in step with their catalogue on its own —
 * add or edit a product in the app and buyers see it a moment later.
 */
export function useESetuAutoSync() {
  const { state, hydrated } = useApp();
  const queryClient = useQueryClient();
  const lastSignature = useRef<string>("");

  const active = state.products.filter((p) => p.status === "active");
  const signature = JSON.stringify([
    state.business.name,
    state.business.about,
    state.business.category,
    active.map((p) => [p.id, p.name, p.price, p.stock, p.description, p.seoDescription, p.image, p.enhancedImage?.length]),
  ]);

  useEffect(() => {
    if (!hydrated || !state.onboarded || !active.length) return;
    if (signature === lastSignature.current) return;
    lastSignature.current = signature;

    const timer = setTimeout(() => {
      publishShop({ data: buildShopPayload(state) })
        .then(() => queryClient.invalidateQueries({ queryKey: ["esetu"] }))
        .catch(() => {
          /* offline or backend busy — the next change retries */
          lastSignature.current = "";
        });
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, hydrated, state.onboarded]);
}
