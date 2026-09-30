// The bill rules live here, in one place, on the backend.
import { rupees } from "@/lib/labels";

export const FREE_DELIVERY_ABOVE = 499;
export const DELIVERY_FEE = 40;
export const PLATFORM_FEE = 5;
export const GST_RATE = 0.05;

// Fees charged for a given item total (these get stored on the order as facts).
export function feesFor(itemTotal: number) {
  return {
    deliveryFee: itemTotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE,
    platformFee: PLATFORM_FEE,
    gst: Math.round(itemTotal * GST_RATE),
  };
}

// Bill shaped like the screen: rows to print, the total, and a nudge if one applies.
export function billView(itemTotal: number, fees: { deliveryFee: number; platformFee: number; gst: number }) {
  const toPay = itemTotal + fees.deliveryFee + fees.platformFee + fees.gst;
  return {
    rows: [
      { label: "Item total", value: rupees(itemTotal) },
      { label: "Delivery fee", value: fees.deliveryFee === 0 ? "FREE" : rupees(fees.deliveryFee) },
      { label: "Platform fee", value: rupees(fees.platformFee) },
      { label: "GST and restaurant charges", value: rupees(fees.gst) },
    ],
    toPay,
    toPayLabel: rupees(toPay),
  };
}

export function freeDeliveryHint(itemTotal: number) {
  const gap = FREE_DELIVERY_ABOVE - itemTotal;
  return gap > 0 ? `Add items worth ${rupees(gap)} more for FREE delivery` : "Yay! You got FREE delivery";
}
