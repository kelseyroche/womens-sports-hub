# Women's Sports Hub: project notes

One app to follow women's sports across leagues. Personal project, not DroneDeploy.

## Two repos

This web app and the iPhone app (`../womens-sports-hub-ios`, SwiftUI) are built in parallel. Every feature lands in both. A shared backend for synced follows and push alerts is the later option.

## Values

- No monetary gambling. No odds, spreads, betting lines, sportsbook sponsors, or promo codes anywhere: UI, data, copy, or partnerships.
- Fantasy and free prediction games are fine.
- Design is the top priority. It should feel suave and beautiful, with a distinct point of view, not a generic sports score app.

## Decisions

- Stack: Next.js 16, TypeScript, Tailwind. Web first, phone-friendly.
- Data: ESPN unofficial API (`site.api.espn.com/apis/site/v2/sports/{path}/scoreboard?dates=YYYYMMDD`). Free, no key, can break without notice.
- v1 scope: Today dashboard plus follow teams, stored in the browser. No accounts.
- Repo: local git only. The remote is created by hand on a personal GitHub account.

## Leagues

| League | ESPN path | Status |
| --- | --- | --- |
| WNBA | `basketball/wnba` | working |
| NWSL | `soccer/usa.nwsl` | working |
| WSL | `soccer/eng.w.1` | working |
| NCAAW | `basketball/womens-college-basketball` | working |
| PWHL | none on ESPN | needs another source |
| USWNT | slug not found yet (`soccer/fifa.wwc` exists, may only cover the World Cup) | open |

## Design

- Draft palette (open to change): aubergine ink `#1F1632`, lilac chalk `#F1EEF8`, floodlight yellow `#FFC83D` for live games only.
- League hues: WNBA `#F0643A`, NWSL `#2347C9`, WSL `#8A3FFC`, NCAAW `#0F9D8A`.
- Draft type: Bricolage Grotesque for display, Figtree for body.
- Idea to test: Today as a timeline, with games placed by tip-off time.
- Avoid: cream + serif + terracotta, near-black + neon accent, identical soft-shadow cards, all-caps labels above every heading, pink-and-purple cliches.
- Waiting on: Canva storyboards and Claude Design directions. UI build starts after a direction is picked.
- Screens needed: Today dashboard (desktop and mobile), empty state, game card (upcoming, live, final), follow teams.

## Open questions

- Source for PWHL (no ESPN endpoint).
- USWNT schedule source.
- Offseason empty state: many leagues have no games for months, so "today" is often sparse.
- NYC women's sports view: which teams count (Liberty, Gotham FC, NY Sirens, others)?
- Following a player across leagues: ESPN athlete IDs differ per league, so this needs a mapping.

## Later

- Results and standings
- Game-day calendar
- NYC view
- Follow a player across leagues
- Fantasy-style features or prediction games (free, no money)

## Status

- Done: scaffold, ESPN data layer, Rally-inspired shell (brand band, nav, footer), Today page, quiet-day state, Following page, follow state in localStorage. Builds clean, desktop screenshots checked, nothing committed.
- Design source: ~/Downloads/Rally2.html is inspiration, not a spec. Name "Rally" is a placeholder.
- Not yet checked: real mobile width, clicking through the follow flow, quiet-night view (needs a day with no games).
- Next: mobile pass, standings/results, NYC view, PWHL source.
