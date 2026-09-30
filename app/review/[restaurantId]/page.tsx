"use client";

// Screen 1 - write a review.
// The frontend collects three things, hands them to POST /api/reviews, and steps back.
// Its checks (submit disabled until ready) are kindness. The backend's checks are security.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const STARS = [1, 2, 3, 4, 5];

export default function ReviewScreen() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const router = useRouter();

  const [name, setName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the restaurant name so you know what you're reviewing.
  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return setNotFound(true);
        const body = await res.json();
        setName(body.name);
      })
      .catch(() => setNotFound(true));
  }, [restaurantId]);

  const ready = rating !== null && comment.trim() !== "" && !submitting;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: Number(restaurantId), rating, comment }),
      });
      const body = await res.json();
      if (!res.ok) {
        // Show exactly what the backend said - no invented messages.
        setError(body.error);
        setSubmitting(false);
        return;
      }
      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server.");
      setSubmitting(false);
    }
  }

  if (notFound) return <p className="text-muted">Restaurant not found.</p>;

  return (
    <form onSubmit={submit}>
      <Link href={`/restaurant/${restaurantId}`} className="text-sm text-muted hover:text-ink">
        ← Back
      </Link>
      <p className="mt-8 text-sm text-muted">Your review of</p>
      <h1 className="text-3xl font-semibold tracking-tight">{name ?? "..."}</h1>

      <fieldset className="mt-10">
        <legend className="text-sm font-medium">Rating</legend>
        <div className="mt-3 flex gap-2">
          {STARS.map((n) => {
            const on = rating !== null && n <= rating;
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-pressed={rating === n}
                className={`h-12 w-12 rounded-md border text-2xl transition-colors ${
                  on ? "border-accent bg-accent text-paper" : "border-line text-muted hover:border-accent"
                }`}
              >
                ★
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-8 block">
        <span className="text-sm font-medium">Comment</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="How was it?"
          className="mt-3 block w-full rounded-md border border-line bg-white px-4 py-3 outline-none focus:border-accent"
        />
      </label>

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}

      <button
        type="submit"
        disabled={!ready}
        className="mt-8 w-full rounded-md bg-ink px-5 py-3 font-medium text-paper hover:bg-accent disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        {submitting ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
