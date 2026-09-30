"use client";

// Home - the delivery feed. City, search, categories, filters, restaurant cards.
// Every filter is sent to GET /api/restaurants; the backend does the filtering, sorting and ratings.
import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CartBar from "@/components/CartBar";
import { Disclaimer, Empty, FoodTile, Loading, RatingBadge } from "@/components/Bits";
import { ChevronDown, ClockIcon, PinIcon, SearchIcon, TagIcon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Cart, Feed, Me } from "@/lib/types";

const CATEGORIES = [
  { label: "Biryani", emoji: "🍚", cuisine: "Biryani" },
  { label: "Pizza", emoji: "🍕", cuisine: "Pizza" },
  { label: "Burger", emoji: "🍔", cuisine: "Burger" },
  { label: "North Indian", emoji: "🍛", cuisine: "North Indian" },
  { label: "Chinese", emoji: "🥡", cuisine: "Chinese" },
  { label: "Dosa", emoji: "🥞", cuisine: "South Indian" },
  { label: "Rolls", emoji: "🌮", cuisine: "Rolls" },
  { label: "Thali", emoji: "🍲", cuisine: "Thali" },
  { label: "Desserts", emoji: "🍰", cuisine: "Desserts" },
  { label: "Coffee", emoji: "☕", cuisine: "Cafe" },
  { label: "Kashmiri", emoji: "🥘", cuisine: "Kashmiri" },
  { label: "Mexican", emoji: "🌯", cuisine: "Mexican" },
];

const FILTERS = [
  { key: "rating", label: "Rating 4.0+" },
  { key: "veg", label: "Pure Veg" },
  { key: "fast", label: "Fast Delivery" },
  { key: "budget", label: "Under ₹400 for two" },
] as const;

const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "rating", label: "Rating: High to Low" },
  { key: "delivery", label: "Delivery Time" },
  { key: "cost_low", label: "Cost: Low to High" },
  { key: "cost_high", label: "Cost: High to Low" },
];

type FilterKey = (typeof FILTERS)[number]["key"];

