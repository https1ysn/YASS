"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getProducts } from "@/lib/supabase/queries";
import { checkoutSchema, type CheckoutInput } from "@/schemas/checkout";
import { FLAT_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "@/constants/cart";
import { shippingMethods } from "@/constants/checkout";

export type PlaceOrderResult = { ok: true; orderNumber: string } | { ok: false; error: string };

function friendlyError(message: string, code?: string): string {
  if (code === "PGRST202" || /place_order/i.test(message)) {
    return "Ordering isn't fully set up yet — the latest database migration hasn't been applied.";
  }
  if (/fetch failed|network|ENOTFOUND|ECONN|timeout/i.test(message)) {
    return "We couldn't reach the boutique. Please check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

/**
 * Places a real order: validates the payload, re-prices every item from the
 * catalog (never trusting client prices), then calls the atomic `place_order`
 * database function which stores the customer, order and order items.
 */
export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check your details and try again.",
    };
  }
  const data = parsed.data;

  // Re-price on the server from the catalog.
  const products = await getProducts();
  const items: Array<{
    slug: string;
    name: string;
    size: string;
    color: string;
    quantity: number;
    unit_price: number;
  }> = [];

  for (const item of data.items) {
    const product = products.find((p) => p.slug === item.slug);
    if (!product) {
      return { ok: false, error: "One of the pieces in your bag is no longer available." };
    }
    items.push({
      slug: product.slug,
      name: product.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unit_price: product.price,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const discount = data.coupon ? Math.round(subtotal * 0.1) : 0;
  const expressRate = shippingMethods.find((m) => m.id === "express")?.price ?? 24;
  const shippingCost =
    data.shippingMethod === "express"
      ? expressRate
      : subtotal - discount >= FREE_SHIPPING_THRESHOLD
        ? 0
        : FLAT_SHIPPING_RATE;
  const total = subtotal - discount + shippingCost;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: result, error } = await supabase.rpc("place_order", {
      p_full_name: data.fullName,
      p_phone: data.phone,
      p_email: data.email || null,
      p_country: data.country,
      p_city: data.city,
      p_street: data.street,
      p_postal: data.postalCode || null,
      p_shipping_method: data.shippingMethod,
      p_payment_method: data.paymentMethod,
      p_subtotal: subtotal,
      p_discount: discount,
      p_shipping_cost: shippingCost,
      p_total: total,
      p_notes: data.notes || null,
      p_items: items,
    });

    if (error) {
      return { ok: false, error: friendlyError(error.message, error.code) };
    }

    const orderNumber = (result as { order_number?: string } | null)?.order_number;
    if (!orderNumber) {
      return { ok: false, error: "The order could not be created. Please try again." };
    }
    return { ok: true, orderNumber };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    return { ok: false, error: friendlyError(message) };
  }
}
