"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BagIcon, DeliveryIcon, UserIcon } from "@/components/Icons";

const TABS = [
  { href: "/", label: "Delivery", Icon: DeliveryIcon },
  { href: "/orders", label: "Orders", Icon: BagIcon },
  { href: "/profile", label: "Profile", Icon: UserIcon },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ href, label, Icon }) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-brand" : "text-muted"}`}
          >
            {active && <span className="absolute top-0 h-[3px] w-10 rounded-b-full bg-brand" />}
            <Icon className="h-6 w-6" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
