// GET /api/restaurants/[id] - everything the restaurant page needs, already worked out.
// Shaped like the screen: header info, big rating, menu by section, latest review, then the rest.
import { db } from "@/lib/db";
import { fail, ok } from "@/lib/http";
import { averageOf, dateLabel, plural, rupees } from "@/lib/labels";

export const dynamic = "force-dynamic";

type ReviewRow = { id: number; rating: number; comment: string; author: string; created_at: string };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return fail(404, "Restaurant not found.");

  const sql = db();
  const found = await sql`
    SELECT r.*, c.name AS city FROM restaurants r JOIN cities c ON c.id = r.city_id WHERE r.id = ${id}
  `;
  if (found.length === 0) return fail(404, "Restaurant not found.");
  const r = found[0];

  // Still the heart of it: AVG and COUNT, computed right now.
  const [stats] = await sql`
    SELECT ROUND(AVG(rating), 1) AS average_rating, COUNT(*)::int AS total_reviews
    FROM reviews WHERE restaurant_id = ${id}
  `;

  const reviewRows = (await sql`
    SELECT id, rating, comment, author, created_at
    FROM reviews WHERE restaurant_id = ${id}
    ORDER BY created_at DESC, id DESC
  `) as ReviewRow[];

  const menuRows = await sql`
    SELECT id, category, name, description, price, veg, bestseller
    FROM menu_items WHERE restaurant_id = ${id} ORDER BY id
  `;

  // Group the menu into sections, in the order they first appear.
  const sections: { category: string; items: unknown[] }[] = [];
  for (const m of menuRows) {
    let section = sections.find((s) => s.category === m.category);
    if (!section) {
      section = { category: m.category, items: [] };
      sections.push(section);
    }
    section.items.push({
      id: m.id,
      name: m.name,
      description: m.description,
      priceLabel: rupees(m.price),
      veg: m.veg,
      bestseller: m.bestseller,
    });
  }

  const toJson = (v: ReviewRow) => ({
    id: v.id,
    rating: v.rating,
    comment: v.comment,
    author: v.author,
    createdAt: new Date(v.created_at).toISOString(),
    dateLabel: dateLabel(v.created_at),
  });

  // No reviews yet: averageRating is null (not 0 - a 0 would look like everyone hated it).
  return ok({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine,
    area: r.area,
    city: r.city,
    costLabel: `${rupees(r.cost_for_two)} for two`,
    deliveryTime: `${r.delivery_minutes}-${r.delivery_minutes + 5} mins`,
    pureVeg: r.pure_veg,
    emoji: r.emoji,
    tint: r.tint,
    offer: r.offer,
    averageRating: averageOf(stats.average_rating),
    totalReviews: stats.total_reviews,
    totalReviewsLabel: plural(stats.total_reviews, "rating"),
    menu: sections,
    latestReview: reviewRows.length > 0 ? toJson(reviewRows[0]) : null,
    reviews: reviewRows.slice(1).map(toJson),
  });
}
