// Turns "2026-09-24T13:44:00Z" into "24 Sept, 7:14 pm". Display only - no maths.
export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}
