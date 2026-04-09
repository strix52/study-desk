# LLM Context: Harkirat Cohort Study Desk

This file is the authoritative handoff context for any future LLM or coding agent working in this workspace.

Read this before making changes.

## 1. Project Intent

The user wanted a local indexed study interface on top of an already-downloaded course folder. The source material is a downloaded cohort with:

- top-level week folders containing lecture media such as `.mp4`, `.mkv`, `.pdf`, and a small number of image/reference files
- a separate `Harkirat Assignment` tree containing exercises, READMEs, starter files, tests, and solution folders

The desired product was not a plain file explorer. The chosen direction was an indexed local web app optimized for sequential study:

- weekly curriculum view
- in-app lecture/PDF viewing
- assignment preview and metadata extraction
- local progress tracking
- local personal notes
- bookmarks and recents
- “resume learning” flow
- file/folder/editor open actions

The app is offline-first and uses only local data.

## 2. Original Plan

The original plan from the user was:

### Content ingestion and normalization

- scan the course root into a structured index
- normalize folder names into `weekNumber`, `weekLabel`, `partLabel`, `topicTitle`, and items
- treat lecture media and assignment folders as first-class study items
- parse assignment metadata from:
  - `README.md`
  - top-of-file comments in starter files
  - known markers such as `easy`, `medium`, `hard`, `tests`, `solutions`
- keep generated data separate from raw course files

### Frontend shape

- left rail with curriculum map and completion state
- main content for week/lesson/assignment views
- right utility rail for notes, bookmarks, recents, and next-up queue
- search / quick-jump palette
- resume-learning landing flow

### Core study behavior

- play local videos in-app
- show PDFs inline where possible
- link assignments to matching weeks
- show README summary, difficulty, starter preview, tests, solution badge
- save user state locally
- keep personal state out of the downloaded source content

### Recommended tech

- React + Vite frontend
- minimal local Node/Express backend for scanning and file actions
- JSON cache/state for v1

## 3. What Existed Before Work Continued

When work resumed, the `study-desk` folder existed, but it was still effectively the default Vite starter:

- starter React counter page
- starter CSS
- added dependencies, but no real study desk implementation
- no real scanner
- no real local API
- no real persistence model
- no actual curriculum UI

So this was not a partial study app that merely needed minor fixes. It was mostly scaffolding.

## 4. Current Status

The app has been implemented through a v2 usability overhaul on top of the original v1.

### Verified working pieces

- local backend server
- folder scanner / course index generation
- normalized week grouping for lecture folders
- assignment indexing and preview extraction
- user state persistence (with video position, speed, theme)
- React study interface (split into component files)
- local media serving (with Range request support via Express sendFile)
- open-folder / open-file / open-in-editor actions
- command palette with keyboard navigation (arrow keys + Enter)
- dashboard / week / lesson / assignment flows with progress bars
- video resume from saved position
- video playback speed control (0.75x–2x, persisted)
- auto-mark-complete on video end
- dark mode toggle (warm dark palette, persisted)
- left rail active week highlighting with auto-scroll
- week part grouping (Part 1 / Part 2 dividers)
- status-aware action buttons (completed / in-progress visual states)
- notes browsing (all notes list in right rail)
- item type icons in utility lists
- 404 catch-all route
- prev/next pager shows week-boundary labels
- page entrance animations
- one-click `.bat` launcher

### Verified checks

These were verified after the v2 overhaul:

- `eslint src/` passes with zero errors
- `tsc -b --noEmit` passes with zero errors
- `npm run build` passes (tsc + vite build)

### Current indexed content snapshot

At the time of verification, the app indexed:

- `21` weeks
- `92` lesson assets
- `21` assignment entries
- `78` videos
- `13` PDFs
- `1` image

These numbers may change if the source folders change and the index is refreshed.

## 5. Hard Safety Rules

These rules are critical. Future LLMs must preserve them.

### Non-destructive boundary

The downloaded course content is the source of truth and must not be modified or deleted by the app or by future automation unless the user explicitly asks for it.

Protected content includes, but is not limited to:

- top-level `Week - ...` folders
- all lecture videos
- all PDFs
- any images or schedule/reference assets in those week folders
- the entire `Harkirat Assignment` folder
- all assignment READMEs
- all starter files
- all tests
- all solution folders

### Absolute rule

Do not delete, rename, overwrite, reorganize, or “clean up” the original downloaded study material.

That includes:

- videos
- PDFs
- images
- assignment files
- schedules / notes / source content
- folders outside the app’s own implementation area

### Allowed write scope

Future changes should be limited to:

- the app folder: `study-desk`
- the launcher file: `start-study-desk.bat`
- the app’s generated data/cache/state area

### If unsure

If a change might touch original study material, stop and avoid the change unless the user has explicitly requested it.

