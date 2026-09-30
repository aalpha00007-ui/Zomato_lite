# Zomato Lite

One restaurant (Ludhiana Burrito, Sector 32), two screens, two APIs, two tables.

**The lesson: store facts, compute answers.** There is no `average_rating` column. The backend runs `AVG(rating)` every time the page loads.

| Layer | Where |
|---|---|
| Frontend | `app/restaurant/[id]/page.tsx`, `app/review/[restaurantId]/page.tsx` |
| Backend | `app/api/reviews/route.ts`, `app/api/restaurants/[id]/route.ts` |
| Database | `db/schema.sql`, `db/seed.sql`, `db/setup.mjs` |
| Deployment | `.github/workflows/deploy.yml` (every push to `main` builds, tests and deploys to Vercel) |

## Run it on your laptop

```bash
npm install
# create .env.local with: DATABASE_URL=postgresql://...
npm run db:setup     # creates tables + seeds (safe to re-run)
npm run dev          # http://localhost:3000/restaurant/1
```

## Try to break it

```bash
curl -X POST localhost:3000/api/reviews -H "Content-Type: application/json" \
  -d '{"restaurantId":1,"rating":500,"comment":"hacked"}'
# -> 400 {"error":"Rating must be a whole number from 1 to 5."}
```
