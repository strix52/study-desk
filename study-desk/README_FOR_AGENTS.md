# Study Desk Agent Readme

This is a short operational guide for any LLM or coding agent working inside `study-desk`.

For full project history, plan, architecture, current status, and safety constraints, read:

- [../LLM_CONTEXT.md](D:\download_extracted\final\Harkirat Cohort 0 - 1\LLM_CONTEXT.md)

## Mandatory Rule

Do not delete, modify, rename, move, or reorganize the original downloaded course content unless the user explicitly requests it.

Protected content includes:

- all `Week - ...` folders
- all lecture videos
- all PDFs
- all images/reference assets
- the full `Harkirat Assignment` tree
- all README files
- all starter files
- all tests
- all solutions

Only change the app layer and its generated state/cache unless explicitly told otherwise.

## Safe Write Scope

Safe to edit:

- `src/*`
- `server/*`
- `package.json`
- `vite.config.mjs`
- `.study-desk-data/*`
- launcher/support files inside the app folder

Use caution:

- `start-study-desk.bat` at the cohort root

Do not touch without explicit approval:

- `../Week - ...`
- `../Harkirat Assignment`

## Current App Shape

Frontend:

- React + Vite
- primary UI currently centered in `src/App.tsx`

Backend:

- Express server in `server/index.mjs`
- scanner/indexer in `server/course-indexer.mjs`
- helpers in `server/shared.mjs`

Persistence:

- generated cache + user state in `.study-desk-data`

## What the App Does

- scans local lecture and assignment folders
- groups content by week
- serves videos, PDFs, and images locally
- shows assignment previews from README/comments
- stores notes, progress, bookmarks, and recents
- supports open-folder / open-file / open-in-editor actions

## Common Commands

Dev:

```powershell
npm run dev
```

Production build:

```powershell
npm run build
```

Local server:

```powershell
npm start
```

Launcher for the user:

- double-click `..\start-study-desk.bat`

## Before Making Changes

1. Read `../LLM_CONTEXT.md`
2. Confirm your edits stay inside the app scope
3. Avoid destructive actions on source content
4. Prefer incremental improvements over rewrites
5. Re-run lint/build after substantial changes