## 6. Current Directory Responsibilities

### Protected source content

These are source-content areas and should be treated as read-only by default:

- `D:\download_extracted\final\Harkirat Cohort 0 - 1\Week - ...`
- `D:\download_extracted\final\Harkirat Cohort 0 - 1\Harkirat Assignment`

### App implementation

Main app folder:

- `D:\download_extracted\final\Harkirat Cohort 0 - 1\study-desk`

Important files:

- `server/index.mjs`
- `server/course-indexer.mjs`
- `server/shared.mjs`
- `src/App.tsx` (shell, state management, left/right rails)
- `src/App.css`
- `src/index.css` (CSS variables, dark mode, globals)
- `src/api.ts`
- `src/types.ts`
- `src/utils/helpers.ts`
- `src/components/VideoPlayer.tsx`
- `src/components/Dashboard.tsx`
- `src/components/WeekView.tsx`
- `src/components/LessonView.tsx`
- `src/components/AssignmentView.tsx`
- `src/components/ItemLayout.tsx`
- `src/components/CommandPalette.tsx`
- `src/components/ProgressBar.tsx`
- `src/components/StatusBadge.tsx`
- `src/components/Metric.tsx`
- `vite.config.mjs`
- `package.json`

Launcher:

- `D:\download_extracted\final\Harkirat Cohort 0 - 1\start-study-desk.bat`

### Generated app data

Current sidecar-like data location:

- `D:\download_extracted\final\Harkirat Cohort 0 - 1\study-desk\.study-desk-data\...`

This currently stores:

- generated course index cache
- user progress / notes / recents state

Note: this is inside the app folder, not outside the cohort root. This was chosen because it worked reliably in the current environment without touching raw course folders.

## 7. Runtime / Usage

### Normal usage

The simplest user flow is to double-click:

- `start-study-desk.bat`

That script:

- checks dependencies
- builds if needed
- starts the local server
- opens the browser at `http://localhost:4307`

### Manual commands

Production-style local server:

```powershell
cd "D:\download_extracted\final\Harkirat Cohort 0 - 1\study-desk"
npm start
```

Dev mode:

```powershell
cd "D:\download_extracted\final\Harkirat Cohort 0 - 1\study-desk"
npm run dev
```

### Build

```powershell
cd "D:\download_extracted\final\Harkirat Cohort 0 - 1\study-desk"
npm run build
```

## 8. Architecture Overview

### Backend

`server/index.mjs`

Responsibilities:

- serves bootstrap payload
- refreshes index
- saves user state
- serves local files for media/PDF/image viewing
- opens local file/folder/editor actions
- serves built frontend when `dist` exists

`server/course-indexer.mjs`

Responsibilities:

- scans week folders
- extracts week number and part number
- indexes lecture media files
- scans `Harkirat Assignment`
- detects assignment group folders
- reads README content
- extracts starter previews
- detects tests and solutions

`server/shared.mjs`

Responsibilities:

- path helpers
- normalization helpers
- comment/summary extraction helpers
- file type helpers

### Frontend

`src/App.tsx`

Main shell: bootstrap, state management, left rail, right rail, routing, and small helper components (UtilityList, NotesList, Metric, CenteredState, ItemTypeIcon).

`src/components/Dashboard.tsx` — dashboard view with overall progress bar and week cards
`src/components/WeekView.tsx` — week timeline with part grouping and video progress bars
`src/components/LessonView.tsx` — lesson viewer that delegates to VideoPlayer / iframe / img
`src/components/AssignmentView.tsx` — assignment viewer with README, starter preview, flags
`src/components/ItemLayout.tsx` — shared item chrome: header, status badge, action buttons, pager
`src/components/VideoPlayer.tsx` — custom video player with resume, speed control, auto-complete
`src/components/CommandPalette.tsx` — search palette with keyboard navigation (arrow/enter)
`src/components/ProgressBar.tsx` — reusable progress bar
`src/components/StatusBadge.tsx` — status icon (completed/in-progress/not-started)
`src/components/Metric.tsx` — number + label metric block

`src/utils/helpers.ts`

- pure utility functions: orderedItems, href, description, normalizeState, weekProgress, courseProgress, recentTrail, nextQueue, searchResults

`src/api.ts`

- client API wrappers for bootstrap, refresh, save-state, open-path, file URLs

`src/types.ts`

- course index and user state types (includes playbackPosition, duration, playbackSpeed, theme, SearchResult)

## 9. Current Features

### Dashboard

- resume-learning entry point with last-active title
- overall course progress bar with percentage
- completed / in-progress / bookmarked metrics
- week cards with individual progress bars

### Left rail

- curriculum map by week with per-week progress bars
- active week highlighting (accent border) based on current route
- auto-scroll to active week on navigation
- week completion status icons (color-coded)
- refresh-index button

