<div align="center">
  <img src="study-desk/public/favicon.svg" alt="Study Desk" width="64" height="64" />
  <h1>Study Desk</h1>
  <p>A local-first study app that turns a downloaded course folder into an indexed, trackable learning interface.</p>
  <p>
    <img src="https://img.shields.io/badge/react-18-blue?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/typescript-strict-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/vite-6-purple?style=flat-square&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/express-4-green?style=flat-square&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/offline-first-orange?style=flat-square" alt="Offline First" />
  </p>
</div>

---

## What is this?

Study Desk is a personal offline web app for working through a downloaded video course sequentially. Instead of clicking through file explorer folders to find the next lecture, you get:

- A structured **curriculum view** organized by week
- **In-app video playback** with resume, speed control, and position tracking
- **PDF and image viewing** inline
- **Assignment previews** with README rendering and starter file links
- **Progress tracking** — completion status, bookmarks, video positions, personal notes
- **Resume learning** — the app remembers where you left off
- **Command palette** search across all content
- **Keyboard shortcuts** for navigation, completion, bookmarking
- **Dark mode**
- **Phone access** — serve to your phone over USB tethering or Wi-Fi for mobile study

Everything runs locally. No accounts, no cloud, no telemetry. Your data stays on your machine.

## Why?

I was working through a large coding cohort (20+ weeks, 90+ lectures, assignments per week) and needed something better than a file explorer. I wanted to:

- Track which lectures I'd watched and where I stopped
- Navigate sequentially without hunting for the next file
- Take notes alongside each lecture
- See my overall progress
- Watch lectures on my phone while my laptop was free for coding

This app scratches that itch. It's built for personal use — not production-grade, not fancy, just **perfectly usable with correct tracking**.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- A downloaded course folder with lecture media organized in subfolders

### Setup

```bash
git clone https://github.com/strix52/study-desk.git
cd study-desk/study-desk
npm install
npm run build
npm start
```

Open `http://localhost:4307` in your browser.

### One-Click Launcher (Windows)

Double-click `start-study-desk.bat` at the project root. It handles dependency installation, production build, firewall rules, and opens the browser automatically.

To add Study Desk to your Windows Start Menu:

```powershell
powershell -ExecutionPolicy Bypass -File create-shortcut.ps1
```

## Architecture

```
study-desk/
├── server/
│   ├── index.mjs            # Express backend: API, state, file serving
│   └── course-indexer.mjs    # Scans course folders into structured index
├── src/
│   ├── App.tsx               # Shell: state, routing, layout, mobile UI
│   ├── components/           # Dashboard, WeekView, LessonView, VideoPlayer, etc.
│   └── utils/helpers.ts      # Pure functions: progress, search, normalization
└── .study-desk-data/         # Generated: course index cache + user state (gitignored)
```

**Frontend:** React 18, TypeScript (strict), Vite, React Router v7, lucide-react icons. Plain CSS with custom properties — no CSS-in-JS, no Tailwind.

**Backend:** Express serves the API, static frontend, and course media files (with Range request support for video seeking). State is persisted as JSON files.

**State:** All progress, notes, bookmarks, and preferences live in a single JSON file. No database required.

## Features

| Feature | Details |
|---------|---------|
| Video playback | Resume position, speed control (0.75x–2x persisted), auto-complete at 95% |
| Progress tracking | Per-item completion, video position/duration, bookmarks |
| Notes | Per-item personal notes, browsable notes list |
| Search | Command palette (`Ctrl+K`) with fuzzy search across all content |
| Navigation | Sequential next/prev, keyboard shortcuts (N/P/M/B), week curriculum map |
| Phone access | Serve over LAN via USB tethering or Wi-Fi — in-app button shows copyable URL |
| Mobile UI | Hamburger drawer, sticky bottom bar, touch-optimized tap targets |
| Dark mode | Warm dark palette, persisted across sessions |
| Assignments | README rendering, starter/test/solution file detection |
| Resume | Engagement-based tracking — resumes from what you actually studied, not just glanced at |

## Phone Access

The app can be served to your phone over any local network connection:

1. **USB tethering** — phone tethers internet to laptop, both on the same subnet
2. **Wi-Fi hotspot** — laptop connects to phone hotspot, same result
3. **Home Wi-Fi** — both devices on the same network

The server prints `Network: http://<ip>:4307` on startup. Click the smartphone icon in the topbar to see and copy the URL. No tunnel or cloud service needed — video streams directly over the local connection.

## Adapting for Your Own Course

Study Desk scans for a specific folder structure:

```
your-course/
├── Week - 1 (Topic Name)/
│   ├── lecture-1.mp4
│   ├── lecture-2.mp4
│   └── notes.pdf
├── Week - 2 (Topic Name)/
│   └── ...
└── study-desk/               # Place the app here
```

The indexer looks for top-level folders matching `Week -` patterns containing media files (`.mp4`, `.mkv`, `.pdf`, `.png`, `.jpg`). Assignment folders are detected separately. Modify `server/course-indexer.mjs` if your folder structure differs.

## Disclaimer

This project is a personal learning tool built as a coding exercise. It is designed to work with locally stored course materials that the user has legitimately purchased or obtained. The repository does not contain any copyrighted course content — no videos, PDFs, or proprietary material.

This project does not encourage or condone piracy or unauthorized distribution of educational content. If you use this tool, please ensure you have the appropriate rights to the course materials you use it with.

## License

MIT
