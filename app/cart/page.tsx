"use client";

// Cart and checkout. The bill rows, the total and the free-delivery nudge all come from GET /api/cart.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Disclaimer, Empty, Loading, RedButton, TopBar, VegMark } from "@/components/Bits";
import { CheckIcon, PinIcon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Address, Cart } from "@/lib/types";

const PAYMENTS = [
  { key: "cod", label: "Cash on delivery", note: "Pay the rider when food arrives" },
  { key: "upi", label: "UPI", note: "Demo only - no money moves" },
  { key: "card", label: "Credit / Debit card", note: "Demo only - no card details asked" },
];

export default function CartScreen() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("Home");
  const [newLine, setNewLine] = useState("");
  const [payment, setPayment] = useState("cod");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Cart>("/api/cart").then((r) => r.ok && setCart(r.data));
    api<{ addresses: Address[] }>("/api/addresses").then((r) => {
      if (!r.ok) return;
      setAddresses(r.data.addresses);
      if (r.data.addresses.length > 0) setAddressId(r.data.addresses[0].id);
      else setAdding(true);
    });
  }, []);

  async function change(menuItemId: number, delta: 1 | -1) {
    const r = await api<Cart>("/api/cart", { method: "POST", body: { menuItemId, change: delta } });
    if (r.ok) setCart(r.data);
    else setError(r.data.error ?? "Something went wrong.");
  }

  async function saveAddress() {
    setError(null);
    const r = await api<{ address: Address }>("/api/addresses", { method: "POST", body: { label: newLabel, line: newLine } });
    if (!r.ok) return setError(r.data.error ?? "Could not save the address.");
    setAddresses((list) => [...list, r.data.address]);
    setAddressId(r.data.address.id);
    setAdding(false);
    setNewLine("");
  }

  async function placeOrder() {
    setBusy(true);
    setError(null);
    const r = await api<{ orderId: number }>("/api/orders", { method: "POST", body: { addressId, paymentMethod: payment } });
    if (!r.ok) {
      setBusy(false);
      return setError(r.data.error ?? "Could not place the order.");
    }
    router.push(`/orders/${r.data.orderId}`);
  }

  if (!cart) return <Loading />;

  if (!cart.loggedIn) {
    return (
      <>
        <TopBar title="Cart" />
        <Empty
          emoji="🔐"
          title="Log in to see your cart"
          body="Your cart is saved to your account."
          action={<Link href="/login?next=/cart" className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white">Log in</Link>}
        />
      </>
    );
  }

  if (!cart.restaurant || !cart.bill) {
    return (
      <>
        <TopBar title="Cart" />
        <Empty
          emoji="🛒"
          title="Your cart is empty"
          body="Good food is always cooking. Go ahead, order some yummy items from the menu."
          action={<Link href="/" className="rounded-xl border border-brand px-6 py-3 text-sm font-semibold text-brand">Browse restaurants</Link>}
        />
      </>
    );
  }

  return (
    <div className="bg-soft pb-40">
      <TopBar title={cart.restaurant.name} subtitle={cart.restaurant.area} back={`/restaurant/${cart.restaurant.id}`} />

      {cart.hint && (
        <p className="bg-[#e8f6f0] px-4 py-2.5 text-center text-xs font-semibold text-veg">{cart.hint}</p>
      )}

      {/* Items */}
      <section className="mx-4 mt-4 rounded-2xl bg-white p-4">
        <ul className="space-y-4">
          {cart.items.map((item) => (
            <li key={item.menuItemId} className="flex items-center gap-3">
              <VegMark veg={item.veg} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{item.name}</p>
                <p className="text-xs text-muted">{item.priceLabel}</p>
              </div>
              <div className="flex items-center rounded-lg border border-brand bg-[#fff6f7] text-sm font-bold text-brand">
                <button aria-label="Remove one" onClick={() => change(item.menuItemId, -1)} className="px-2.5 py-1">−</button>
                <span className="min-w-4 text-center">{item.qty}</span>
                <button aria-label="Add one" onClick={() => change(item.menuItemId, 1)} className="px-2.5 py-1">+</button>
              </div>
              <span className="w-16 text-right text-sm font-medium">{item.lineTotalLabel}</span>
            </li>
          ))}
        </ul>
        <Link href={`/restaurant/${cart.restaurant.id}`} className="mt-4 block border-t border-dashed border-line pt-3 text-sm font-medium text-brand">
          + Add more items
        </Link>
      </section>

      {/* Bill */}
      <section className="mx-4 mt-4 rounded-2xl bg-white p-4">
        <h2 className="font-semibold">Bill details</h2>
        <dl className="mt-3 space-y-2 text-sm">
          {cart.bill.rows.map((row) => (
            <div key={row.label} className="flex justify-between">
              <dt className="text-muted">{row.label}</dt>
              <dd className={row.value === "FREE" ? "font-semibold text-veg" : ""}>{row.value}</dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
            <dt>To pay</dt>
            <dd>{cart.bill.toPayLabel}</dd>
          </div>
        </dl>
      </section>

      {/* Address */}
      <section className="mx-4 mt-4 rounded-2xl bg-white p-4">
        <h2 className="flex items-center gap-1.5 font-semibold">
          <PinIcon className="h-4 w-4 text-brand" /> Deliver to
        </h2>
        <ul className="mt-3 space-y-2">
          {addresses.map((a) => (
            <li key={a.id}>
              <button
                onClick={() => setAddressId(a.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left ${addressId === a.id ? "border-brand bg-brand-soft" : "border-line"}`}
              >
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${addressId === a.id ? "border-brand bg-brand text-white" : "border-faint"}`}>
                  {addressId === a.id && <CheckIcon className="h-2.5 w-2.5" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{a.label}</span>
                  <span className="block text-xs text-muted">{a.line}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        {adding ? (
          <div className="mt-3 space-y-2 rounded-xl border border-line p-3">
            <div className="flex gap-2">
              {["Home", "Work", "Other"].map((l) => (
                <button
                  key={l}
                  onClick={() => setNewLabel(l)}
                  className={`rounded-lg border px-3 py-1 text-xs ${newLabel === l ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line"}`}
                >
                  {l}
                </button>
              ))}
            </div>
            <textarea
              value={newLine}
              onChange={(e) => setNewLine(e.target.value)}
              rows={2}
              placeholder="House no, street, area (demo - any address works)"
              className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
            />
            <div className="flex gap-2">
              <button onClick={saveAddress} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Save address</button>
              {addresses.length > 0 && (
                <button onClick={() => setAdding(false)} className="px-3 text-sm text-muted">Cancel</button>
              )}
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="mt-3 text-sm font-medium text-brand">+ Add new address</button>
        )}
      </section>

      {/* Payment */}
      <section className="mx-4 mt-4 rounded-2xl bg-white p-4">
        <h2 className="font-semibold">Pay using</h2>
        <ul className="mt-3 space-y-2">
          {PAYMENTS.map((p) => (
            <li key={p.key}>
              <button
                onClick={() => setPayment(p.key)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${payment === p.key ? "border-brand bg-brand-soft" : "border-line"}`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${payment === p.key ? "border-brand bg-brand text-white" : "border-faint"}`}>
                  {payment === p.key && <CheckIcon className="h-2.5 w-2.5" />}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{p.label}</span>
                  <span className="block text-xs text-muted">{p.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer />

      {/* Place order */}
      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-white p-3">
        {error && <p className="mb-2 text-center text-sm text-brand">{error}</p>}
        <div className="flex items-center gap-3">
          <div className="w-24 shrink-0">
            <p className="text-base font-bold">{cart.bill.toPayLabel}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Total</p>
          </div>
          <RedButton className="flex-1" disabled={busy || addressId === null} onClick={placeOrder}>
            {busy ? "Placing order..." : addressId === null ? "Add an address to continue" : "Place Order"}
          </RedButton>
        </div>
      </div>
    </div>
  );
}
