# Harkirat Cohort Study Desk

Personal offline study app built on top of a downloaded coding course.
React + Vite frontend, Express backend, JSON file persistence. Port 4307.

## Safety Rules (MUST follow)

- NEVER delete, rename, overwrite, or reorganize anything in `Week - *` folders or `Harkirat Assignment/`
- These folders contain the original downloaded course content (videos, PDFs, assignments) and are READ-ONLY
- All app changes stay within: `study-desk/`, `start-study-desk.bat`, `*.ps1` scripts, `.gitignore`, `AGENTS.md`, `CHANGELOG.md`
- If unsure whether a change touches course content, stop and ask

## Commands

```powershell
cd "<your-course-root>\study-desk"
npm start          # Production server on port 4307
npm run dev        # Dev mode with hot reload
npm run build      # tsc + vite build
npx tsc -b --noEmit  # Type check
npx eslint src/    # Lint
```

One-click launcher: double-click `start-study-desk.bat` (handles deps, build, firewall, duplicate detection).

## Tech Stack

- Frontend: React 18, TypeScript strict, Vite, React Router v7, lucide-react icons
- Backend: Express (Node), serves API + static dist
- State: JSON files in `study-desk/.study-desk-data/` (not a DB)
- Styling: Plain CSS with custom properties, no CSS-in-JS, no Tailwind
- Fonts: Newsreader (display), Source Sans 3 (body)

## Architecture

- `server/index.mjs` — Express: bootstrap API, state persistence, file serving, media Range requests
- `server/course-indexer.mjs` — Scans Week folders + assignments into structured index
- `src/App.tsx` — Shell: all state, routing, left/right rails, topbar, mobile drawer + bottom bar
- `src/components/` — Dashboard, WeekView, LessonView, AssignmentView, VideoPlayer, CommandPalette, ItemLayout, ProgressBar, StatusBadge
- `src/utils/helpers.ts` — Pure functions: orderedItems, href, progress, search, normalization
- `src/types.ts` — TypeScript interfaces (CourseIndex, UserState, StudyItem, etc.)

State flows down via props. Actions memoized with useCallback. Saves debounced 400ms to backend.

## Conventions

- Functional components only, no class components
- Prop drilling with useCallback/useMemo over React Context (sufficient at this scale)
- CSS custom properties for theming; `[data-theme='dark']` on `<html>`
- Mobile breakpoint at 980px; responsive via @media queries in App.css
- No `any` types — strict TypeScript throughout
- Named exports for components
- Run lint + type-check before committing

## Key Warnings (regression prevention)

- VideoPlayer unmount: NEVER call synchronous state updates during unmount cleanup. The onProgress save MUST use `setTimeout(() => onProgress(...), 0)` to defer. Synchronous calls block React Router transitions (URL changes but content stays).
- Lesson/assignment routes are keyed by `location.pathname` to force remounts on param changes
- CSS Grid: use `align-content: start` on `.workspace` and `.panel` to prevent row stretching
- `vite.config.mjs` is the active config (not `.ts`)

## Mobile / Phone Access

- Server binds to 0.0.0.0 — accessible from any device on the same LAN
- Works over USB tethering, Wi-Fi hotspot, or home Wi-Fi (no tunnel needed)
- Smartphone button in topbar shows copyable Network URLs (fetches from /api/network)
- Firewall rule for port 4307 auto-added by the bat launcher
- Mobile UI: hamburger nav drawer, sticky bottom action bar, touch-optimized tap targets

## Windows Integration

- `start-study-desk.bat` — launcher with firewall rule, dep check, build check, duplicate server detection
- `create-shortcut.ps1` — creates Start Menu shortcut with custom icon
- `build-icon.ps1` — generates study-desk.ico via System.Drawing
- User runs Windows + PowerShell — heredoc syntax does NOT work; use temp files for multi-line git commits

## Related Context Files

- `study-desk/AGENTS.md` — App-specific: state shape, components, endpoints, CSS, gotchas
- `CHANGELOG.md` — Full version history if you need to understand past decisions
- `CLAUDE.md` — Points here (for Claude Code compatibility)
- `.cursor/rules/` — Cursor-specific scoped rules (safety, VideoPlayer regression, conventions)

## Working With This Codebase

1. Read this file first
2. Read `study-desk/AGENTS.md` for app-specific architecture details
3. Inspect the relevant component before editing
4. Assume original course content is untouchable

## Agent Preferences (learned from user)

- Use browser/runtime tools (Playwright, MCP browser) for debugging, not just static analysis
- Plan before implementing big features — present options first
- If stuck going in circles, stop and document the investigation state
- UI should be perfectly usable, not fancy — minimize wasted space, prioritize content visibility
- Keep context files up to date after making changes
- User wants simple one-click workflows — avoid requiring manual terminal commands
