"use client";

// DEMO sign-in. No SMS is sent and no real number is needed. The backend checks the demo OTP (1234).
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RedButton } from "@/components/Bits";
import { BackIcon } from "@/components/Icons";
import { api } from "@/lib/api";

export default function LoginScreen() {
  const router = useRouter();
  const [next, setNext] = useState("/");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const n = new URLSearchParams(window.location.search).get("next");
    if (n && n.startsWith("/")) setNext(n);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!otpSent) {
      setOtpSent(true);
      return;
    }
    setBusy(true);
    setError(null);
    const r = await api("/api/auth/login", { method: "POST", body: { name, phone, otp } });
    if (!r.ok) {
      setBusy(false);
      // Show exactly what the backend said.
      return setError(r.data.error ?? "Could not log in.");
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <div className="relative flex h-60 flex-col items-center justify-center bg-brand text-white">
        <Link href="/" aria-label="Back" className="absolute left-3 top-3 rounded-full bg-white/15 p-1.5">
          <BackIcon className="h-5 w-5" />
        </Link>
        <span className="text-6xl" aria-hidden>🍛🍕🍔</span>
        <p className="mt-4 text-3xl font-bold tracking-tight">zomato-lite</p>
        <p className="mt-1 text-sm opacity-90">A learning project · demo sign-in</p>
      </div>

      <form onSubmit={submit} className="px-6 pt-8">
        <h1 className="text-center text-lg font-semibold">Log in or sign up</h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-xs leading-relaxed text-muted">
          This is a demo. No SMS is sent - don't use your real number. Any 10-digit number like 9876543210 works.
        </p>

        <label className="mt-6 block">
          <span className="text-xs font-medium text-muted">Your name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Deep"
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-brand"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-muted">Mobile number (demo)</span>
          <div className="mt-1 flex rounded-xl border border-line focus-within:border-brand">
            <span className="border-r border-line px-3 py-3 text-sm text-muted">+91</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              placeholder="9876543210"
              className="min-w-0 flex-1 rounded-r-xl px-3 py-3 outline-none"
            />
          </div>
        </label>

        {otpSent && (
          <label className="mt-4 block">
            <span className="text-xs font-medium text-muted">Enter OTP - the demo OTP is 1234</span>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              autoFocus
              placeholder="1234"
              className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-center text-lg tracking-[0.5em] outline-none focus:border-brand"
            />
          </label>
        )}

        {error && <p className="mt-4 text-center text-sm text-brand">{error}</p>}

        <RedButton type="submit" className="mt-6 w-full" disabled={busy || name.trim() === "" || phone.length !== 10 || (otpSent && otp.length !== 4)}>
          {busy ? "Logging in..." : otpSent ? "Verify and continue" : "Send OTP"}
        </RedButton>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-faint">
          zomato-lite is not affiliated with, or endorsed by, Zomato.
        </p>
      </form>
    </div>
  );
}
