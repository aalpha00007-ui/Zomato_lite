// GET  /api/addresses - your saved addresses
// POST /api/addresses { label, line } - save a new one
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok, readJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to see your addresses.");
  const rows = await db()`SELECT id, label, line FROM addresses WHERE user_id = ${user.id} ORDER BY id`;
  return ok({ addresses: rows });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in to save an address.");
  const body = await readJson(request);
  if (!body) return fail(400, "Request body must be valid JSON.");
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const line = typeof body.line === "string" ? body.line.trim() : "";
  if (label === "" || label.length > 20) return fail(400, "Give the address a short name, like Home or Work.");
  if (line.length < 5 || line.length > 200) return fail(400, "Enter the full address (at least 5 characters).");

  const [row] = await db()`
    INSERT INTO addresses (user_id, label, line) VALUES (${user.id}, ${label}, ${line}) RETURNING id, label, line
  `;
  return ok({ address: row }, 201);
}
