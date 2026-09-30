// GET /api/me - who is logged in (or null).
import { currentUser } from "@/lib/auth";
import { ok } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  return ok({ user: user ? { name: user.name, phone: user.phone, initial: user.name.charAt(0).toUpperCase() } : null });
}
