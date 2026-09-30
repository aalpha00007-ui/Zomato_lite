// POST /api/reviews  -  save one review.
// The kitchen checks every order, even though the dining room already tried to.
// Anyone can call this URL directly (curl, a script), so the UI's star picker protects nothing here.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function reject(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return reject("Request body must be valid JSON.");
  }
  const { restaurantId, rating, comment } = (body ?? {}) as Record<string, unknown>;

  // Check 1: rating is a whole number from 1 to 5
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return reject("Rating must be a whole number from 1 to 5.");
  }

  // Check 2: comment is not empty (spaces alone don't count)
  if (typeof comment !== "string" || comment.trim() === "") {
    return reject("Comment cannot be empty.");
  }

  // Check 3: the restaurant actually exists (this one asks the database)
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId) || restaurantId < 1) {
    return reject("That restaurant does not exist.");
  }
  const sql = db();
  const found = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (found.length === 0) {
    return reject("That restaurant does not exist.");
  }

  // All checks passed: write exactly one row. Nothing else in the database changes.
  const [row] = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return NextResponse.json({ success: true, reviewId: row.id }, { status: 201 });
}
