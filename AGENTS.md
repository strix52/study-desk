## Learned User Preferences

- Use browser/MCP tools (cursor-ide-browser, Playwright) for runtime debugging instead of relying only on static code analysis — the user explicitly corrected the agent for going in circles with static reasoning
- Keep LLM_CONTEXT.md up to date as the authoritative handoff document for other LLMs — user treats this as critical for continuity
- Document bug investigation progress (symptoms, hypotheses, what was tried) in LLM_CONTEXT.md when stuck, so the next LLM can pick up where you left off
- Plan first before implementing big features — user wants options/plans presented before coding starts
- UI should be perfectly usable, not fancy — minimize wasted vertical space, prioritize content visibility (especially video player placement)
- User runs Windows with PowerShell — heredoc syntax does not work; use temp files for multi-line git commit messages
- User wants simple one-click launchers (bat files) — avoid requiring manual terminal commands for routine operations
- When the agent is going in circles on a bug, stop and document the investigation state rather than continuing to spin

## Learned Workspace Facts

- Raw course content (Week folders, Harkirat Assignment/) is strictly READ-ONLY — never modify, delete, rename, or reorganize
- All app changes stay within study-desk/, start-study-desk.bat, .gitignore, and LLM_CONTEXT.md
- App is a React + Vite frontend with Express backend, serving on port 4307
- LLM_CONTEXT.md at project root is the canonical context file — read it first before making changes
- start-study-desk.bat is the one-click launcher — double-click to install deps, build, and open the app
- Video files (~86 .mp4 files in Week folders) are excluded from git; no git remote is configured yet
- CSS Grid default align-content: stretch caused a major layout bug (video pushed below fold) — fixed with align-content: start
- VideoPlayer unmount cleanup caused a navigation bug (URL changes but content stays) — fixed by deferring onProgress with setTimeout(…, 0)
- The app is for personal use only — offline-first, local data, not production grade
