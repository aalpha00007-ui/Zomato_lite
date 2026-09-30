"use client";

// Your orders. Status labels and totals come from GET /api/orders.
import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Disclaimer, Empty, FoodTile, Loading } from "@/components/Bits";
import { ChevronRight } from "@/components/Icons";
import { api } from "@/lib/api";
import type { OrderSummary } from "@/lib/types";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    api<{ orders: OrderSummary[] }>("/api/orders").then((r) => {
      if (r.status === 401) return setLoggedOut(true);
      setOrders(r.ok ? r.data.orders : []);
    });
  }, []);

  return (
    <div className="min-h-screen bg-soft">
      <header className="bg-white px-4 pb-4 pt-5">
        <h1 className="text-2xl font-bold">Your orders</h1>
      </header>

      {loggedOut ? (
        <Empty
          emoji="🧾"
          title="Log in to see your orders"
          body="Past orders and live tracking show up here."
          action={<Link href="/login?next=/orders" className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white">Log in</Link>}
        />
      ) : orders === null ? (
        <Loading />
      ) : orders.length === 0 ? (
        <Empty
          emoji="🥡"
          title="No orders yet"
          body="When you place an order, you can track it here."
          action={<Link href="/" className="rounded-xl border border-brand px-6 py-3 text-sm font-semibold text-brand">Order now</Link>}
        />
      ) : (
        <ul className="space-y-3 p-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/orders/${o.id}`} className="block rounded-2xl bg-white p-4">
                <div className="flex items-center gap-3">
                  <FoodTile emoji={o.restaurant.emoji} tint={o.restaurant.tint} className="h-12 w-12 rounded-xl [&>span]:text-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{o.restaurant.name}</p>
                    <p className="text-xs text-muted">{o.restaurant.area}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-faint" />
                </div>
                <p className="mt-3 line-clamp-2 border-t border-dashed border-line pt-3 text-sm text-muted">{o.summary}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted">{o.placedAtLabel}</span>
                  <span className="font-semibold">{o.toPayLabel}</span>
                </div>
                <p className={`mt-2 inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${o.delivered ? "bg-[#e8f6f0] text-veg" : "bg-brand-soft text-brand"}`}>
                  {o.statusLabel}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Disclaimer />
      <BottomNav />
    </div>
  );
}
