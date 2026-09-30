// The red "View cart" bar that floats at the bottom once something is in the cart.
import Link from "next/link";
import { ChevronRight } from "@/components/Icons";
import type { Cart } from "@/lib/types";

export default function CartBar({ cart, above = false }: { cart: Cart | null; above?: boolean }) {
  if (!cart || cart.itemCount === 0 || !cart.restaurant || !cart.bill) return null;
  return (
    <div className={`fixed left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 px-3 ${above ? "bottom-[62px]" : "bottom-3"}`}>
      <Link href="/cart" className="flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-white shadow-lg">
        <span>
          <span className="block text-xs font-medium uppercase tracking-wide opacity-90">{cart.itemCountLabel}</span>
          <span className="block text-sm font-semibold">
            {cart.bill.toPayLabel} <span className="font-normal opacity-80">· {cart.restaurant.name}</span>
          </span>
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold">
          View cart <ChevronRight />
        </span>
      </Link>
    </div>
  );
}
