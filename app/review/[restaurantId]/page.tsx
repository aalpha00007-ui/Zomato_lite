"use client";

// Write a review. The frontend collects three things, hands them to POST /api/reviews, and steps back.
// Its checks (Submit disabled until ready) are kindness. The backend's checks are security.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Empty, FoodTile, RedButton, TopBar } from "@/components/Bits";
import { StarIcon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Me, RestaurantPage } from "@/lib/types";

const STARS = [1, 2, 3, 4, 5];
const WORDS = ["", "Horrible", "Bad", "Average", "Good", "Excellent"];

export default function ReviewScreen() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<RestaurantPage | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [me, setMe] = useState<Me["user"]>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<RestaurantPage>(`/api/restaurants/${restaurantId}`).then((r) => (r.ok ? setRestaurant(r.data) : setNotFound(true)));
    api<Me>("/api/me").then((r) => r.ok && setMe(r.data.user));
  }, [restaurantId]);

  const ready = rating !== null && comment.trim() !== "" && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    const r = await api<{ reviewId: number }>("/api/reviews", {
      method: "POST",
      body: { restaurantId: Number(restaurantId), rating, comment },
    });
    if (!r.ok) {
      // Show exactly what the backend said - no invented messages.
      setError(r.data.error ?? "Something went wrong.");
      setSubmitting(false);
      return;
    }
    router.push(`/restaurant/${restaurantId}#reviews`);
  }

  if (notFound) return <><TopBar title="Write a review" /><Empty emoji="🔎" title="Restaurant not found" body="It may have been removed." /></>;

  return (
    <form onSubmit={submit} className="min-h-screen">
      <TopBar title="Write a review" back={`/restaurant/${restaurantId}`} />

      <div className="flex items-center gap-3 px-4 pt-5">
        {restaurant && <FoodTile emoji={restaurant.emoji} tint={restaurant.tint} className="h-14 w-14 rounded-xl [&>span]:text-3xl" />}
        <div>
          <p className="text-lg font-bold leading-tight">{restaurant?.name ?? "..."}</p>
          <p className="text-sm text-muted">{restaurant ? `${restaurant.area}, ${restaurant.city}` : ""}</p>
        </div>
      </div>

      <section className="mt-8 px-4 text-center">
        <p className="font-semibold">How was the food?</p>
        <div className="mt-4 flex justify-center gap-2">
          {STARS.map((n) => {
            const on = rating !== null && n <= rating;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-pressed={rating === n}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                  on ? "border-rating bg-rating text-white" : "border-line text-line hover:border-rating"
                }`}
              >
                <StarIcon className="h-6 w-6" />
              </button>
            );
          })}
        </div>
        <p className="mt-2 h-5 text-sm font-medium text-rating">{rating ? WORDS[rating] : ""}</p>
      </section>

      <label className="mt-6 block px-4">
        <span className="text-sm font-semibold">Tell others about your experience</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          placeholder="What did you order? How was the taste, portion and packaging?"
          className="mt-2 block w-full rounded-xl border border-line px-4 py-3 text-sm outline-none focus:border-brand"
        />
      </label>

      <p className="mt-2 px-4 text-xs text-muted">{me ? `Posting as ${me.name}` : "Posting as Guest - log in to use your name."}</p>
      {error && <p className="mt-4 px-4 text-sm text-brand">{error}</p>}

      <div className="px-4 pb-10 pt-6">
        <RedButton type="submit" disabled={!ready} className="w-full">
          {submitting ? "Posting..." : "Submit review"}
        </RedButton>
      </div>
    </form>
  );
}
