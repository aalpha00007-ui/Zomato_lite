"use client";

// Screen 2 - the restaurant page.
// This file does NO maths: no adding, no dividing, no sorting.
// It asks GET /api/restaurants/[id] and prints what comes back, in order.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { RestaurantPage } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function RestaurantScreen() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RestaurantPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) setError(body.error ?? "Something went wrong.");
        else setData(body);
      })
      .catch(() => setError("Could not reach the server."));
  }, [id]);

  if (error) return <p className="text-muted">{error}</p>;
  if (!data) return <p className="text-muted">Loading...</p>;

  return (
    <div>
      {/* 1. Name, with cuisine and area underneath */}
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
        <p className="mt-1 text-muted">
          {data.cuisine} · {data.area}
        </p>
      </header>

      {data.latestReview === null ? (
        // 6. Empty state - nothing to average yet
        <section className="mt-12 rounded-lg border border-line px-6 py-10 text-center">
          <p className="text-lg">No reviews yet.</p>
          <p className="mt-1 text-muted">Be the first to say how it was.</p>
        </section>
      ) : (
        <>
          {/* 2. The average rating, large. Printed exactly as the API sent it. */}
          <section className="mt-10 flex items-baseline gap-3">
            <span className="text-7xl font-semibold tracking-tight">{data.averageRating}</span>
            <span className="text-2xl text-accent">★</span>
            <span className="text-sm text-muted">{data.totalReviews} reviews</span>
          </section>

          {/* 3. The latest review, set apart */}
          <section className="mt-10 rounded-lg border-l-2 border-accent bg-soft px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Latest review</p>
            <p className="mt-2 text-lg">{data.latestReview.comment}</p>
            <p className="mt-2 text-sm text-muted">
              {data.latestReview.rating} ★ · {formatDate(data.latestReview.createdAt)}
            </p>
          </section>

          {/* 4. Older reviews, plain list */}
          {data.reviews.length > 0 && (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {data.reviews.map((r) => (
                <li key={r.id} className="py-4">
                  <p>{r.comment}</p>
                  <p className="mt-1 text-sm text-muted">
                    {r.rating} ★ · {formatDate(r.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* 5. Link to write a review */}
      <Link
        href={`/review/${id}`}
        className="mt-10 inline-block rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper hover:bg-accent"
      >
        {data.latestReview === null ? "Write the first review" : "Write a review"}
      </Link>
    </div>
  );
}
