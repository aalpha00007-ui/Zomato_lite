// Small building blocks shared by every screen. They display values; they never calculate them.
import Link from "next/link";
import { BackIcon, StarIcon } from "@/components/Icons";

export function RatingBadge({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "lg" }) {
  const pad = size === "lg" ? "px-2 py-1 text-base" : "px-1.5 py-0.5 text-xs";
  if (rating === null) {
    return <span className={`inline-flex items-center rounded-md bg-soft font-semibold text-muted ${pad}`}>NEW</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-md bg-rating font-semibold text-white ${pad}`}>
      {rating} <StarIcon className={size === "lg" ? "h-3.5 w-3.5" : "h-2.5 w-2.5"} />
    </span>
  );
}

// The Indian food-label mark: green square-and-dot for veg, brown triangle for non-veg.
export function VegMark({ veg }: { veg: boolean }) {
  return (
    <span
      title={veg ? "Veg" : "Non-veg"}
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] ${veg ? "border-veg" : "border-nonveg"}`}
    >
      {veg ? (
        <span className="h-2 w-2 rounded-full bg-veg" />
      ) : (
        <span className="h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-nonveg" />
      )}
    </span>
  );
}

// A food "photo": the dish emoji on a warm tint. Keeps the demo free of copyrighted images.
export function FoodTile({ emoji, tint, className = "", big = false }: { emoji: string; tint: string; className?: string; big?: boolean }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`} style={{ backgroundColor: tint }}>
      <span className={big ? "text-7xl" : "text-4xl"} aria-hidden>
        {emoji}
      </span>
    </div>
  );
}

export function TopBar({ title, subtitle, back = "/" }: { title: string; subtitle?: string; back?: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-white px-4 py-3">
      <Link href={back} aria-label="Back" className="-ml-1 rounded-full p-1 text-ink hover:bg-soft">
        <BackIcon />
      </Link>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
      </div>
    </header>
  );
}

export function Disclaimer() {
  return (
    <p className="px-4 pb-28 pt-8 text-center text-[11px] leading-relaxed text-faint">
      zomato-lite is a learning project with made-up restaurants.
      <br />
      Not affiliated with, or endorsed by, Zomato. No real orders or payments.
    </p>
  );
}

export function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand" />
      {label}
    </div>
  );
}

export function Empty({ emoji, title, body, action }: { emoji: string; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <span className="text-6xl" aria-hidden>{emoji}</span>
      <p className="mt-4 text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function RedButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-[#f3a3aa] ${className}`}
    >
      {children}
    </button>
  );
}
