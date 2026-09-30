"use client";

// Restaurant page. Calls GET /api/restaurants/[id] and GET /api/cart, and prints what comes back.
// No maths in this file: the average, the bill and every quantity arrive already worked out.
// Tapping ADD / + / - sends { change: 1 } or { change: -1 }; the backend decides the new quantity.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import CartBar from "@/components/CartBar";
import { Disclaimer, Empty, FoodTile, Loading, RatingBadge, VegMark } from "@/components/Bits";
import { BackIcon, ClockIcon, PinIcon, StarIcon, TagIcon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Cart, RestaurantPage } from "@/lib/types";

export default function RestaurantScreen() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<RestaurantPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [vegOnly, setVegOnly] = useState(false);
  const [conflict, setConflict] = useState<{ menuItemId: number; message: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    api<RestaurantPage>(`/api/restaurants/${id}`).then((r) => (r.ok ? setData(r.data) : setError(r.data.error ?? "Something went wrong.")));
    api<Cart>("/api/cart").then((r) => r.ok && setCart(r.data));
  }, [id]);

  async function change(menuItemId: number, delta: 1 | -1, replace = false) {
    setBusy(menuItemId);
    const r = await api<Cart>("/api/cart", { method: "POST", body: { menuItemId, change: delta, replace } });
    setBusy(null);
    if (r.ok) return setCart(r.data);
    if (r.status === 401) return router.push(`/login?next=/restaurant/${id}`);
    if (r.status === 409 && r.data.code === "DIFFERENT_RESTAURANT") return setConflict({ menuItemId, message: r.data.error ?? "" });
    setToast(r.data.error ?? "Something went wrong.");
    setTimeout(() => setToast(null), 2500);
  }

  if (error) return <Empty emoji="🔎" title="Restaurant not found" body={error} action={<Link href="/" className="text-sm font-medium text-brand">Back to home</Link>} />;
  if (!data) return <Loading />;

  const qtyOf = (menuItemId: number) => cart?.items.find((i) => i.menuItemId === menuItemId)?.qty ?? 0;

  return (
    <div>
      {/* Hero */}
      <div className="relative">
        <FoodTile emoji={data.emoji} tint={data.tint} className="h-52" big />
        <Link href="/" aria-label="Back" className="absolute left-3 top-3 rounded-full bg-white/90 p-1.5 shadow">
          <BackIcon className="h-5 w-5" />
        </Link>
      </div>

      {/* Info card */}
      <section className="tile relative z-10 mx-4 -mt-10 rounded-2xl bg-white p-4 text-center">
        {data.pureVeg && <p className="text-[11px] font-semibold tracking-wide text-veg">PURE VEG</p>}
        <h1 className="text-2xl font-bold leading-tight">{data.name}</h1>
        <p className="mt-1 text-sm text-muted">{data.cuisine}</p>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-muted">
          <PinIcon className="h-3.5 w-3.5 text-brand" /> {data.area}, {data.city}
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <RatingBadge rating={data.averageRating} size="lg" />
          <span className="text-sm text-muted underline decoration-dotted underline-offset-4">
            <a href="#reviews">{data.totalReviewsLabel}</a>
          </span>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 border-t border-dashed border-line pt-3 text-sm">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4 text-veg" /> {data.deliveryTime}
          </span>
          <span className="text-line">|</span>
          <span>{data.costLabel}</span>
        </div>
      </section>

      {data.offer && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-[#cfe0ff] bg-[#f2f7ff] px-3 py-2.5 text-sm font-medium text-offer">
          <TagIcon /> {data.offer}
        </div>
      )}

      {/* Menu */}
      <div className="mt-6 flex items-center justify-between px-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Menu</h2>
        {!data.pureVeg && (
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${vegOnly ? "border-veg bg-[#e8f6f0] text-veg" : "border-line"}`}
          >
            <VegMark veg /> Veg only
          </button>
        )}
      </div>

      {data.menu.map((section) => {
        const items = vegOnly ? section.items.filter((i) => i.veg) : section.items;
        if (items.length === 0) return null;
        return (
          <section key={section.category} className="mt-4">
            <h3 className="px-4 text-lg font-bold">{section.category}</h3>
            <ul>
              {items.map((item) => {
                const qty = qtyOf(item.id);
                return (
                  <li key={item.id} className="mx-4 flex gap-4 border-b border-dashed border-line py-5 last:border-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <VegMark veg={item.veg} />
                        {item.bestseller && (
                          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gold">
                            <StarIcon className="h-2.5 w-2.5" /> Bestseller
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 font-semibold leading-snug">{item.name}</p>
                      <p className="mt-0.5 text-sm font-medium">{item.priceLabel}</p>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{item.description}</p>
                    </div>
                    <div className="relative w-28 shrink-0">
                      <FoodTile emoji={data.emoji} tint={data.tint} className="h-24 w-28 rounded-xl" />
                      <div className="absolute -bottom-3 left-1/2 w-24 -translate-x-1/2">
                        {qty === 0 ? (
                          <button
                            disabled={busy === item.id}
                            onClick={() => change(item.id, 1)}
                            className="w-full rounded-lg border border-brand bg-[#fff6f7] py-1.5 text-sm font-bold text-brand shadow-sm disabled:opacity-60"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex w-full items-center justify-between rounded-lg bg-brand text-sm font-bold text-white shadow-sm">
                            <button aria-label="Remove one" disabled={busy === item.id} onClick={() => change(item.id, -1)} className="px-3 py-1.5">
                              −
                            </button>
                            <span>{qty}</span>
                            <button aria-label="Add one" disabled={busy === item.id} onClick={() => change(item.id, 1)} className="px-3 py-1.5">
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="h-2 bg-soft" />
          </section>
        );
      })}

      {/* Reviews */}
      <section id="reviews" className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Ratings & reviews</h2>
          <Link href={`/review/${data.id}`} className="text-sm font-semibold text-brand">
            Write a review
          </Link>
        </div>

        {data.latestReview === null ? (
          <div className="mt-4 rounded-2xl border border-dashed border-line px-5 py-8 text-center">
            <p className="font-semibold">No reviews yet</p>
            <p className="mt-1 text-sm text-muted">Be the first to tell others how it was.</p>
          </div>
        ) : (
          <>
            {/* The average, printed exactly as the API sent it. */}
            <div className="mt-4 flex items-center gap-4 rounded-2xl bg-soft p-4">
              <span className="text-5xl font-bold">{data.averageRating}</span>
              <div>
                <RatingBadge rating={data.averageRating} />
                <p className="mt-1 text-sm text-muted">{data.totalReviewsLabel}</p>
              </div>
            </div>

            <article className="mt-4 rounded-2xl border-l-4 border-brand bg-brand-soft px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">Latest review</p>
              <div className="mt-2 flex items-center gap-2">
                <RatingBadge rating={data.latestReview.rating} />
                <span className="text-sm font-semibold">{data.latestReview.author}</span>
              </div>
              <p className="mt-2">{data.latestReview.comment}</p>
              <p className="mt-1 text-xs text-muted">{data.latestReview.dateLabel}</p>
            </article>

            <ul className="mt-2 divide-y divide-line">
              {data.reviews.map((r) => (
                <li key={r.id} className="py-4">
                  <div className="flex items-center gap-2">
                    <RatingBadge rating={r.rating} />
                    <span className="text-sm font-semibold">{r.author}</span>
                  </div>
                  <p className="mt-2 text-sm">{r.comment}</p>
                  <p className="mt-1 text-xs text-muted">{r.dateLabel}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Disclaimer />
      <CartBar cart={cart} />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-ink px-4 py-2 text-sm text-white">{toast}</div>
      )}

      {/* One-restaurant-per-cart prompt */}
      {conflict && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-white p-6">
            <p className="text-lg font-bold">Replace cart items?</p>
            <p className="mt-2 text-sm text-muted">{conflict.message}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setConflict(null)} className="flex-1 rounded-xl border border-brand py-3 text-sm font-semibold text-brand">
                No
              </button>
              <button
                onClick={async () => {
                  const target = conflict.menuItemId;
                  setConflict(null);
                  await change(target, 1, true);
                }}
                className="flex-1 rounded-xl bg-brand py-3 text-sm font-semibold text-white"
              >
                Replace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
