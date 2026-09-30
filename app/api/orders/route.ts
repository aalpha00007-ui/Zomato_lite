// GET  /api/orders                              - your past orders, newest first
// POST /api/orders { addressId, paymentMethod } - turn your cart into an order
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { billView, feesFor } from "@/lib/bill";
import { orderStatus } from "@/lib/status";
import { fail, isPositiveInt, ok, readJson } from "@/lib/http";
import { dateLabel } from "@/lib/labels";
import { PAYMENT_LABELS } from "@/lib/payments";

export const dynamic = "force-dynamic";


export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to see your orders.");

  const rows = await db()`
    SELECT o.id, o.placed_at, o.delivery_fee, o.platform_fee, o.gst,
           r.id AS restaurant_id, r.name AS restaurant_name, r.area, r.emoji, r.tint,
           SUM(i.price * i.qty)::int AS item_total,
           STRING_AGG(i.qty || ' x ' || i.name, ', ' ORDER BY i.id) AS summary
    FROM orders o
    JOIN restaurants r ON r.id = o.restaurant_id
    JOIN order_items i ON i.order_id = o.id
    WHERE o.user_id = ${user.id}
    GROUP BY o.id, r.id
    ORDER BY o.placed_at DESC
  `;

  return ok({
    orders: rows.map((o) => {
      const bill = billView(o.item_total, { deliveryFee: o.delivery_fee, platformFee: o.platform_fee, gst: o.gst });
      const status = orderStatus(o.placed_at);
      return {
        id: o.id,
        restaurant: { id: o.restaurant_id, name: o.restaurant_name, area: o.area, emoji: o.emoji, tint: o.tint },
        summary: o.summary,
        placedAtLabel: dateLabel(o.placed_at),
        toPayLabel: bill.toPayLabel,
        statusLabel: status.label,
        delivered: status.delivered,
      };
    }),
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to place an order.");
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const { addressId, paymentMethod } = body;
  if (typeof paymentMethod !== "string" || !(paymentMethod in PAYMENT_LABELS)) {
    return fail(400, "Choose a payment method.");
  }
  if (!isPositiveInt(addressId)) return fail(400, "Choose a delivery address.");

  const sql = db();
  const addresses = await sql`SELECT label, line FROM addresses WHERE id = ${addressId} AND user_id = ${user.id}`;
  if (addresses.length === 0) return fail(400, "Choose a delivery address.");
  const address = addresses[0];

  const [cart] = await sql`
    SELECT COUNT(*)::int AS lines, COALESCE(SUM(m.price * c.qty), 0)::int AS item_total,
           MIN(m.restaurant_id) AS restaurant_id
    FROM cart_items c JOIN menu_items m ON m.id = c.menu_item_id
    WHERE c.user_id = ${user.id}
  `;
  if (cart.lines === 0) return fail(400, "Your cart is empty.");

  const fees = feesFor(cart.item_total);

  // One statement: create the order, copy the cart lines into it, empty the cart.
  // Postgres runs it all-or-nothing, so you can never get an order without its items.
  const [order] = await sql`
    WITH new_order AS (
      INSERT INTO orders (user_id, restaurant_id, address_label, address_line, payment_method, delivery_fee, platform_fee, gst)
      VALUES (${user.id}, ${cart.restaurant_id}, ${address.label}, ${address.line}, ${paymentMethod},
              ${fees.deliveryFee}, ${fees.platformFee}, ${fees.gst})
      RETURNING id
    ),
    copied AS (
      INSERT INTO order_items (order_id, menu_item_id, name, price, qty)
      SELECT new_order.id, m.id, m.name, m.price, c.qty
      FROM new_order, cart_items c JOIN menu_items m ON m.id = c.menu_item_id
      WHERE c.user_id = ${user.id}
      RETURNING 1
    ),
    emptied AS (
      DELETE FROM cart_items WHERE user_id = ${user.id} RETURNING 1
    )
    SELECT id FROM new_order
  `;

  return ok({ success: true, orderId: order.id }, 201);
}
