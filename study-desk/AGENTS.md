# Study Desk — App-Specific Context

Read `../AGENTS.md` first for safety rules, commands, and project overview.
For full version history, see `../CHANGELOG.md`.

## State Shape (UserState)

```ts
itemStates: Record<string, ItemState>  // per-item: status, bookmarked, playbackPosition, duration
notes: Record<string, NoteEntry>       // per-item notes
recent: RecentEntry[]                  // recently visited items
lastActiveItemId?: string              // resume target (updated after 5s dwell, not on click)
playbackSpeed?: number                 // globally persisted
theme?: 'light' | 'dark'              // persisted
```

## Component Responsibilities

- **App.tsx** — All state lives here. Routes, left/right rails, topbar, mobile drawer, bottom action bar. State flows down via props.
- **VideoPlayer.tsx** — Custom player with resume, speed control, auto-complete at >=95%, position save every 5s + on pause/unmount. The unmount save MUST be deferred (see root AGENTS.md warnings).
- **LessonView.tsx** — Renders video/PDF/image based on asset type. Keyed by `location.pathname`.
- **AssignmentView.tsx** — Shows README, starter files, test/solution flags. Keyed by `location.pathname`.
- **ItemLayout.tsx** — Compact header: title + icon buttons (complete/bookmark/dropdown). Pager links below content.
- **CommandPalette.tsx** — Search overlay. Empty state shows Recents + Next Up.
- **Dashboard.tsx** — Resume strip + week cards + remaining time.
- **WeekView.tsx** — Week timeline with part grouping + "Incomplete only" filter.

## Routing

```
/                    → Dashboard
/week/:weekNumber    → WeekView
/lesson/:itemId      → LessonView
/assignment/:itemId  → AssignmentView
*                    → 404
```

## Backend Endpoints

```
GET  /api/bootstrap  → { index, state }
POST /api/refresh    → { index }  (rebuilds course index)
POST /api/state      → saves full user state
GET  /api/file?path= → serves course files (videos, PDFs) with Range support
POST /api/open       → launches local file/folder/editor
GET  /api/network    → { localhost, network: [...urls] }
```

## CSS Architecture

- `index.css` — Design tokens (CSS custom properties), dark theme via `[data-theme='dark']`, global resets
- `App.css` — All component styles, grid layouts, responsive breakpoints (1280px collapse right rail, 980px mobile)
- No CSS modules, no CSS-in-JS — plain CSS with BEM-ish naming
- `color-mix()` in use — requires Chrome 111+, fine for local personal app

## Known Gotchas

- `lastActiveItemId` updates after 5s dwell, not on every page open — this is intentional for accurate resume behavior
- Assignment grouping is heuristic based on folder naming — quality depends on README presence
- Editor launch tries `code` → `cursor` → `code-insiders` → falls back to Explorer
- Video position saved every 5s; a hard crash can lose up to 5s of position data
- Phone access IP changes between network adapters — server prints correct IP each startup
