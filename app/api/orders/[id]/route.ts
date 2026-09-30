// GET /api/orders/[id] - one order with its live status. Status is computed from placed_at, never stored.
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { billView } from "@/lib/bill";
import { orderStatus } from "@/lib/status";
import { fail, ok } from "@/lib/http";
import { dateLabel, rupees } from "@/lib/labels";
import { PAYMENT_LABELS } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to see this order.");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail(404, "Order not found.");

  const sql = db();
  const found = await sql`
    SELECT o.*, r.name AS restaurant_name, r.area, r.emoji, r.tint
    FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
    WHERE o.id = ${id} AND o.user_id = ${user.id}
  `;
  if (found.length === 0) return fail(404, "Order not found.");
  const o = found[0];

  const items = await sql`SELECT id, name, price, qty FROM order_items WHERE order_id = ${id} ORDER BY id`;
  const itemTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return ok({
    id: o.id,
    restaurant: { id: o.restaurant_id, name: o.restaurant_name, area: o.area, emoji: o.emoji, tint: o.tint },
    placedAtLabel: dateLabel(o.placed_at),
    address: { label: o.address_label, line: o.address_line },
    paymentLabel: PAYMENT_LABELS[o.payment_method] ?? o.payment_method,
    items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, lineTotalLabel: rupees(i.price * i.qty) })),
    bill: billView(itemTotal, { deliveryFee: o.delivery_fee, platformFee: o.platform_fee, gst: o.gst }),
    status: orderStatus(o.placed_at),
  });
}