function remembered(key: string, fallback: string) {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function Home() {
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [cityId, setCityId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({ rating: false, veg: false, fast: false, budget: false });
  const [sort, setSort] = useState("relevance");
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<Me["user"]>(null);
  const [cart, setCart] = useState<Cart | null>(null);

  // First load: cities, who am I, my cart, and the city I picked last time.
  useEffect(() => {
    setCityId(remembered("zl_city", "1"));
    api<{ cities: { id: number; name: string }[] }>("/api/cities").then((r) => r.ok && setCities(r.data.cities));
    api<Me>("/api/me").then((r) => r.ok && setMe(r.data.user));
    api<Cart>("/api/cart").then((r) => r.ok && setCart(r.data));
  }, []);

  // Wait until typing pauses before searching.
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Ask the backend for the feed whenever anything changes.
  useEffect(() => {
    if (cityId === null) return;
    const p = new URLSearchParams({ city: cityId, sort });
    if (query) p.set("q", query);
    if (cuisine) p.set("cuisine", cuisine);
    for (const f of FILTERS) if (filters[f.key]) p.set(f.key, "1");
    let live = true;
    api<Feed>(`/api/restaurants?${p}`).then((r) => {
      if (!live) return;
      if (r.ok) {
        setFeed(r.data);
        setError(null);
      } else setError(r.data.error ?? "Something went wrong.");
    });
    return () => {
      live = false;
    };
  }, [cityId, query, cuisine, filters, sort]);

  function pickCity(id: string) {
    setCityId(id);
    try {
      window.localStorage.setItem("zl_city", id);
    } catch {}
  }

  const cityName = cities.find((c) => String(c.id) === cityId)?.name ?? feed?.city.name ?? "…";
  const anyFilter = cuisine !== null || query !== "" || FILTERS.some((f) => filters[f.key]) || sort !== "relevance";

  return (
    <div className="pb-4">
      {/* Location + profile */}
      <header className="flex items-center justify-between px-4 pt-4">
        <label className="relative flex min-w-0 cursor-pointer items-start gap-1.5">
          <PinIcon className="mt-0.5 h-6 w-6 shrink-0 text-brand" />
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-lg font-bold leading-tight">
              {cityName} <ChevronDown />
            </span>
            <span className="block truncate text-xs text-muted">Demo location · tap to switch city</span>
          </span>
          <select
            aria-label="Choose city"
            value={cityId ?? ""}
            onChange={(e) => pickCity(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <Link
          href={me ? "/profile" : "/login"}
          aria-label="Profile"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbe7f5] text-base font-semibold text-[#3b5b87]"
        >
          {me ? me.initial : "?"}
        </Link>
      </header>

      {/* Search */}
      <div className="sticky top-0 z-20 bg-white px-4 pb-2 pt-3">
        <label className="tile flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-3">
          <SearchIcon className="h-5 w-5 text-brand" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search "biryani", "momos" or a restaurant`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs font-medium text-muted">
              Clear
            </button>
          )}
        </label>
      </div>

      {/* What's on your mind? */}
      <section className="mt-3">
        <h2 className="px-4 text-xs font-semibold uppercase tracking-[0.15em] text-muted">What's on your mind?</h2>
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto px-4">
          {CATEGORIES.map((c) => {
            const on = cuisine === c.cuisine;
            return (
              <button
                key={c.label}
                onClick={() => setCuisine(on ? null : c.cuisine)}
                className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-[68px] w-[68px] items-center justify-center rounded-full text-4xl transition ${
                    on ? "bg-brand-soft ring-2 ring-brand" : "bg-soft"
                  }`}
                >
                  {c.emoji}
                </span>
                <span className={`text-xs ${on ? "font-semibold text-brand" : "text-ink"}`}>{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filters and sort */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <label className="relative flex shrink-0 items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-sm">
          {SORTS.find((s) => s.key === sort)?.label === "Relevance" ? "Sort" : SORTS.find((s) => s.key === sort)?.label}
          <ChevronDown className="h-3.5 w-3.5" />
          <select
            aria-label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm transition ${
              filters[f.key] ? "border-brand bg-brand-soft font-medium text-brand" : "border-line text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Restaurant list */}
      <section className="mt-5 px-4">
        {error ? (
          <p className="py-10 text-center text-sm text-muted">{error}</p>
        ) : !feed ? (
          <Loading label="Finding restaurants near you..." />
        ) : (
          <>
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{feed.countLabel}</h2>
            {feed.restaurants.length === 0 ? (
              <Empty
                emoji="🍽️"
                title="Nothing matches that"
                body="Try another dish or remove a filter."
                action={
                  anyFilter && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setCuisine(null);
                        setSort("relevance");
                        setFilters({ rating: false, veg: false, fast: false, budget: false });
                      }}
                      className="rounded-lg border border-brand px-4 py-2 text-sm font-medium text-brand"
                    >
                      Clear all filters
                    </button>
                  )
                }
              />
            ) : (
              <ul className="mt-4 space-y-6">
                {feed.restaurants.map((r) => (
                  <li key={r.id}>
                    <Link href={`/restaurant/${r.id}`} className="tile block overflow-hidden rounded-2xl bg-white">
                      <div className="relative">
                        <FoodTile emoji={r.emoji} tint={r.tint} className="h-44" big />
                        {r.pureVeg && (
                          <span className="absolute left-3 top-3 rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-veg">
                            PURE VEG
                          </span>
                        )}
                        {r.offer && (
                          <span className="absolute bottom-3 left-0 flex items-center gap-1 rounded-r-md bg-offer px-2.5 py-1 text-xs font-semibold uppercase text-white">
                            <TagIcon className="h-3 w-3" /> {r.offer}
                          </span>
                        )}
                      </div>
                      <div className="px-3.5 pb-3.5 pt-3">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold leading-snug">{r.name}</h3>
                          <RatingBadge rating={r.averageRating} />
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                          <ClockIcon className="h-3.5 w-3.5 text-veg" /> {r.deliveryTime} · {r.area}
                        </p>
                        <div className="mt-2 flex items-center justify-between border-t border-dashed border-line pt-2 text-sm text-muted">
                          <span className="truncate">{r.cuisine}</span>
                          <span className="shrink-0">{r.costLabel}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <Disclaimer />
      <CartBar cart={cart} above />
      <BottomNav />
    </div>
  );
}
