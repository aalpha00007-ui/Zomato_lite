// DELETE /api/addresses/[id] - remove one of your saved addresses.
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return fail(401, "Please log in first.");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) return fail(404, "Address not found.");
  const rows = await db()`DELETE FROM addresses WHERE id = ${id} AND user_id = ${user.id} RETURNING id`;
  if (rows.length === 0) return fail(404, "Address not found.");
  return ok({ success: true });
}
