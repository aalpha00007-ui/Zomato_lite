# zomato-lite

A learning project: a food-delivery app in the style of the big Indian apps, built with Next.js, Postgres (Neon) and raw SQL.
30 made-up restaurants across Ludhiana, Jammu and Chandigarh. **Not affiliated with Zomato. No real orders or payments.**

**Features:** home feed with city switcher, search, categories, filters and sort · restaurant pages with veg/non-veg menus · cart (one restaurant at a time) with a live bill · addresses · checkout · order history and live tracking · demo sign-in (OTP is always `1234`) · ratings and reviews.

**The lesson still holds: store facts, compute answers.** There is no `average_rating`, `order_total` or `order_status` column.
Ratings come from `AVG(rating)`, bills from `SUM(price * qty)`, and delivery status from how long ago the order was placed.
The screens never calculate anything; they print what the APIs send.

| Layer | Where |
|---|---|
| Frontend | `app/**/page.tsx`, `components/` |
| Backend | `app/api/**/route.ts`, `lib/` (bill rules, order status, cart, auth) |
| Database | `db/schema.sql`, `db/seed-data.mjs`, `db/setup.mjs` |
| Deployment | `.github/workflows/deploy.yml` (every push to `main` builds, tests and deploys to Vercel) |

## Run it on your laptop

```bash
npm install
# create .env.local with: DATABASE_URL=postgresql://...
npm run db:setup     # creates tables + demo data (safe to re-run; npm run db:reset starts over)
npm run dev          # http://localhost:3000
```

## Try to break it

```bash
curl -X POST localhost:3000/api/reviews -H "Content-Type: application/json" \
  -d '{"restaurantId":1,"rating":500,"comment":"hacked"}'
# -> 400 {"error":"Rating must be a whole number from 1 to 5."}
```
