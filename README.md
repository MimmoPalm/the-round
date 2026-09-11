# The Round

A pub-crawl tracker + game for London N1. Enter your name, tick off pubs
as you visit them, watch the leaderboard, get a random pick from Pint
Roulette when you can't decide, and earn a crown for every postcode you
fully conquer. No login, no gate — honour system, like buying your round.

969 pubs within 5km of 329 Essex Road, N1 2YG.

## Stack

- Vite + React + TypeScript + Tailwind CSS v4 (static SPA, no server)
- Leaflet + leaflet.markercluster for the map (969 pins, clustered for
  mobile perf)
- No icon package, no UI kit, no analytics/trackers — kept deliberately
  dependency-light so it stays fast on 4G

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

## Data

- `public/data/pubs.json` — the 969-pub source of truth (name, address,
  postcode, lat, lon, website). Copied verbatim from the source dataset;
  not re-fetched or re-derived. Some entries have no address/postcode —
  the UI shows "address unknown" for those.
- Pub id = a stable slug derived from `name` + rounded `lat`/`lon`
  (`src/lib/pubId.ts`), so it stays the same across reloads regardless of
  array order.

## Backend

Supabase REST, table `the_round_visits`, public anon (publishable) key —
safe to ship client-side, there's no other backend or API key involved.

- **Read**: `GET {supabase_url}/rest/v1/the_round_visits?select=player,pub_id,created_at`
- **Write**: `POST {supabase_url}/rest/v1/the_round_visits` with body
  `{"player": "<First Last>", "pub_id": "<pub id>"}`

The leaderboard is computed client-side by counting distinct `pub_id`s per
`player`. There is no DELETE endpoint, so visits are append-only:
"unticking" a pub is a local-only hide (`src/lib/localOverrides.ts`),
stored per player in `localStorage`. It doesn't sync across devices — if
you untick on your phone and open the site on a laptop, the tick will
still show there, because the row is still in Supabase. That's the
accepted trade-off for a no-login app with an append-only store.

## Player identity

First name + surname, title-cased, stored in `localStorage`. No password,
no verification — anyone can enter any name by design.

## Deploy

Vercel auto-deploys from `main` once the repo is imported. Every commit on
`main` must be authored as `MimmoPalm <214577187+MimmoPalm@users.noreply.github.com>`
— Vercel is configured to block any other author.

## Design

See [`docs/design-plan.md`](docs/design-plan.md) for the full design
system (palette, type, motion, game feel).
