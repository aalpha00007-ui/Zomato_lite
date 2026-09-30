// GET /api/restaurants/[id]  -  everything the restaurant page needs, already worked out.
// The response is shaped like the screen: name, big rating, latest review, then the rest.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // compute fresh on every request, never cache

type ReviewRow = { id: number; rating: number; comment: string; created_at: string };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const sql = db();

  const restaurants = await sql`SELECT name, cuisine, area FROM restaurants WHERE id = ${id}`;
  if (restaurants.length === 0) {
    return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
  }
  const restaurant = restaurants[0];

  // The entire intelligence of this product: AVG and COUNT, computed right now.
  const [stats] = await sql`
    SELECT ROUND(AVG(rating), 1) AS average_rating,
           COUNT(*)::int         AS total_reviews
    FROM reviews
    WHERE restaurant_id = ${id}
  `;

  // Newest first. The first one is "latest"; the rest are "older".
  const rows = (await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${id}
    ORDER BY created_at DESC, id DESC
  `) as ReviewRow[];

  const toJson = (r: ReviewRow) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(r.created_at).toISOString(),
  });

  // Empty state: with no reviews there is no average, so we say null (not 0).
  // A 0 would look like "everyone hated it" - that would be a lie.
  return NextResponse.json({
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    area: restaurant.area,
    averageRating: stats.average_rating === null ? null : Number(stats.average_rating),
    totalReviews: stats.total_reviews,
    latestReview: rows.length > 0 ? toJson(rows[0]) : null,
    reviews: rows.slice(1).map(toJson),
  });
}
