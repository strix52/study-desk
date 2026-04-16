# LLM Context: Harkirat Cohort Study Desk

This file is the authoritative handoff context for any future LLM or coding agent working in this workspace.

Read this before making changes.

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

### v2.4.2 — Keyboard capture phase fix (CURRENT WORKING TREE)

The keyboard event listener in `App.tsx` was changed from bubble phase to capture phase to ensure shortcuts fire before any child element handlers (e.g., the `<video>` element).

**Change:**

- `window.addEventListener('keydown', onKeyDown)` → `window.addEventListener('keydown', onKeyDown, { capture: true })`
- Same for the cleanup `removeEventListener`

This was intended to fix the N/P shortcut issue but **did not resolve it**. See the open bug investigation in Section 12 below.

## 3. Current Status

### What works

- Full study desk app: dashboard, week view, lesson view, assignment view
- Video playback with resume, speed control, auto-complete
- Video position persistence on unmount/navigation
- Auto-complete at `>=95%` watched
- Progress tracking (completion status, video position/duration, bookmarks)
- More trustworthy resume tracking via delayed engagement-based `lastActiveItemId`
- Notes per item, browsable notes list
- Dark mode (persisted)
- Command palette search (`Ctrl+K` and `/`)
- Empty command palette shows Recents + Next up
- Keyboard shortcuts for next/previous/complete/bookmark
- In-app shortcuts help popover in the top bar
- Left rail curriculum map with active highlighting
- Right rail with notes, bookmarks, recents, next-up
- Dashboard continue queue (3 items)
- Dashboard remaining-time metric for unfinished tracked videos
- Week view `Incomplete only` filter
- Local file/folder/editor open actions
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
4. **Mobile/tablet optimization** — responsive breakpoints exist but haven't been thoroughly tested on small screens
5. **Advanced keyboard system** — basic personal-use shortcuts now exist, but there is still no broader shortcut system such as customizable bindings, per-view overlays, vim-style navigation, or rich shortcut scopes
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
- root config files: `.gitignore`, `LLM_CONTEXT.md`

### If unsure

If a change might touch original study material, stop and avoid the change unless the user has explicitly requested it.

## 6. Directory Structure

### Protected source content (READ-ONLY)

