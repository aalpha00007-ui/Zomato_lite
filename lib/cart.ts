// The cart, as the screen needs it: items, counts and the bill, all worked out here.
import { db } from "@/lib/db";
import { billView, feesFor, freeDeliveryHint } from "@/lib/bill";
import { plural, rupees } from "@/lib/labels";

export async function cartView(userId: number | null) {
  const empty = { loggedIn: userId !== null, restaurant: null, items: [], itemCount: 0, itemCountLabel: "", bill: null, hint: null };
  if (userId === null) return empty;

  const rows = await db()`
    SELECT c.menu_item_id, c.qty, m.name, m.price, m.veg,
           r.id AS restaurant_id, r.name AS restaurant_name, r.area, r.emoji, r.tint
    FROM cart_items c
    JOIN menu_items m ON m.id = c.menu_item_id
    JOIN restaurants r ON r.id = m.restaurant_id
    WHERE c.user_id = ${userId}
    ORDER BY m.id
  `;
  if (rows.length === 0) return empty;

  const itemTotal = rows.reduce((sum, r) => sum + r.price * r.qty, 0);
  const itemCount = rows.reduce((sum, r) => sum + r.qty, 0);
  const first = rows[0];

  return {
    loggedIn: true,
    restaurant: { id: first.restaurant_id, name: first.restaurant_name, area: first.area, emoji: first.emoji, tint: first.tint },
    items: rows.map((r) => ({
      menuItemId: r.menu_item_id,
      name: r.name,
      veg: r.veg,
      qty: r.qty,
      priceLabel: rupees(r.price),
      lineTotalLabel: rupees(r.price * r.qty),
    })),
    itemCount,
    itemCountLabel: `${plural(itemCount, "item")} added`,
    bill: billView(itemTotal, feesFor(itemTotal)),
    hint: freeDeliveryHint(itemTotal),
  };
}
