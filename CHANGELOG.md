# Changelog: Harkirat Cohort Study Desk

Full version history and implementation details. For active agent context, read `AGENTS.md` instead.

---

## 1. Project Intent

The user wanted a local indexed study interface on top of an already-downloaded course folder. The source material is a downloaded cohort with:

- top-level week folders containing lecture media such as `.mp4`, `.mkv`, `.pdf`, and a small number of image/reference files
- a separate `Harkirat Assignment` tree containing exercises, READMEs, starter files, tests, and solution folders

The desired product was not a plain file explorer. The chosen direction was an indexed local web app optimized for sequential study:

- weekly curriculum view
- in-app lecture/PDF viewing
- assignment preview and metadata extraction
- local progress tracking (video position, completion, speed)
- local personal notes
- bookmarks and recents
- "resume learning" flow
- file/folder/editor open actions
- dark mode

The app is offline-first and uses only local data. It is for personal use only — not production grade, not fancy, just **perfectly usable with correct tracking**.

## 2. Implementation History

### v1 — Original scaffolding

The `study-desk` folder was bootstrapped from a Vite + React template. When work began in earnest, it was effectively just scaffolding — no scanner, no API, no curriculum UI, no persistence.

### v2 — Full usability overhaul (COMPLETED)

A 7-phase plan was executed to make the app fully functional:

1. **Video experience** — resume position, playback speed (0.75x–2x persisted), auto-complete on finish, duration tracking, position saved every 5s and on pause
2. **Progress visualization** — progress bars on dashboard/weeks/left rail, active state buttons, status badges, course completion percentage
3. **Component split** — monolithic `App.tsx` extracted into 10 component files under `src/components/`, plus `src/utils/helpers.ts`
4. **Navigation fixes** — week part grouping, left rail active state + auto-scroll, command palette keyboard nav, 404 route, prev/next week boundary labels
5. **Right rail and notes** — browse all notes, type icons in utility lists, status dots, show-all toggle
6. **Design tightening** — reduced card rounding, tighter heading sizes, status colors, hover improvements, dark mode toggle (warm dark palette), entrance transitions, responsive fixes
7. **Backend fixes** — verified video range request support (Express sendFile), fixed `launch()` race condition in `child_process.spawn`, added JSON parse error handling for corrupt cache/state files

All phases verified: `eslint src/` clean, `tsc -b --noEmit` clean, `npm run build` succeeds.

### v2.1 — Layout spacing fix (COMPLETED)

After v2, the lesson page had a critical layout problem: the video player was pushed far below the viewport fold due to:

- A fat `page-card` section (title + description + status badge in a padded card)
- A full `action-row` with 6 wrapped buttons
- CSS Grid's default `align-content: stretch` on the workspace, which inflated the topbar's row height

**Changes made:**

1. `**ItemLayout.tsx` rewritten** — replaced the card header + button row with a compact inline header:
  - Title and eyebrow on the left, compact 32px icon buttons on the right
  - Status/bookmark/complete actions are icon-only buttons (`btn-sm`)
  - "Open asset / folder / editor" moved into a dropdown menu (chevron button with `.more-menu`)
  - Video/content area (`viewer-area`) appears immediately after the header with no card wrapper
2. `**App.css` updated** — new styles for `.item-header`, `.btn-sm`, `.more-menu-wrap`, `.more-menu`, `.viewer-area`; shell padding reduced from 16px to 12px, gap from 14px to 12px
3. `**align-content: start`** added to `.workspace` and `.panel` grids to prevent row stretching

### v2.2 — Git setup (COMPLETED)

- Root `.gitignore` created to exclude video files (*.mp4, *.mkv, etc.), `node_modules/`, `dist/`, `.study-desk-data/`, editor junk, `.cursor/`
- Initial commit on `main` branch: 273 files, 90,819 insertions (source code, assignments, study-desk app, LLM_CONTEXT.md, launcher)
- **No remote configured yet** — push was attempted but failed; user needs to add a remote with `git remote add origin <url>`
- The 31 `Week -` folders (tens of GB of video content) are excluded from git via `.gitignore`

