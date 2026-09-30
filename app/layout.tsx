import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zomato Lite",
  description: "One restaurant. Honest reviews.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <main className="mx-auto w-full max-w-[560px] px-5 py-12 sm:py-16">{children}</main>
      </body>
    </html>
  );
}
