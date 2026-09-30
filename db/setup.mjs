// npm run db:setup  -> creates the two tables and seeds them (only if they don't exist yet)
// npm run db:reset  -> drops everything and starts fresh (deletes all reviews!)
//
// Safe to run more than once: if the tables are already there, it leaves your data alone.

import { readFileSync, appendFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

// In GitHub Actions, surface any failure as a readable error note.
function fail(err) {
  const msg = String(err?.message ?? err).replace(/postgres(ql)?:\/\/\S+/g, "postgresql://***");
  if (process.env.GITHUB_ACTIONS) console.log(`::error::Database setup failed: ${msg}`);
  console.error(err);
  process.exit(1);
}
process.on("unhandledRejection", fail);
process.on("uncaughtException", fail);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Put it in .env.local (locally) or in your environment.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL.trim());

const reset = process.argv.includes("--reset");

// Split a .sql file into single statements (Neon's HTTP driver runs one at a time).
function statements(file) {
  return readFileSync(new URL(file, import.meta.url), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

if (reset) {
  console.log("Reset requested: dropping tables...");
  await sql.query("DROP TABLE IF EXISTS reviews");
  await sql.query("DROP TABLE IF EXISTS restaurants");
}

const [{ exists }] = await sql.query("SELECT to_regclass('public.restaurants') IS NOT NULL AS exists");

let seeded = false;
if (exists) {
  console.log("Tables already exist - leaving your data alone. (Use npm run db:reset to start over.)");
} else {
  for (const s of statements("./schema.sql")) await sql.query(s);
  console.log("Created tables: restaurants, reviews");
  for (const s of statements("./seed.sql")) await sql.query(s);
  console.log("Seeded: Ludhiana Burrito + 3 reviews");
  seeded = true;
}

// Let a GitHub Actions run know whether this was a fresh database.
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `seeded=${seeded}\n`);

console.log("\nrestaurants:");
console.table(await sql.query("SELECT * FROM restaurants ORDER BY id"));
console.log("reviews:");
console.table(await sql.query("SELECT id, restaurant_id, rating, comment, created_at FROM reviews ORDER BY id"));

console.log("Columns that do NOT exist: average_rating, latest_review.");
console.log("They are answers, not facts - the API computes them fresh on every request.");