### v2.3 — UI tightening pass (COMPLETED)

This was a focused cleanup pass to make the app denser and less wasteful on screen without changing the underlying local-first architecture.

**Changes made:**

1. **Left rail compacted**
  - Hero card slimmed down to a one-line title + inline resume link
  - Separate left-rail stats card removed to give more vertical room to the curriculum list
2. **Dashboard simplified**
  - Old course overview metrics block removed
  - Dashboard now opens on a resume strip + dominant week cards layout
3. **Item header tightened**
  - Redundant textual status badge removed
  - Lit icon buttons are the single source of truth for complete / in-progress / bookmarked state
4. **Notes input refined**
  - Smaller default note box
  - `field-sizing: content` enabled for auto-growth
  - Placeholder shortened
5. **Video speed controls reduced**
  - Full 6-button speed strip replaced with a compact popover trigger
6. **Typography adjusted**
  - Default `h1/h2/h3` moved to sans-serif
  - Newsreader serif reserved for the item title where emphasis is useful
7. **CSS cleanup**
  - Dead `Metric` component removed
  - Old overview/stats styles removed

### v2.4 — Learning-flow improvements (COMPLETED)

This pass was explicitly scoped for the user's **personal learning workflow**, not for customer-facing polish. The goal was to reduce friction in sequential studying, improve progress accuracy, and make resume behavior more trustworthy.

**Changes made:**

1. **Video progress reliability fixed**
  - `VideoPlayer.tsx` now saves the current position on component unmount
  - This closes the navigation-loss gap where switching lessons could lose the last few seconds of watch position
2. **Auto-complete threshold added**
  - Videos now mark complete at `>=95%` watched instead of only on the native `ended` event
  - This avoids "ghost in-progress" items when the user finishes the meaningful content but skips trailing credits/outro
3. **Duplicate completion prevented**
  - Completion logic was guarded so the `95%` threshold and native `ended` event do not both fire completion handling
4. `**lastActiveItemId` made more accurate**
  - Opening an item still records it as recent and marks it in-progress
  - But `lastActiveItemId` is no longer updated on every click/mount
  - Instead, lesson and assignment views promote an item to "last active" only after roughly 5 seconds of dwell time
  - This keeps Resume pointing at what the user actually studied rather than whatever they glanced at
5. **Keyboard shortcuts added**
  - `/` opens the command palette
  - `N` goes to the next lesson/assignment
  - `P` goes to the previous lesson/assignment
  - `M` toggles complete / not-started on the active item
  - `B` toggles bookmark on the active item
  - `Esc` closes menus
  - All of these are guarded so they do not fire while the user is typing in an input/textarea/contenteditable field
6. **Command palette empty state improved**
  - Empty query no longer shows an unhelpful alphabetical dump
  - It now shows a personal-use blend of **Recents** and **Next up**
  - Falls back to generic results only if there is not enough personal state yet
7. **Dashboard continue flow improved**
  - Dashboard now shows a 3-item continue queue instead of only a single resume link
  - The queue starts from the current last-active item and then shows the next unfinished items
8. **Remaining-time metric surfaced**
  - Helper logic aggregates stored video durations and playback positions
  - Dashboard now shows the estimated remaining time across unfinished tracked videos
  - This uses existing data already being stored in `itemStates`
9. **Week re-entry made faster**
  - `WeekView.tsx` now includes an `Incomplete only` toggle
  - This is a pure view filter; it does not mutate progress state
  - If a week is fully done and the filter is enabled, the view shows an "Everything in this week is complete" state
10. **Verification completed**
  - `npm run lint` passed
  - `npx tsc -b --noEmit` passed
  - `npm run build` passed

### v2.4.1 — Shortcut discoverability help (COMMITTED)

After v2.4, the user correctly pointed out that keyboard shortcuts are hard to learn if they are invisible. A small discoverability surface has now been added in the top bar.

