"use client";

// Profile: who you are, saved addresses, log out.
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Disclaimer, Empty, Loading } from "@/components/Bits";
import { BagIcon, ChevronRight, PinIcon, TrashIcon } from "@/components/Icons";
import { api } from "@/lib/api";
import type { Address, Me } from "@/lib/types";

export default function ProfileScreen() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [label, setLabel] = useState("Home");
  const [line, setLine] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Me>("/api/me").then((r) => {
      setMe(r.ok ? r.data : { user: null });
      if (r.ok && r.data.user) {
        api<{ addresses: Address[] }>("/api/addresses").then((a) => a.ok && setAddresses(a.data.addresses));
      }
    });
  }, []);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = await api<{ address: Address }>("/api/addresses", { method: "POST", body: { label, line } });
    if (!r.ok) return setError(r.data.error ?? "Could not save.");
    setAddresses((list) => [...list, r.data.address]);
    setLine("");
  }

  async function removeAddress(id: number) {
    const r = await api(`/api/addresses/${id}`, { method: "DELETE" });
    if (r.ok) setAddresses((list) => list.filter((a) => a.id !== id));
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (!me) return <Loading />;

  return (
    <div className="min-h-screen bg-soft">
      {!me.user ? (
        <>
          <header className="bg-white px-4 pb-4 pt-5">
            <h1 className="text-2xl font-bold">Profile</h1>
          </header>
          <Empty
            emoji="👋"
            title="Log in to your account"
            body="Save addresses, track orders and post reviews under your name."
            action={<Link href="/login?next=/profile" className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white">Log in</Link>}
          />
        </>
      ) : (
        <>
          <header className="flex items-center gap-4 bg-white px-4 pb-5 pt-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dbe7f5] text-2xl font-semibold text-[#3b5b87]">
              {me.user.initial}
            </span>
            <div>
              <h1 className="text-xl font-bold">{me.user.name}</h1>
              <p className="text-sm text-muted">+91 {me.user.phone}</p>
            </div>
          </header>

          <Link href="/orders" className="mx-4 mt-4 flex items-center gap-3 rounded-2xl bg-white p-4">
            <BagIcon className="h-5 w-5 text-brand" />
            <span className="flex-1 font-medium">Your orders</span>
            <ChevronRight className="h-5 w-5 text-faint" />
          </Link>

          <section className="mx-4 mt-4 rounded-2xl bg-white p-4">
            <h2 className="flex items-center gap-1.5 font-semibold">
              <PinIcon className="h-4 w-4 text-brand" /> Saved addresses
            </h2>
            {addresses.length === 0 && <p className="mt-2 text-sm text-muted">No addresses saved yet.</p>}
            <ul className="mt-3 divide-y divide-line">
              {addresses.map((a) => (
                <li key={a.id} className="flex items-start gap-3 py-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.label}</p>
                    <p className="text-xs text-muted">{a.line}</p>
                  </div>
                  <button aria-label={`Delete ${a.label}`} onClick={() => removeAddress(a.id)} className="p-1 text-faint hover:text-brand">
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>
            <form onSubmit={addAddress} className="mt-3 space-y-2 border-t border-dashed border-line pt-3">
              <div className="flex gap-2">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    type="button"
                    key={l}
                    onClick={() => setLabel(l)}
                    className={`rounded-lg border px-3 py-1 text-xs ${label === l ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line"}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <textarea
                value={line}
                onChange={(e) => setLine(e.target.value)}
                rows={2}
                placeholder="Add a new address (demo - any address works)"
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-brand"
              />
              {error && <p className="text-sm text-brand">{error}</p>}
              <button type="submit" disabled={line.trim() === ""} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                Save address
              </button>
            </form>
          </section>

          <button onClick={logout} className="mx-4 mt-4 w-[calc(100%-2rem)] rounded-2xl bg-white p-4 text-left font-medium text-brand">
            Log out
          </button>
        </>
      )}
      <Disclaimer />
      <BottomNav />
    </div>
  );
}
