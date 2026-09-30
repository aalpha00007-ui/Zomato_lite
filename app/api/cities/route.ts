// GET /api/cities - the cities you can switch between.
import { db } from "@/lib/db";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db()`SELECT id, name FROM cities ORDER BY id`;
  return ok({ cities: rows });
}