**Changes made:**

1. **Shortcuts help button**
  - A keyboard icon button was added beside the search trigger in the top bar
2. **Shortcuts popover**
  - Clicking the button opens a small popover listing the current supported shortcuts:
    - `Ctrl + K`
    - `/`
    - `N`
    - `P`
    - `M`
    - `B`
    - `Esc`
3. **Popover behavior**
  - The shortcuts popover closes on `Esc`
  - It also closes on mouse leave
4. **Verification completed**
  - `npm run lint` passed
  - `npx tsc -b --noEmit` passed
  - `npm run build` passed

### v2.4.2 — Sequential Navigation Bug Fix (COMPLETED)

This fix resolved the broken `N` / `P` shortcuts and the prev/next pager links on lesson pages.

**Real root cause:**

- The bug was **not** fundamentally a keyboard bug and **not** fundamentally a React Router param bug.
- The failure only happened on `video -> anything` navigation.
- `pdf -> video` worked, but `video -> video` and `video -> pdf` both broke.
- The actual culprit was the `VideoPlayer.tsx` unmount cleanup:
  - on unmount, it synchronously called `onProgress(video.currentTime, video.duration)`
  - that caused a state update during the navigation/unmount boundary
  - the browser URL changed, but the rendered lesson content stayed stale on the old video page

**How this was figured out:**

1. User reported that both `N`/`P` and the pager links were broken
2. That proved the problem was broader than keyboard handling
3. A capture-phase keyboard change was tried first, but it did not solve the issue
4. The route/view layer was then investigated, and route-key / prop-driven view changes were introduced
5. Runtime reproduction with Playwright isolated the real pattern:
   - `pdf -> video` transition worked
   - `video -> video` transition failed
   - `video -> pdf` transition failed
6. That narrowed the problem to logic that only exists on video pages, specifically the `VideoPlayer` lifecycle
7. The synchronous unmount save was identified as the most likely interfering state update

**Fix applied:**

- In `VideoPlayer.tsx`, the unmount cleanup still captures the final playback position and duration
- But instead of calling `onProgress(...)` synchronously during unmount, it now defers that write with:

```ts
window.setTimeout(() => onProgress(finalPosition, finalDuration), 0)
```

- This lets the route transition commit first, then persists the final playback position immediately after

**Important outcome:**

- `N` and `P` now work
- Pager previous/next links now work
- `video -> video` and `video -> pdf` transitions both work

**Implementation note:**

- The earlier route-boundary hardening in `App.tsx` / `LessonView.tsx` / `AssignmentView.tsx` was kept:
  - lesson/assignment views are keyed by `location.pathname`
  - the active lesson/assignment is derived in `App.tsx` and passed into the child view
- But the decisive fix was the deferred progress save in `VideoPlayer.tsx`

### v2.5 — Phone access and mobile UI (COMPLETED)

The user needed to watch lectures on their phone while keeping the laptop free for coding. This required network access from phone to laptop and a fully usable mobile interface.

**Networking approach chosen: Direct LAN over USB tethering**

When the phone USB-tethers to the laptop, Windows creates an RNDIS network adapter. Both devices are on the same local subnet (typically `192.168.42.x`). The Express server already binds to all interfaces (no hostname argument to `app.listen()`), so the phone can reach the laptop directly over the USB cable. Video data flows over the wire — zero cellular data consumed.

A tunnel (ngrok/cloudflared) was considered but rejected for USB tethering scenarios: the laptop's internet comes FROM the phone's cellular, so a tunnel would send video data through the cellular connection twice (laptop -> cellular up -> tunnel -> cellular down -> phone). Direct LAN avoids this entirely.

This also works on home Wi-Fi networks — both devices on the same Wi-Fi can reach each other the same way.

**Changes made:**

1. **Server LAN URL display** (`server/index.mjs`)
  - Added `os.networkInterfaces()` enumeration after server starts
  - Prints all non-loopback IPv4 addresses as `Network: http://<ip>:4307`
  - User types the printed URL on their phone

