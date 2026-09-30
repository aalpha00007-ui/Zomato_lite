import Link from "next/link";

// The homepage is one line: proof the app is alive, and a way in.
export default function Home() {
  return (
    <p className="text-lg">
      Zomato Lite is alive.{" "}
      <Link href="/restaurant/1" className="text-accent underline underline-offset-4">
        Open Ludhiana Burrito
      </Link>
    </p>
  );
}