### Week page

- ordered week timeline with part grouping (Part 1 / Part 2 dividers)
- assignment section divider
- per-item status coloring on timeline cards
- video playback progress bars on partially-watched videos

### Lesson page

- video player with resume from saved position
- playback speed control (0.75x–2x, globally persisted)
- auto-mark-complete when video ends (with toast notification)
- video position saved every 5 seconds and on pause
- inline PDF display via iframe
- image display for supporting assets
- status badge showing current state
- status-aware action buttons (completed = green, in-progress = amber, bookmarked = accent)
- open file / open folder / open in editor
- previous / next navigation with week-boundary labels

### Assignment page

- summary from README or top-of-file prompt extraction
- README preview (rendered markdown)
- starter-file preview snippets
- solution/test/readme badges
- difficulty chip
- open folder / open editor actions

### Right rail

- notes editor for current item
- browse all notes list (sorted by last updated, with preview snippets)
- bookmarks with item type icons
- recents with item type icons
- next-up queue with item type icons
- show-all / show-less toggle on lists with more than 6 items

### Search

- command palette (Ctrl/Cmd+K) with keyboard navigation (arrow keys + enter)
- searches weeks and indexed items
- active result highlighting
- no-results message for empty searches
- escape to close

### Dark mode

- warm dark theme via CSS custom properties
- toggle button in topbar (moon/sun icon)
- theme preference persisted in user state
- all components and backgrounds adapt

### Animations

- page entrance transitions (fade + slide)
- palette backdrop and slide-up animation
- smooth progress bar transitions

## 10. Known Quirks / Limitations

These are not necessarily bugs, but they matter for future work.

### 1. Data folder location

The original plan preferred app data outside the downloaded cohort. The current implementation stores app data under:

- `study-desk\.study-desk-data`

This still keeps the raw study files untouched, but it is not the ideal external sidecar location from the original plan.

### 2. Assignment grouping is heuristic

Assignment grouping is based on folder structure and naming conventions. It works reasonably for the current course tree, but the extraction is heuristic rather than schema-driven.

Example:

- a week with `easy`, `medium`, `hard` folders may appear as multiple assignment entries based on subfolders
- summary quality depends on README or starter comments being present

### 3. No transcript or semantic search

Not implemented.

### 4. No embedded DB

State uses JSON files, not SQLite or another embedded DB.

### 5. Editor launch is best-effort

Open-in-editor tries `code`, `cursor`, `code-insiders` in order, falling back to Explorer.

### 6. Vite config quirk

The active config used by scripts is `vite.config.mjs`.

### 7. Video position save granularity

Video position is saved every 5 seconds during playback and on pause/end. A crash or forced close could lose up to 5 seconds of position data.

### 8. CSS color-mix usage

The CSS uses `color-mix(in srgb, ...)` for status-tinted backgrounds. This requires a modern browser (Chrome 111+, Firefox 113+, Safari 16.2+). For a local personal app this is fine.

## 11. Implementation Decisions Made

These decisions were deliberate:

- preserve the raw course content completely
- keep the app local and offline-first
- use a minimal Express backend rather than Electron/Tauri
- use JSON cache/state for v1
- favor a usable product now over early abstraction
- make the app launchable by double-click via `.bat`

## 12. What Future LLMs Should Optimize For

If continuing this project, optimize for:

- preserving the non-destructive boundary
- improving assignment extraction accuracy
- improving UI polish without breaking local functionality
- keeping navigation fast for sequential study
- keeping persistence simple and reliable
- avoiding rewrites unless clearly justified

## 13. What Future LLMs Should Avoid

Avoid:

- touching or restructuring raw study files
- moving videos/PDFs/assignments around
- deleting “unused” course files
- replacing the local architecture with something more complex unless the user asks
- introducing network dependence for core features
- overengineering persistence before the user asks for it

## 14. Safe Refactor Boundaries

Safe areas to refactor:

- `study-desk/src/*`
- `study-desk/server/*`
- `study-desk/package.json`
- `study-desk/vite.config.mjs`
- `start-study-desk.bat`
- `.study-desk-data` format if migrated carefully

Unsafe areas without explicit user approval:

- any top-level `Week - ...` folder
- `Harkirat Assignment`
- any lecture asset
- any assignment asset

## 15. If You Are Another LLM Picking This Up

Before editing:

1. read this file
2. inspect `study-desk/package.json`
3. inspect `server/index.mjs`
4. inspect `server/course-indexer.mjs`
5. inspect `src/App.tsx` (shell + state management)
6. inspect `src/types.ts` and `src/utils/helpers.ts`
7. inspect the relevant component in `src/components/` for the area you are changing
8. assume original study files are out of scope for destructive actions

If you need to add features, do so inside the app layer only unless the user explicitly requests otherwise.