2. **Windows Firewall rule** (`start-study-desk.bat`)
  - Added one-time `netsh advfirewall firewall add rule` for inbound TCP on port 4307
  - Only runs if the rule doesn't already exist

3. **Mobile nav drawer** (`App.tsx`, `App.css`)
  - Hamburger button in the topbar, visible only at <=980px
  - Slide-in drawer with: course title, overall progress bar, stats, scrollable week list with progress, bookmarks section
  - Closes on navigation (route change) or backdrop tap
  - `drawerOpen` state with auto-close via `useEffect` on `location.pathname`

4. **Right rail collapse on mobile** (`App.css`)
  - Utility cards (bookmarks, recents, next-up) hidden on mobile since they're accessible via drawer
  - Notes card remains visible below content

5. **Sticky bottom action bar** (`App.tsx`, `App.css`)
  - Fixed bottom bar on lesson/assignment pages at mobile widths
  - Contains: Previous, Mark Complete, Bookmark, Next buttons
  - Active states show green (completed) or accent (bookmarked)
  - Shell has `padding-bottom: 72px` to avoid content behind the bar
  - Desktop pager hidden on mobile (replaced by bottom bar)

6. **Mobile video player sizing** (`App.css`)
  - Replaced `min-height: 40vh` with `aspect-ratio: 16/9` and `max-height: 50vh`
  - Proper proportions on phone screens in portrait orientation

