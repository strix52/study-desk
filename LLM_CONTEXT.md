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

1. **`ItemLayout.tsx` rewritten** — replaced the card header + button row with a compact inline header:
   - Title and eyebrow on the left, compact 32px icon buttons on the right
   - Status/bookmark/complete actions are icon-only buttons (`btn-sm`)
   - "Open asset / folder / editor" moved into a dropdown menu (chevron button with `.more-menu`)
   - Video/content area (`viewer-area`) appears immediately after the header with no card wrapper

2. **`App.css` updated** — new styles for `.item-header`, `.btn-sm`, `.more-menu-wrap`, `.more-menu`, `.viewer-area`; shell padding reduced from 16px to 12px, gap from 14px to 12px

3. **`align-content: start`** added to `.workspace` and `.panel` grids to prevent row stretching

### v2.2 — Git setup (COMPLETED)

- Root `.gitignore` created to exclude video files (*.mp4, *.mkv, etc.), `node_modules/`, `dist/`, `.study-desk-data/`, editor junk, `.cursor/`
- Initial commit on `main` branch: 273 files, 90,819 insertions (source code, assignments, study-desk app, LLM_CONTEXT.md, launcher)
- **No remote configured yet** — push was attempted but failed; user needs to add a remote with `git remote add origin <url>`
- The 31 `Week -` folders (tens of GB of video content) are excluded from git via `.gitignore`

## 3. Current Status

### What works

- Full study desk app: dashboard, week view, lesson view, assignment view
- Video playback with resume, speed control, auto-complete
- Progress tracking (completion status, video position/duration, bookmarks)
- Notes per item, browsable notes list
- Dark mode (persisted)
- Command palette search (Ctrl+K)
- Left rail curriculum map with active highlighting
- Right rail with notes, bookmarks, recents, next-up
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
5. **Keyboard shortcuts beyond Ctrl+K** — no vim-style navigation, no hotkeys for mark-complete/bookmark etc.
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
│       ├── StatusBadge.tsx   ← Status icon (completed/in-progress/not-started)
│       └── Metric.tsx        ← Number + label metric block
├── .gitignore               ← Excludes node_modules, dist, .study-desk-data
├── package.json
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
- `lastActiveItemId?: string` — for resume-learning
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

6. **CSS `color-mix()` usage** — requires Chrome 111+, Firefox 113+, Safari 16.2+. Fine for a local personal app.

7. **No git remote** — initial commit exists on `main` branch but no remote is configured.

8. **No automated tests** — the app passes type-check and lint, but there's no test suite. Manual runtime verification is recommended.

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
- `.study-desk-data` format (if migrated carefully)
- `.gitignore`, `LLM_CONTEXT.md`

Unsafe areas (need explicit user approval):

- any top-level `Week - ...` folder
- `Harkirat Assignment/`
- any lecture asset (video, PDF, image)
- any assignment asset (README, starter, test, solution)
