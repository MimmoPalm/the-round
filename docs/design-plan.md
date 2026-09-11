# The Round — design plan

Direction: **"cream oak × brass ink"**. Warm, editorial, London-pub-considered.
No pixels, no CRT, no neon, no meme aesthetics — playful through craft and
copy, never through gimmicks. Keep this doc in sync if the direction moves;
it's the reference for future sessions working on this repo.

## Palette

| Token | Value | Use |
|---|---|---|
| `bg` | `#F6F1E7` | App background |
| `surface` | `#FFFFFF` | Cards, sheets, inputs |
| `ink` | `#16130E` | Primary text, primary buttons |
| `ink-secondary` | `rgba(22,19,14,.60)` | Secondary text |
| `ink-muted` | `rgba(22,19,14,.38)` | Placeholders, meta |
| `brass` | `#A8793E` | Accent, visited state, active nav |
| `tick-green` | `#2F6D4F` | Reserved — positive/success accents |
| `border` | `rgba(22,19,14,.10)` | Hairlines, dividers |

Defined as Tailwind v4 theme tokens in `src/index.css` (`@theme` block),
so they're available as utilities: `bg-bg`, `text-ink-secondary`, `border-border`,
`bg-brass-wash`, etc.

## Type

- **Fraunces** (Google Fonts) — headings, wordmark, milestone banners. Serif,
  editorial, a bit of personality.
- **Inter** — body copy, UI labels, buttons.
- **JetBrains Mono** — scores, ranks, counters, distances only. Never body copy.

Loaded via `<link>` in `index.html` (no font npm packages, keeps the
dependency count down and lets the browser cache across visits to other
sites using the same Google Fonts CDN entries).

## Game feel

- **Tick** = brass fill wash on the pint-glass icon + a quick spring pop
  (`animate-tick-pop`, `transform: scale`, ~420ms, spring easing). No confetti,
  no particle effects.
- **Milestone** (tier change) = one serif banner, auto-dismisses in <1s
  (`MilestoneBanner`, ~950ms hold). Never blocks input, never repeats.
- **Council conquest**: badge tiles shade from `surface`/`border` (locked,
  ghost outline crown) to `brass-wash`/`brass` (earned, filled crown) as the
  ticked percentage for that council (Islington, Hackney) reaches 100%.
- Motion is `transform`/`opacity` only, spring easing
  (`cubic-bezier(0.34, 1.56, 0.64, 1)`), never layout-thrashing properties.
- `min-h-[100dvh]` everywhere a screen needs to fill the viewport — never
  `h-screen`, which breaks on mobile Safari/Chrome with dynamic toolbars.

## Layout

- Mobile-first. 44px minimum touch targets throughout (list tick buttons,
  nav tabs, sheet close button).
- Pub detail is always a bottom sheet (`BottomSheet`), whether triggered
  from the map, the list, or Pint Roulette — one component, one feel.
  Sheets slide up with `animate-sheet-up`.
- List screen has a sticky filter bar (search + all/visited/unvisited chips)
  and sticky postcode-group headers underneath it.
- Bottom nav (5 tabs: Map, List, Leaderboard, Roulette, Badges) is fixed,
  with `env(safe-area-inset-bottom)` padding for notch/home-indicator
  devices. A slim leaderboard bar pins just above it on every screen except
  the leaderboard itself, and expands to the full table on tap.

## Iconography

One bespoke English-pint-glass mark, defined once as an SVG-string generator
(`src/lib/pintIcon.ts`) and reused by the Leaflet marker layer (`L.divIcon`),
the React `<PintIcon>` component (list rows, sheets), and the `<Logo>`
crest on the start screen — so the map and the rest of the UI never drift
apart visually. Unvisited = clean ink outline, empty glass. Visited = the
same glass filled with amber beer and a small foam head. All other icons
(nav, search, close, etc.) are small bespoke inline SVGs in
`src/components/icons.tsx` rather than an icon package — keeps the
dependency count and bundle size down.

## Data & ids

- Pub id = `slug(name)-lat5-lon5` (see `src/lib/pubId.ts`), stable across
  reloads regardless of array order in `pubs.json`.
- Visits are append-only in Supabase (no DELETE endpoint). "Unticking" is
  therefore a local-only hide, stored per player in `localStorage`
  (`src/lib/localOverrides.ts`) — documented limitation: it doesn't sync
  across devices.
