// GET    /api/cart                                   - your cart, with the bill worked out
// POST   /api/cart { menuItemId, change: 1 | -1, replace? } - add or remove one of an item
// DELETE /api/cart                                   - empty the cart
// The screen never adds up quantities or prices. It sends "+1" or "-1" and prints what comes back.
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { cartView } from "@/lib/cart";
import { fail, isPositiveInt, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return ok(await cartView(user?.id ?? null));
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to add items to your cart.");
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const { menuItemId, change, replace } = body;
  if (!isPositiveInt(menuItemId)) return fail(400, "That dish does not exist.");
  if (change !== 1 && change !== -1) return fail(400, "Change must be 1 or -1.");

  const sql = db();
  const items = await sql`
    SELECT m.id, m.restaurant_id, r.name AS restaurant_name
    FROM menu_items m JOIN restaurants r ON r.id = m.restaurant_id WHERE m.id = ${menuItemId}
  `;
  if (items.length === 0) return fail(400, "That dish does not exist.");
  const item = items[0];

  // One restaurant per cart - same rule as the real apps.
  const other = await sql`
    SELECT r.name FROM cart_items c
    JOIN menu_items m ON m.id = c.menu_item_id JOIN restaurants r ON r.id = m.restaurant_id
    WHERE c.user_id = ${user.id} AND m.restaurant_id <> ${item.restaurant_id}
    LIMIT 1
  `;
  if (other.length > 0) {
    if (replace !== true) {
      return fail(
        409,
        `Your cart has dishes from ${other[0].name}. Discard them and add dishes from ${item.restaurant_name}?`,
        { code: "DIFFERENT_RESTAURANT" }
      );
    }
    await sql`DELETE FROM cart_items WHERE user_id = ${user.id}`;
  }

  const current = await sql`SELECT qty FROM cart_items WHERE user_id = ${user.id} AND menu_item_id = ${menuItemId}`;
  const qty = current.length > 0 ? Number(current[0].qty) : 0;

  if (change === 1) {
    if (qty >= 20) return fail(400, "You can add up to 20 of one dish.");
    await sql`
      INSERT INTO cart_items (user_id, menu_item_id, qty) VALUES (${user.id}, ${menuItemId}, 1)
      ON CONFLICT (user_id, menu_item_id) DO UPDATE SET qty = cart_items.qty + 1
    `;
  } else if (qty > 1) {
    await sql`UPDATE cart_items SET qty = qty - 1 WHERE user_id = ${user.id} AND menu_item_id = ${menuItemId}`;
  } else if (qty === 1) {
    await sql`DELETE FROM cart_items WHERE user_id = ${user.id} AND menu_item_id = ${menuItemId}`;
  }

  return ok(await cartView(user.id));
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  await db()`DELETE FROM cart_items WHERE user_id = ${user.id}`;
  return ok(await cartView(user.id));
}
