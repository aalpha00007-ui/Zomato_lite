import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });

export const metadata: Metadata = {
  title: "zomato-lite",
  description: "A learning project: a food-delivery app built with Next.js and Postgres. Not affiliated with Zomato.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e23744",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">
        {/* The whole app lives in a phone-width column, like a mobile app. */}
        <div className="relative mx-auto min-h-screen w-full max-w-[480px] bg-white">{children}</div>
      </body>
    </html>
  );
}
