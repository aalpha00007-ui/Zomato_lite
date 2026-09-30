// Turning facts into the exact words the screen shows. Backend only.

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export function dateLabel(d: string | Date) {
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function averageOf(value: unknown): number | null {
  return value === null || value === undefined ? null : Number(value);
}
