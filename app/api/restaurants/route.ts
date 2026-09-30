// GET /api/restaurants?city=1&q=biryani&cuisine=Pizza&veg=1&rating=1&fast=1&budget=1&sort=rating
// The home feed. Filtering, sorting and every rating are computed here, in SQL.
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { averageOf, plural, rupees } from "@/lib/labels";

export const dynamic = "force-dynamic";

const SORTS: Record<string, string> = {
  relevance: "r.id ASC",
  rating: "average_rating DESC NULLS LAST",
  delivery: "r.delivery_minutes ASC",
  cost_low: "r.cost_for_two ASC",
  cost_high: "r.cost_for_two DESC",
};

export async function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  const cityId = Number(p.get("city") ?? "1");
  if (!Number.isInteger(cityId) || cityId < 1) return fail(400, "City must be a valid id.");

  const sql = db();
  const cities = await sql`SELECT id, name FROM cities WHERE id = ${cityId}`;
  if (cities.length === 0) return fail(404, "City not found.");

  const where = ["r.city_id = $1"];
  const params: unknown[] = [cityId];
  const q = (p.get("q") ?? "").trim();
  if (q) {
    params.push(`%${q}%`);
    const ph = `$${params.length}`;
    where.push(
      `(r.name ILIKE ${ph} OR r.cuisine ILIKE ${ph} OR EXISTS (SELECT 1 FROM menu_items m WHERE m.restaurant_id = r.id AND m.name ILIKE ${ph}))`
    );
  }
  const cuisine = (p.get("cuisine") ?? "").trim();
  if (cuisine) {
    params.push(`%${cuisine}%`);
    where.push(`r.cuisine ILIKE $${params.length}`);
  }
  if (p.get("veg") === "1") where.push("r.pure_veg");
  if (p.get("fast") === "1") where.push("r.delivery_minutes <= 30");
  if (p.get("budget") === "1") where.push("r.cost_for_two <= 400");
  const having = p.get("rating") === "1" ? "HAVING AVG(v.rating) >= 4" : "";
  const orderBy = SORTS[p.get("sort") ?? "relevance"] ?? SORTS.relevance;

  const rows = await sql.query(
    `SELECT r.id, r.name, r.cuisine, r.area, r.cost_for_two, r.delivery_minutes, r.pure_veg,
            r.emoji, r.tint, r.offer,
            ROUND(AVG(v.rating), 1) AS average_rating,
            COUNT(v.id)::int        AS total_reviews
     FROM restaurants r
     LEFT JOIN reviews v ON v.restaurant_id = r.id
     WHERE ${where.join(" AND ")}
     GROUP BY r.id
     ${having}
     ORDER BY ${orderBy}, r.id`,
    params
  );

  return ok({
    city: cities[0],
    countLabel: rows.length === 0 ? "No restaurants match" : `${plural(rows.length, "restaurant")} delivering to you`,
    restaurants: rows.map((r) => ({
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      area: r.area,
      costLabel: `${rupees(r.cost_for_two)} for two`,
      deliveryTime: `${r.delivery_minutes}-${r.delivery_minutes + 5} mins`,
      pureVeg: r.pure_veg,
      emoji: r.emoji,
      tint: r.tint,
      offer: r.offer,
      averageRating: averageOf(r.average_rating),
      totalReviews: r.total_reviews,
    })),
  });
}