```
D:\download_extracted\final\Harkirat Cohort 0 - 1\
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
D:\download_extracted\final\Harkirat Cohort 0 - 1\
├── .gitignore               ← Excludes *.mp4, node_modules, dist, .study-desk-data, .cursor
├── LLM_CONTEXT.md           ← This file
└── start-study-desk.bat     ← One-click launcher
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
cd "D:\download_extracted\final\Harkirat Cohort 0 - 1\study-desk"

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

- `study-desk/src/`*
- `study-desk/server/*`
- `study-desk/package.json`
- `study-desk/vite.config.mjs`
- `start-study-desk.bat`
- `.study-desk-data` format (if migrated carefully)
- `.gitignore`, `LLM_CONTEXT.md`

Unsafe areas (need explicit user approval):

- any top-level `Week - ...` folder
- `Harkirat Assignment/`
- any lecture asset (video, PDF, image)
- any assignment asset (README, starter, test, solution)

## 12. Open Bug: N/P Navigation Broken (URL changes, content does not)

**Priority: HIGH** — This bug affects both the `N`/`P` keyboard shortcuts and the prev/next pager `<Link>` components below the player. It is a navigation/rendering problem, not a keyboard-only problem.

### Symptoms (user-reported)

1. **N and P keyboard shortcuts:** Pressing `N` or `P` while viewing a lesson changes the browser URL to the correct next/previous item, but the page content does not update. The video player, title, and all visible content remain on the old item.
2. **Prev/Next pager links (below the player):** Clicking the `<Link>` previous/next buttons in `ItemLayout.tsx` also changes the URL but does not re-render the content.
3. **Refresh workaround for pager links:** After the pager link bug occurs, refreshing the page a few times can "unstick" it, after which the pager links start working normally for sequential navigation.
4. **Refresh does NOT fix N/P shortcuts:** The keyboard shortcuts remain broken even after refreshes.
5. **Other shortcuts work fine:** `M` (mark complete), `B` (bookmark), `/` and `Ctrl+K` (command palette), `Esc` (close menus) all work correctly. This means the keyboard handler IS firing and `activeItem` IS correctly resolved.
6. **Tested with focus in different places:** User tried clicking on the video player first, then clicking on the page body. Neither helped.

### What the symptoms tell us

The core issue is almost certainly **not keyboard-related**. Both the keyboard shortcut (`navigate(href(nextItem))`) and the pager link (`<Link to={href(next)}>`) produce the same broken behavior: URL updates but content stays stale. This points to a **React Router navigation / component re-render problem** where changing the URL parameter (`:itemId`) does not trigger the `LessonView` or `AssignmentView` component to re-render with the new item.

### Relevant code paths

**Keyboard handler** (`App.tsx`, inside `StudyDesk`):

```
if (nextItem && e.key.toLowerCase() === 'n') {
  e.preventDefault()
  navigate(href(nextItem))  // href returns /lesson/lesson-<hash> or /assignment/assignment-<hash>
}
```

**Pager links** (`ItemLayout.tsx`):

```
<Link className="card pager-link" to={href(previous)}>
<Link className="card pager-link right" to={href(next)}>
```

Both use `href()` from `utils/helpers.ts` which returns `/lesson/${item.id}` or `/assignment/${item.id}`.

**LessonView** (`components/LessonView.tsx`):

```
const itemId = useParams().itemId
const lesson = items.find(
  (item): item is LessonItem => item.id === itemId && item.kind === 'lesson',
)
```

The component reads `itemId` from `useParams()`. When the URL changes from `/lesson/lesson-aaa` to `/lesson/lesson-bbb`, React Router should provide the new `itemId` via `useParams()`, causing the component to re-render with the new lesson.

**VideoPlayer** (`components/VideoPlayer.tsx`):

```
<VideoPlayer key={lesson.id} src={mediaUrl(lesson.relativePath)} ... />
```

The `key={lesson.id}` prop should force React to unmount/remount the VideoPlayer when the lesson changes.

### Analysis completed (not yet verified at runtime)

1. **Item IDs are clean.** `stableId()` in `shared.mjs` generates `prefix-<12 hex chars>` (e.g., `lesson-a1b2c3d4e5f6`). No special characters, no URL encoding issues.

2. **`nextItem` / `previousItem` should be defined.** They are computed from `activeItemIndex` which is derived from `activeItem`. Since `M` and `B` work (proving `activeItem` is truthy), `activeItemIndex` should be valid, and unless the user is on the very first/last item, both neighbors should exist.

3. **`orderedItems()` produces a flat array of all items across all weeks.** It uses `flatMap` over `index.weeks`, so `items[n+1]` can cross week boundaries. `ItemLayout.tsx` computes prev/next independently using the same `items` array and `findIndex`.

4. **Capture phase was added.** The keyboard listener was moved to `{ capture: true }` to fire before any child handlers. This didn't fix N/P, which is consistent with the bug being a navigation/render issue, not an event propagation issue.

5. **VideoPlayer has no keydown handlers.** Checked — there are no `onKeyDown` or `addEventListener('keydown', ...)` in VideoPlayer.tsx.

6. **React Router version:** `react-router-dom@^7.14.0`. This is React Router v7, which has significant architectural changes from v6. The `matchPath`, `useParams`, `useNavigate`, `<Link>`, and route parameter reactivity may behave differently.

### Hypotheses to investigate (ordered by likelihood)

1. **React Router v7 param change not triggering re-render.** When navigating from `/lesson/lesson-aaa` to `/lesson/lesson-bbb`, both match the same `<Route path="/lesson/:itemId">`. In some React Router versions or configurations, changing only the dynamic segment may not cause the route's `element` to unmount/remount. If `LessonView` doesn't re-render, `useParams().itemId` might return the stale value. **Test:** Add a `key` prop to the `<Route>`'s element based on `location.pathname` or `itemId`, or restructure so the component reacts to param changes.

2. **Stale closure in the keyboard `useEffect`.** The effect captures `nextItem` and `previousItem` in its closure. If these variables are referentially new objects on every render (they come from array indexing into a `useMemo`'d array, so they should be stable), the effect should re-run. But if something prevents the effect from re-running after navigation, the stale `nextItem` could cause repeated navigations to the same (now-current) URL. **Test:** Log `nextItem?.id` and `previousItem?.id` inside the keydown handler to see if they're stale.

3. **`LessonView` uses `items.find()` instead of `itemMap.get()`.** The `LessonView` component does `items.find((item) => item.id === itemId ...)` on every render. If `itemId` from `useParams()` isn't updating (hypothesis 1), the find returns the old lesson, and nothing visually changes.

4. **The pager-link intermittent behavior (works after refresh) suggests a hydration or initial-render timing issue.** The `<Link>` component from React Router v7 might handle client-side navigation differently on first load vs. subsequent navigations.

### Suggested fix approach

Start with hypothesis 1 — force React to re-mount the lesson/assignment view when the item ID changes:

- **Quick test:** Add `key={location.pathname}` to the route elements in `App.tsx`:
  ```
  <Route path="/lesson/:itemId" element={<LessonView key={itemId} ... />} />
  ```
  This would force a full re-mount on every param change.

- **Better long-term fix:** Ensure `LessonView` and `AssignmentView` properly react to `useParams()` changes via `useEffect` dependencies or by structuring the component to derive all state from the current `itemId`.

- **For the keyboard shortcuts specifically:** After fixing the render issue, also verify that `nextItem`/`previousItem` update correctly after navigation by checking the effect dependency values.

### What has NOT been tried

- No runtime debugging (console logs, React DevTools) has been done
- No React Router v7-specific documentation has been consulted for param-change reactivity
- The bug has not been tested with `npm run dev` (hot reload) vs. `npm start` (production build)
- No `key` prop fix has been attempted
- The `AssignmentView` variant has not been tested (only lesson/video navigation was reported)

