// POST /api/reviews - save one review.
// Anyone can call this URL directly (curl, a script), so the UI's star picker protects nothing here.
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(request: Request) {
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const { restaurantId, rating, comment } = body;

  // Check 1: rating is a whole number from 1 to 5
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return fail(400, "Rating must be a whole number from 1 to 5.");
  }
  // Check 2: comment is not empty (spaces alone don't count)
  if (typeof comment !== "string" || comment.trim() === "") {
    return fail(400, "Comment cannot be empty.");
  }
  if (comment.trim().length > 500) return fail(400, "Comment must be 500 characters or fewer.");
  // Check 3: the restaurant actually exists (this one asks the database)
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId) || restaurantId < 1) {
    return fail(400, "That restaurant does not exist.");
  }
  const sql = db();
  const found = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (found.length === 0) return fail(400, "That restaurant does not exist.");

  const user = await currentUser();
  const [row] = await sql`
    INSERT INTO reviews (restaurant_id, user_id, author, rating, comment)
    VALUES (${restaurantId}, ${user?.id ?? null}, ${user?.name ?? "Guest"}, ${rating}, ${comment.trim()})
    RETURNING id
  `;
  return ok({ success: true, reviewId: row.id }, 201);
}