7. **Touch and mobile CSS** (`App.css`, `index.css`)
  - `-webkit-tap-highlight-color: transparent` on body
  - `touch-action: manipulation` on all interactive elements (kills 300ms tap delay)
  - `env(safe-area-inset-*)` padding for notched phones
  - Enlarged tap targets: `.btn-sm` 40px, `.utility-link` min 44px, `.week-link` increased padding
  - Note input font size 16px (prevents iOS zoom on focus)
  - Search trigger and brand text collapse to icon-only on mobile
  - Shortcuts popover hidden on mobile (keyboard shortcuts aren't relevant on phone)

8. **Topbar mobile compaction** (`App.css`)
  - Brand text hidden, icon-only
  - Search trigger collapses to icon-only (no placeholder text or kbd hint)
  - Keyboard shortcuts button hidden

**Verified:**
- `npm run lint` — zero errors
- `npx tsc -b --noEmit` — zero errors
- `npm run build` — succeeds
- Tested on Android phone via USB tethering — full app works, videos play, progress syncs

### v2.5.1 — Phone URL button and smart launcher (COMPLETED)

**Changes made:**

1. **`/api/network` endpoint** (`server/index.mjs`)
  - `GET /api/network` returns `{ localhost, network: [...urls] }`
  - Fetches current LAN addresses at call time (reflects network changes without restart)

2. **Phone URL button in topbar** (`App.tsx`, `App.css`)
  - Smartphone icon button next to the shortcuts button
  - Click opens a popover listing all network URLs
  - Each URL is a button — click to copy to clipboard
  - Shows "Copied!" confirmation with green highlight
  - Hidden on mobile (only useful on the laptop)

3. **Smart bat file relaunch** (`start-study-desk.bat`)
  - Checks if port 4307 is already in use via `netstat`
  - If server is running: prints current Network URLs (fetched via PowerShell `Invoke-RestMethod` from `/api/network`), opens browser, exits
  - If server is not running: starts server normally

### v2.5.2 — Favicon, title, and Start Menu entry (COMPLETED)

**Changes made:**

1. **Favicon replaced** (`public/favicon.svg`)
  - Old Vite lightning bolt replaced with the lucide `LibraryBig` icon in accent purple (`#7c5cfc`)
  - SVG favicon, works in all modern browsers

2. **Page title** (`index.html`)
  - Changed from "study-desk" to "Study Desk"

3. **Windows Start Menu shortcut** (`create-shortcut.ps1`)
  - Creates a `.lnk` shortcut in `%APPDATA%\Microsoft\Windows\Start Menu\Programs\`
  - Points to `start-study-desk.bat` with custom icon
  - User can search "Study Desk" in Start Menu to launch

4. **Custom ICO icon** (`build-icon.ps1`, `public/study-desk.ico`)
  - `build-icon.ps1` draws a simplified purple book icon using `System.Drawing` and saves as `.ico`
  - Used by the Start Menu shortcut

## 3. Current Status

### What works

- Full study desk app: dashboard, week view, lesson view, assignment view
- **Phone access via direct LAN** — server prints Network URLs on startup, phone connects over USB tethering or Wi-Fi
- **Mobile-optimized UI** — hamburger nav drawer, sticky bottom action bar, touch-friendly tap targets, proper video sizing
- Video playback with resume, speed control, auto-complete
- Video position persistence on unmount/navigation
- Auto-complete at `>=95%` watched
- Progress tracking (completion status, video position/duration, bookmarks)
- Progress syncs between phone and laptop (same backend, same state file)
- More trustworthy resume tracking via delayed engagement-based `lastActiveItemId`
- Notes per item, browsable notes list
- Dark mode (persisted)
- Command palette search (`Ctrl+K` and `/`)
- Empty command palette shows Recents + Next up
- Keyboard shortcuts for next/previous/complete/bookmark
- Sequential navigation now works correctly on video pages
- In-app shortcuts help popover in the top bar
- Left rail curriculum map with active highlighting
- Right rail with notes, bookmarks, recents, next-up
- Dashboard continue queue (3 items)
- Dashboard remaining-time metric for unfinished tracked videos
- Week view `Incomplete only` filter
- Local file/folder/editor open actions
- Windows Firewall rule auto-added by launcher
- **Phone URL button** in topbar — click to see and copy network URLs for phone access
- **Smart launcher** — `start-study-desk.bat` detects running server, shows current URLs instead of failing
- **Start Menu entry** — searchable "Study Desk" shortcut with custom purple book icon
- One-click launcher (`start-study-desk.bat`)

### Verified checks

- `eslint src/` — zero errors
- `tsc -b --noEmit` — zero errors
- `npm run build` — succeeds (tsc + vite build)

### Indexed content snapshot

At the time of last verification:

- 21 weeks
- 92 lesson assets (78 videos, 13 PDFs, 1 image)
- 21 assignment entries

These numbers change if source folders change and the index is refreshed.

## 4. What Has NOT Been Implemented

These are features/improvements that were discussed or are natural next steps but have **not been built**:

1. **Transcript or semantic search** — no video transcription, no full-text search of lecture content
2. **Embedded database** — state uses JSON files, not SQLite or another DB
3. **External data folder** — app data lives under `study-desk/.study-desk-data/` rather than an external sidecar location
4. **Advanced keyboard system** — basic personal-use shortcuts now exist, but there is still no broader shortcut system such as customizable bindings, per-view overlays, vim-style navigation, or rich shortcut scopes
6. **Batch operations** — no "mark all in week as complete", no bulk status changes
7. **Spaced repetition / review scheduling** — no SRS-style review prompts
8. **Export/import of study state** — no way to backup/restore progress beyond the raw JSON file
9. **Git remote** — no remote repository configured yet
10. **Runtime testing** — the app has been type-checked and lint-checked, but no automated test suite exists; manual runtime testing is recommended after any changes

## 5. Hard Safety Rules

These rules are critical. Future LLMs must preserve them.

### Non-destructive boundary

The downloaded course content is the source of truth and must not be modified or deleted by the app or by future automation unless the user explicitly asks for it.

Protected content includes, but is not limited to:

- top-level `Week - ...` folders
- all lecture videos, PDFs, images
- the entire `Harkirat Assignment` folder
- all assignment READMEs, starter files, tests, solution folders

### Absolute rule

Do not delete, rename, overwrite, reorganize, or "clean up" the original downloaded study material.

### Allowed write scope

Future changes should be limited to:

- the app folder: `study-desk/`
- the launcher file: `start-study-desk.bat`
- the app's generated data/cache/state area (`.study-desk-data/`)
- root config/meta files: `.gitignore`, `AGENTS.md`, `CHANGELOG.md`, `CLAUDE.md`
- root scripts: `create-shortcut.ps1`, `build-icon.ps1`

### If unsure

If a change might touch original study material, stop and avoid the change unless the user has explicitly requested it.

## 6. Directory Structure

### Protected source content (READ-ONLY)

```
<your-course-root>\
├── Week - 0 ( Prerequisites - HTML , CSS)/     ← 31 folders like this
├── Week - 1 ( JS Foundation , API ) Part - 1/
├── ...
├── Week -20 ( OpenAPI Spec )/
└── Harkirat Assignment/
    ├── week- 0/
    ├── week-1/
    ├── ...
    └── week-14/
```

### App implementation

```
study-desk/
├── server/
│   ├── index.mjs           ← Express backend: bootstrap, state, file serving, open actions
│   ├── course-indexer.mjs   ← Scans week folders + assignments into structured index
│   └── shared.mjs           ← Path/normalization/extraction helpers
├── src/
│   ├── App.tsx              ← Shell: bootstrap, state management, left/right rails, routing
│   ├── App.css              ← Component styles, layout, responsive
│   ├── index.css            ← CSS variables, dark mode palette, globals
│   ├── api.ts               ← Client API wrappers
│   ├── types.ts             ← TypeScript interfaces (CourseIndex, UserState, etc.)
│   ├── main.tsx             ← React entry point
│   ├── utils/
│   │   └── helpers.ts       ← Pure functions: orderedItems, href, description, normalizeState,
│   │                           weekProgress, courseProgress, recentTrail, nextQueue, searchResults
│   └── components/
│       ├── Dashboard.tsx     ← Dashboard with overall progress + week cards
│       ├── WeekView.tsx      ← Week timeline with part grouping
│       ├── LessonView.tsx    ← Lesson viewer (delegates to VideoPlayer/iframe/img)
│       ├── AssignmentView.tsx← Assignment viewer with README, starters, flags
│       ├── ItemLayout.tsx    ← Compact item header: title, icon action buttons, dropdown, pager
│       ├── VideoPlayer.tsx   ← Custom player: resume, speed, auto-complete, progress saving
│       ├── CommandPalette.tsx← Search palette with keyboard navigation
│       ├── ProgressBar.tsx   ← Reusable progress bar
│       └── StatusBadge.tsx   ← Status icon (completed/in-progress/not-started)
├── .gitignore               ← Excludes node_modules, dist, .study-desk-data
├── package.json
├── README_FOR_AGENTS.md     ← Short operational guide for LLMs (points to this file)
├── vite.config.mjs          ← Active vite config (used by scripts)
├── vite.config.ts           ← Legacy vite config (not used)
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── eslint.config.js
```

### Root files

```
<your-course-root>\
├── .gitignore               ← Excludes *.mp4, node_modules, dist, .study-desk-data, .cursor
├── AGENTS.md                ← Lean agent context (universal, auto-loaded by all tools)
├── CLAUDE.md                ← Points to AGENTS.md (for Claude Code)
├── CHANGELOG.md             ← This file (full version history)
├── start-study-desk.bat     ← One-click launcher (with firewall rule + duplicate detection)
├── create-shortcut.ps1      ← Creates Windows Start Menu shortcut with custom icon
└── build-icon.ps1           ← Generates study-desk.ico from System.Drawing
```

### Generated app data

```
study-desk/.study-desk-data/
├── course-index.json        ← Cached course index
└── user-state.json          ← Progress, notes, recents, bookmarks, theme, speed
```

## 7. Architecture Overview

### Backend (`server/index.mjs`)

- Serves bootstrap payload (index + user state) at startup
- Refreshes index on demand
- Saves user state (debounced from frontend)
- Serves local media files for video/PDF/image viewing (Express `sendFile` with Range support)
- Opens local file/folder/editor via `child_process.spawn`
- Serves built frontend from `dist/` when available
- Robust JSON parse error handling for corrupt cache/state files
- `launch()` function wraps `spawn` with try/catch and a 200ms settle delay

### Frontend (`src/App.tsx` + components)

**State management:** All state lives in the `StudyDesk` component and flows down via props. Actions are memoized with `useCallback`. Lists are memoized with `useMemo`. State saves are debounced (400ms) to the backend.

**Key state shape (`UserState`):**

- `itemStates: Record<string, ItemState>` — per-item status, bookmarked, playbackPosition, duration
- `notes: Record<string, NoteEntry>` — per-item notes
- `recent: RecentEntry[]` — recently visited items
- `lastActiveItemId?: string` — for resume-learning; updated after real dwell/engagement rather than every click
- `playbackSpeed?: number` — globally persisted
- `theme?: 'light' | 'dark'` — persisted

**Routing:** React Router with routes for `/` (dashboard), `/week/:weekNumber`, `/lesson/:itemId`, `/assignment/:itemId`, and a `*` catch-all 404.

**Layout:** Three-column CSS Grid shell (272px left rail, flex center, 300px right rail). Left rail has hero card + stats + scrollable curriculum. Right rail has notes + bookmarks + recents + next-up. Center is the workspace with topbar + route content.

### CSS Architecture

- `index.css` — CSS custom properties (design tokens), light/dark theme via `[data-theme='dark']`, global resets
- `App.css` — all component styles, grid layouts, responsive breakpoints (1280px, 980px)
- No CSS modules or CSS-in-JS — plain CSS with BEM-ish class naming
- Fonts: Newsreader (display/headings), Source Sans 3 (body), Consolas (mono)

## 8. Runtime / Usage

### Normal usage

Double-click `start-study-desk.bat`. It checks dependencies, builds if needed, starts the server, and opens `http://localhost:4307`.

### Manual commands

```powershell
cd "<your-course-root>\study-desk"

# Production-style local server
npm start

# Dev mode (hot reload)
npm run dev

# Build
npm run build

# Type check
npx tsc -b --noEmit

# Lint
npx eslint src/
```

## 9. Known Quirks / Limitations

1. **Data folder location** — app data lives under `study-desk/.study-desk-data/` rather than an external sidecar. Works fine but isn't the ideal separation.
2. **Assignment grouping is heuristic** — based on folder structure and naming conventions. Summary quality depends on README or starter comments being present.
3. **Editor launch is best-effort** — tries `code`, `cursor`, `code-insiders` in order, falling back to Explorer.
4. **Vite config quirk** — the active config is `vite.config.mjs` (not `vite.config.ts`).
5. **Video position save granularity** — saved every 5s during playback and on pause/end. A crash could lose up to 5s of position data.
  Navigation-away loss is largely fixed because unmount now forces a save, but abrupt crashes can still lose a few seconds.
6. **CSS `color-mix()` usage** — requires Chrome 111+, Firefox 113+, Safari 16.2+. Fine for a local personal app.
7. **No git remote** — initial commit exists on `main` branch but no remote is configured.
8. **No automated tests** — the app passes type-check and lint, but there's no test suite. Manual runtime verification is recommended.
9. **Shortcut help is UI-only** — the top-bar shortcut popover is a discoverability aid, not a full help modal or onboarding system.
10. **Phone access IP may change** — the Network URL printed by the server depends on the current network interface. USB tethering and Wi-Fi may assign different IPs across sessions. The server prints the correct IP each time it starts.

## 10. Implementation Decisions

These decisions were deliberate:

- Preserve the raw course content completely (non-destructive boundary)
- Keep the app local and offline-first
- Use a minimal Express backend rather than Electron/Tauri
- Use JSON cache/state rather than an embedded DB
- Favor a usable product now over early abstraction
- Make the app launchable by double-click via `.bat`
- Prop drilling with `useCallback`/`useMemo` over React Context (simpler, sufficient for this scale)
- CSS custom properties for theming over a CSS-in-JS solution
- Compact item header with icon buttons + dropdown over a full button row (v2.1 layout fix)
- Direct LAN for phone access over tunnel/cloud solutions — avoids double-cellular-hop, zero latency, zero data waste
- 980px mobile breakpoint — covers phones and small tablets without affecting laptop layout
- Bottom action bar on mobile replaces pager links — better thumb reach, always visible
- Hamburger drawer over a tab bar — preserves vertical space, curriculum list is long

## 11. If You Are Another LLM Picking This Up

Before editing:

1. Read this file
2. Inspect `study-desk/package.json`
3. Inspect `server/index.mjs` and `server/course-indexer.mjs`
4. Inspect `src/App.tsx` (shell + state management + left/right rails)
5. Inspect `src/types.ts` and `src/utils/helpers.ts`
6. Inspect the relevant component in `src/components/` for the area you are changing
7. Assume original study files are out of scope for destructive actions

### Priorities for future work

Optimize for:

- preserving the non-destructive boundary
- improving UI polish and usability without breaking local functionality
- keeping navigation fast for sequential study
- keeping resume/progress behavior trustworthy for personal learning use
- keeping persistence simple and reliable
- avoiding rewrites unless clearly justified

Avoid:

- touching or restructuring raw study files
- moving videos/PDFs/assignments around
- replacing the local architecture with something more complex unless asked
- introducing network dependence for core features
- overengineering persistence before it's asked for

### Safe refactor boundaries

Safe areas:

- `study-desk/src/*`
- `study-desk/server/*`
- `study-desk/package.json`
- `study-desk/vite.config.mjs`
- `start-study-desk.bat`
- `create-shortcut.ps1`, `build-icon.ps1`
- `.study-desk-data` format (if migrated carefully)
- `.gitignore`, `AGENTS.md`, `CHANGELOG.md`, `CLAUDE.md`

Unsafe areas (need explicit user approval):

- any top-level `Week - ...` folder
- `Harkirat Assignment/`
- any lecture asset (video, PDF, image)
- any assignment asset (README, starter, test, solution)

## 12. Resolved Bug: Sequential Navigation Broke After Leaving Video Pages

This issue is resolved. Keep this section because it captures the real root cause and prevents future regressions.

### Final symptom pattern

1. `N` / `P` shortcuts and pager links both failed in the same way
2. Browser URL changed to the correct lesson
3. Visible content stayed on the old lesson
4. `pdf -> video` navigation worked
5. `video -> video` navigation failed
6. `video -> pdf` navigation failed

### What this proved

- The bug was not specifically keyboard handling
- The bug was not specifically pager-link markup
- The bug only appeared when the **current page being left** owned a `VideoPlayer`
- Therefore the most likely cause had to be in video-page lifecycle logic

### Actual cause

`VideoPlayer.tsx` performed a synchronous progress save during unmount:

```ts
onProgress(video.currentTime, video.duration)
```

That synchronous state write collided with the route transition. The URL update succeeded, but the view stayed stuck on the old video page.

### Actual fix

The final position is still captured during unmount, but the write is deferred:

```ts
const finalPosition = video.currentTime
const finalDuration = video.duration
window.setTimeout(() => onProgress(finalPosition, finalDuration), 0)
```

This allows the navigation to finish first while still preserving the final playback position almost immediately.

### Secondary hardening kept in place

- Lesson/assignment route elements are keyed by `location.pathname`
- `App.tsx` derives the active lesson/assignment and passes it into the view
- `LessonView.tsx` and `AssignmentView.tsx` no longer rely solely on local `useParams()` lookup

These changes were not the decisive fix on their own, but they are reasonable guardrails at the route boundary.

### Investigation method that worked

The decisive debugging step was runtime reproduction with Playwright:

- prove `pdf -> video` works
- prove `video -> video` fails
- prove `video -> pdf` fails

That isolated the bug to video-page unmount behavior much more effectively than static reasoning alone.
