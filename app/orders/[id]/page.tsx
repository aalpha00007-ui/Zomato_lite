"use client";

// Live order tracking. The status is computed by the backend from the time the order was placed;
// this page just asks again every few seconds and shows whatever it is told.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Disclaimer, Empty, FoodTile, Loading, TopBar } from "@/components/Bits";
import { CheckIcon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { OrderDetail } from "@/lib/types";

export default function OrderScreen() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      const r = await api<OrderDetail>(`/api/orders/${id}`);
      if (!r.ok) return setError(r.data.error ?? "Something went wrong.");
      setOrder(r.data);
      if (!r.data.status.delivered) timer = setTimeout(load, 5000);
    };
    load();
    return () => clearTimeout(timer);
  }, [id]);

  if (error) return <><TopBar title="Order" back="/orders" /><Empty emoji="🧾" title="Can't show this order" body={error} /></>;
  if (!order) return <Loading />;

  return (
    <div className="min-h-screen bg-soft">
      <TopBar title={order.restaurant.name} subtitle={`Order #${order.id} · ${order.placedAtLabel}`} back="/orders" />

      {/* Status */}
      <section className={`px-5 py-6 text-white ${order.status.delivered ? "bg-veg" : "bg-brand"}`}>
        <p className="text-xs font-medium uppercase tracking-widest opacity-80">Order status</p>
        <p className="mt-1 text-2xl font-bold">{order.status.label}</p>
        <p className="mt-1 text-sm opacity-90">{order.status.note}</p>
      </section>

      <section className="mx-4 -mt-3 rounded-2xl bg-white p-5">
        <ol>
          {order.status.steps.map((s, i) => (
            <li key={s.key} className="relative flex gap-3 pb-5 last:pb-0">
              {i < order.status.steps.length - 1 && (
                <span className={`absolute left-[11px] top-6 h-full w-0.5 ${s.done && !s.current ? "bg-veg" : "bg-line"}`} />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  s.done ? "bg-veg text-white" : "border-2 border-line bg-white"
                } ${s.current && !order.status.delivered ? "ring-4 ring-[#cdeee2]" : ""}`}
              >
                {s.done && <CheckIcon className="h-3 w-3" />}
              </span>
              <span className={`pt-0.5 text-sm ${s.current ? "font-semibold" : s.done ? "" : "text-faint"}`}>{s.label}</span>
            </li>
          ))}
        </ol>
        {!order.status.delivered && (
          <p className="mt-4 rounded-lg bg-soft px-3 py-2 text-xs text-muted">
            Demo tracking: updates on its own every few seconds and reaches "Delivered" about 6 minutes after ordering.
          </p>
        )}
      </section>

      {order.status.delivered && (
        <Link
          href={`/review/${order.restaurant.id}`}
          className="mx-4 mt-4 flex items-center justify-between rounded-2xl bg-white p-4"
        >
          <span className="text-sm font-semibold">How was your food? Rate {order.restaurant.name}</span>
          <span className="text-xl text-gold">★★★★★</span>
        </Link>
      )}

      {/* Items and bill */}
      <section className="mx-4 mt-4 rounded-2xl bg-white p-4">
        <div className="flex items-center gap-3">
          <FoodTile emoji={order.restaurant.emoji} tint={order.restaurant.tint} className="h-10 w-10 rounded-lg [&>span]:text-xl" />
          <div>
            <p className="font-semibold">{order.restaurant.name}</p>
            <p className="text-xs text-muted">{order.restaurant.area}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2 border-t border-dashed border-line pt-4 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3">
              <span>
                <span className="font-semibold text-brand">{i.qty} x</span> {i.name}
              </span>
              <span>{i.lineTotalLabel}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          {order.bill.rows.map((row) => (
            <div key={row.label} className="flex justify-between">
              <dt className="text-muted">{row.label}</dt>
              <dd className={row.value === "FREE" ? "font-semibold text-veg" : ""}>{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>Paid</dt>
            <dd>{order.bill.toPayLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="mx-4 mt-4 space-y-3 rounded-2xl bg-white p-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Delivering to</p>
          <p className="mt-0.5 font-semibold">{order.address.label}</p>
          <p className="text-muted">{order.address.line}</p>
        </div>
        <div className="border-t border-line pt-3">
          <p className="text-xs uppercase tracking-wide text-muted">Payment</p>
          <p className="mt-0.5 font-semibold">{order.paymentLabel}</p>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
