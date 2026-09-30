// npm run db:setup  -> creates the tables and demo data if they aren't there yet (safe to re-run)
// npm run db:reset  -> drops everything and starts fresh (deletes all users, orders and reviews!)
//
// Upgrading from the first version (2 tables) happens automatically: if the v2 tables are
// missing, the old ones are dropped and everything is recreated.

import { readFileSync, appendFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { cities, restaurants, reviewsFor } from "./seed-data.mjs";

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

const ALL_TABLES = [
  "order_items", "orders", "cart_items", "reviews", "addresses",
  "sessions", "users", "menu_items", "restaurants", "cities",
];

// Split schema.sql into single statements (Neon's HTTP driver runs one at a time).
function statements(file) {
  return readFileSync(new URL(file, import.meta.url), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Build "($1,$2,$3),($4,$5,$6)" for a multi-row insert.
function values(rows) {
  const params = [];
  const groups = rows.map((row) => {
    const ph = row.map((v) => {
      params.push(v);
      return `$${params.length}`;
    });
    return `(${ph.join(",")})`;
  });
  return { text: groups.join(","), params };
}

const [{ ready }] = await sql.query("SELECT to_regclass('public.menu_items') IS NOT NULL AS ready");

let seeded = false;
if (ready && !reset) {
  console.log("Tables already exist - leaving your data alone. (Use npm run db:reset to start over.)");
} else {
  console.log(reset ? "Reset requested: dropping everything..." : "Upgrading to v2: dropping old tables...");
  for (const t of ALL_TABLES) await sql.query(`DROP TABLE IF EXISTS ${t} CASCADE`);

  for (const s of statements("./schema.sql")) await sql.query(s);
  console.log("Created tables:", ALL_TABLES.slice().reverse().join(", "));

  const cityIds = {};
  for (const name of cities) {
    const [row] = await sql.query("INSERT INTO cities (name) VALUES ($1) RETURNING id", [name]);
    cityIds[name] = row.id;
  }

  let n = 0;
  for (const r of restaurants) {
    n += 1;
    const [row] = await sql.query(
      `INSERT INTO restaurants (city_id, name, cuisine, area, cost_for_two, delivery_minutes, pure_veg, emoji, tint, offer)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
      [cityIds[r.city], r.name, r.cuisine, r.area, r.cost, r.mins, r.veg, r.emoji, r.tint, r.offer]
    );
    const id = row.id;

    const menu = values(r.menu.map(([cat, name, desc, price, veg, best]) => [id, cat, name, desc, price, veg, best]));
    await sql.query(
      `INSERT INTO menu_items (restaurant_id, category, name, description, price, veg, bestseller) VALUES ${menu.text}`,
      menu.params
    );

    const revs = reviewsFor(n);
    if (revs.length > 0) {
      const rv = values(revs.map(([author, rating, comment, daysAgo]) => [id, author, rating, comment, daysAgo]));
      // created_at = now minus N days, so "latest" is meaningful
      await sql.query(
        `INSERT INTO reviews (restaurant_id, author, rating, comment, created_at)
         SELECT v.rid::int, v.author, v.rating::int, v.comment, NOW() - (v.days::int * INTERVAL '1 day')
         FROM (VALUES ${rv.text}) AS v(rid, author, rating, comment, days)`,
        rv.params.map(String)
      );
    }
  }
  console.log(`Seeded: ${cities.length} cities, ${restaurants.length} restaurants with menus and reviews`);
  seeded = true;
}

// Let a GitHub Actions run know whether this was a fresh database.
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `seeded=${seeded}\n`);

console.table(
  await sql.query(`
    SELECT c.name AS city, COUNT(DISTINCT r.id)::int AS restaurants, COUNT(m.id)::int AS menu_items
    FROM cities c JOIN restaurants r ON r.city_id = c.id JOIN menu_items m ON m.restaurant_id = r.id
    GROUP BY c.name ORDER BY c.name`)
);
console.log("Still no average_rating, order_total or order_status columns - those are computed on request.");
