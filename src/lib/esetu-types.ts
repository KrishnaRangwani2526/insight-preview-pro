export const ORDER_STAGES = [
  "placed",
  "artisan_notified",
  "artisan_accepted",
  "artisan_chosen",
  "in_making",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export type OrderStage = (typeof ORDER_STAGES)[number];

export const STAGE_LABEL: Record<OrderStage, string> = {
  placed: "Order placed",
  artisan_notified: "Sent to artisan",
  artisan_accepted: "Artisan accepted",
  artisan_chosen: "Artisan chosen",
  in_making: "Being made",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

export interface ESetuArtisan {
  id: string;
  name: string;
  craft: string;
  city: string;
  photo: string | null;
  about: string;
  since_year: number | null;
  languages: string[];
  verified: string[];
  rating: number;
  orders_done: number;
  on_time: number;
  repeat_buyers: number;
  phone: string | null;
  source: string;
}

export interface ESetuProduct {
  id: string;
  artisan_id: string;
  title: string;
  craft: string;
  price: number;
  bulk_price: number;
  moq: number;
  city: string;
  images: string[];
  description: string;
  materials: string;
  size: string;
  make_days: number;
  tags: string[];
  likes: number;
  stock: number;
}

export interface ESetuOrder {
  id: string;
  kind: string;
  product_id: string | null;
  product_title: string;
  image: string | null;
  artisan_id: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  buyer_name: string;
  buyer_phone: string;
  city: string;
  stage: OrderStage;
  tracking_id: string | null;
  courier: string | null;
  expected_days: number;
  created_at: string;
}

export interface ESetuOrderEvent {
  id: string;
  order_id: string;
  stage: OrderStage;
  note: string | null;
  at: string;
}

export interface ESetuReview {
  id: string;
  artisan_id: string;
  product_id: string | null;
  buyer_name: string;
  place: string;
  rating: number;
  body: string;
  created_at: string;
}

export function artisanSlug(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "my-shop"
  );
}

export const rupees = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
