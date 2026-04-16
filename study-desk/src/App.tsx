import {
  useDeferredValue,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from 'react'
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  matchPath,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  FileCode2,
  FileText,
  Keyboard,
  LibraryBig,
  Moon,
  RefreshCcw,
  Search,
  Sun,
  Video,
} from 'lucide-react'
import './App.css'
import { getBootstrap, openLocalPath, refreshCourseIndex, saveUserState } from './api'
import type { BootstrapPayload, CourseIndex, StudyItem, StudyStatus, UserState } from './types'
import {
  courseProgress,
  href,
  normalizeState,
  nextQueue,
  orderedItems,
  remainingVideoTime,
  recentTrail,
  searchResults,
  weekProgress,
} from './utils/helpers'
import { Dashboard } from './components/Dashboard'
import { WeekView } from './components/WeekView'
import { LessonView } from './components/LessonView'
import { AssignmentView } from './components/AssignmentView'
import { CommandPalette } from './components/CommandPalette'
import { ProgressBar } from './components/ProgressBar'
import { StatusBadge } from './components/StatusBadge'

function App() {
  const [payload, setPayload] = useState<BootstrapPayload | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getBootstrap()
      .then(setPayload)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  if (error) return <CenteredState title="Study desk failed to start" copy={error} />
  if (!payload) {
    return (
      <CenteredState
        title="Indexing the cohort library..."
        copy="Scanning local lectures, PDFs, assignments, tests, and saved study state."
      />
    )
  }

  return (
    <BrowserRouter>
      <StudyDesk initialIndex={payload.index} initialState={normalizeState(payload.state)} />
    </BrowserRouter>
  )
}

function StudyDesk({
  initialIndex,
  initialState,
}: {
  initialIndex: CourseIndex
  initialState: UserState
}) {
  const [index, setIndex] = useState(initialIndex)
  const [userState, setUserState] = useState(initialState)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const deferredQuery = useDeferredValue(query)
  const weekListRef = useRef<HTMLDivElement>(null)

  const themeApplied = useRef(false)
  if (!themeApplied.current) {
    themeApplied.current = true
    document.documentElement.dataset.theme = initialState.theme ?? 'light'
  }

  const items = useMemo(() => orderedItems(index), [index])
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const activeItemId =
    matchPath('/lesson/:itemId', location.pathname)?.params.itemId ??
    matchPath('/assignment/:itemId', location.pathname)?.params.itemId
  const activeItem = activeItemId ? itemMap.get(activeItemId) : undefined
  const activeLesson =
    activeItem?.kind === 'lesson' ? activeItem : undefined
  const activeAssignment =
    activeItem?.kind === 'assignment' ? activeItem : undefined
  const lastActive = userState.lastActiveItemId
    ? itemMap.get(userState.lastActiveItemId)
    : undefined

  const activeWeekNumber = useMemo(() => {
    const weekMatch = matchPath('/week/:weekNumber', location.pathname)
    if (weekMatch?.params.weekNumber) return Number(weekMatch.params.weekNumber)
    if (activeItem) return activeItem.weekNumber
    return undefined
  }, [location.pathname, activeItem])

  useEffect(() => {
    if (activeWeekNumber == null || !weekListRef.current) return
    const el = weekListRef.current.querySelector('.week-link.active')
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeWeekNumber])

  const bookmarks = useMemo(
    () => items.filter((i) => userState.itemStates[i.id]?.bookmarked),
    [items, userState.itemStates],
  )
  const recents = useMemo(
    () =>
      userState.recent
        .map((entry) => ({ entry, item: itemMap.get(entry.itemId) }))
        .filter((e): e is { entry: (typeof e)['entry']; item: StudyItem } => Boolean(e.item)),
    [userState.recent, itemMap],
  )
  const nextUp = useMemo(() => nextQueue(items, userState), [items, userState])
  const results = searchResults(index, userState, deferredQuery)
  const remainingTime = useMemo(() => remainingVideoTime(items, userState), [items, userState])
  const continueQueue = useMemo(() => {
    if (!lastActive) return nextUp.slice(0, 3)
    return [lastActive, ...nextUp.filter((item) => item.id !== lastActive.id)].slice(0, 3)
  }, [lastActive, nextUp])
  const activeItemIndex = activeItem ? items.findIndex((item) => item.id === activeItem.id) : -1
  const previousItem = activeItemIndex > 0 ? items[activeItemIndex - 1] : undefined
  const nextItem = activeItemIndex >= 0 ? items[activeItemIndex + 1] : undefined

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveUserState(userState).catch((e) =>
        setMessage(e instanceof Error ? e.message : String(e)),
      )
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [userState])

  const visitItem = useCallback((item: StudyItem) => {
    setUserState((state) =>
      normalizeState({
        ...state,
        itemStates: {
          ...state.itemStates,
          [item.id]: {
            ...state.itemStates[item.id],
            status:
              state.itemStates[item.id]?.status === 'completed' ? 'completed' : 'in-progress',
            bookmarked: state.itemStates[item.id]?.bookmarked,
            updatedAt: new Date().toISOString(),
          },
        },
        recent: recentTrail(state.recent, item.id),
      }),
    )
  }, [])

  const markEngaged = useCallback((itemId: string) => {
    setUserState((state) =>
      normalizeState({
        ...state,
        lastActiveItemId: itemId,
      }),
    )
  }, [])

  const setStatus = useCallback((itemId: string, status: StudyStatus) => {
    setUserState((state) =>
      normalizeState({
        ...state,
        itemStates: {
          ...state.itemStates,
          [itemId]: { ...state.itemStates[itemId], status, updatedAt: new Date().toISOString() },
        },
      }),
    )
  }, [])

  const toggleBookmark = useCallback((itemId: string) => {
    setUserState((state) =>
      normalizeState({
        ...state,
        itemStates: {
          ...state.itemStates,
          [itemId]: {
            ...state.itemStates[itemId],
            status: state.itemStates[itemId]?.status ?? 'not-started',
            bookmarked: !state.itemStates[itemId]?.bookmarked,
            updatedAt: new Date().toISOString(),
          },
        },
      }),
    )
  }, [])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          Boolean(target.closest('input, textarea, [contenteditable="true"]')))
      if (isTyping) {
        if (e.key === 'Escape') {
          setPaletteOpen(false)
          setShortcutsOpen(false)
        }
        return
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setPaletteOpen(true)
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
        return
      }
      if (e.key === 'Escape') {
        setPaletteOpen(false)
        setShortcutsOpen(false)
        return
      }
      if (paletteOpen || e.ctrlKey || e.metaKey || e.altKey) return
      if (activeItem && e.key.toLowerCase() === 'm') {
        e.preventDefault()
        const status = userState.itemStates[activeItem.id]?.status
        setStatus(activeItem.id, status === 'completed' ? 'not-started' : 'completed')
        return
      }
      if (activeItem && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleBookmark(activeItem.id)
        return
      }
      if (nextItem && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        navigate(href(nextItem))
        return
      }
      if (previousItem && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        navigate(href(previousItem))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeItem, navigate, nextItem, paletteOpen, previousItem, setStatus, toggleBookmark, userState.itemStates])

  const updateNote = useCallback((itemId: string, body: string) => {
    setUserState((state) =>
      normalizeState({
        ...state,
        notes: { ...state.notes, [itemId]: { body, updatedAt: new Date().toISOString() } },
      }),
    )
  }, [])

  const updateVideoProgress = useCallback(
    (itemId: string, position: number, duration: number) => {
      setUserState((state) =>
        normalizeState({
          ...state,
          itemStates: {
            ...state.itemStates,
            [itemId]: {
              ...state.itemStates[itemId],
              status: state.itemStates[itemId]?.status ?? 'in-progress',
              playbackPosition: position,
              duration,
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      )
    },
    [],
  )

  const setPlaybackSpeed = useCallback((speed: number) => {
    setUserState((state) => normalizeState({ ...state, playbackSpeed: speed }))
  }, [])

  const toggleTheme = useCallback(() => {
    setUserState((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      return normalizeState({ ...state, theme: next })
    })
  }, [])

  const refreshIndex = useCallback(async () => {
    setRefreshing(true)
    try {
      const next = await refreshCourseIndex()
      startTransition(() => setIndex(next))
      setMessage('')
    } catch (e) {
      setMessage(e instanceof Error ? e.message : String(e))
    } finally {
      setRefreshing(false)
    }
  }, [])

  const openPath = useCallback(
    async (relativePath: string, action: 'folder' | 'file' | 'editor') => {
      try {
        await openLocalPath(relativePath, action)
        setMessage('')
      } catch (e) {
        setMessage(e instanceof Error ? e.message : String(e))
      }
    },
    [],
  )

  const allNotes = useMemo(() => {
    return Object.entries(userState.notes)
      .filter(([, note]) => note.body.trim())
      .map(([id, note]) => ({ id, item: itemMap.get(id), note }))
      .filter((n): n is typeof n & { item: StudyItem } => Boolean(n.item))
      .sort((a, b) => b.note.updatedAt.localeCompare(a.note.updatedAt))
  }, [userState.notes, itemMap])

  const overall = courseProgress(index, userState)

  return (
    <>
      <div className="shell">
        {/* Left rail */}
        <aside className="panel left-panel">
          <div className="card hero-card">
            <div className="hero-title-row">
              <span className="hero-title">{index.courseTitle}</span>
              <Link className="hero-resume" to={lastActive ? href(lastActive) : '/'}>
                {lastActive ? 'Resume →' : 'Dashboard →'}
              </Link>
            </div>
            <ProgressBar value={overall.fraction} className="hero-progress" />
            <span className="hero-stat">
              {Math.round(overall.fraction * 100)}% · {overall.completed}/{overall.total} ·{' '}
              {index.stats.weeks}w · {index.stats.lessons}L · {index.stats.assignments}A
            </span>
          </div>

          <div className="card week-list" ref={weekListRef}>
            <div className="section-row">
              <strong>Curriculum</strong>
              <button
                className="icon-button"
                disabled={refreshing}
                onClick={refreshIndex}
                type="button"
              >
                <RefreshCcw size={15} className={refreshing ? 'spin' : ''} />
              </button>
            </div>
            {index.weeks.map((week) => {
              const progress = weekProgress(week, userState)
              const isActive = week.weekNumber === activeWeekNumber
              return (
                <Link
                  className={`week-link${isActive ? ' active' : ''}`}
                  key={week.id}
                  to={`/week/${week.weekNumber}`}
                >
                  <span className="week-link-top">
                    <strong>{week.weekLabel}</strong>
                    <StatusBadge status={progress.status} />
                  </span>
                  <span className="week-title">{week.title}</span>
                  <ProgressBar value={progress.fraction} className="week-link-progress" />
                  <small>
                    {progress.completed}/{progress.total} complete
                  </small>
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Workspace */}
        <section className="workspace">
          <header className="topbar">
            <Link className="brand" to="/">
              <LibraryBig size={18} />
              <span>Study desk</span>
            </Link>
            <button
              className="search-trigger"
              onClick={() => setPaletteOpen(true)}
              type="button"
            >
              <Search size={16} />
              <span>Jump to any week, lesson, or assignment</span>
              <kbd>Ctrl K</kbd>
            </button>
            <div className="shortcuts-wrap">
              <button
                className={`icon-button${shortcutsOpen ? ' active' : ''}`}
                onClick={() => setShortcutsOpen((value) => !value)}
                type="button"
                title="Show keyboard shortcuts"
              >
                <Keyboard size={16} />
              </button>
              {shortcutsOpen && (
                <div className="shortcuts-popover" onMouseLeave={() => setShortcutsOpen(false)}>
                  <div className="section-row">
                    <strong>Shortcuts</strong>
                    <small>Learning mode</small>
                  </div>
                  <div className="shortcuts-list">
                    <ShortcutHint keys={['Ctrl', 'K']} label="Open command palette" />
                    <ShortcutHint keys={['/']} label="Open command palette" />
                    <ShortcutHint keys={['N']} label="Next lesson or assignment" />
                    <ShortcutHint keys={['P']} label="Previous lesson or assignment" />
                    <ShortcutHint keys={['M']} label="Mark complete / undo" />
                    <ShortcutHint keys={['B']} label="Bookmark / unbookmark" />
                    <ShortcutHint keys={['Esc']} label="Close menus" />
                  </div>
                </div>
              )}
            </div>
            <button
              className="icon-button"
              onClick={toggleTheme}
              type="button"
              title="Toggle theme"
            >
              {userState.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </header>

          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  index={index}
                  userState={userState}
                  lastActive={lastActive}
                  continueQueue={continueQueue}
                  remainingVideoSeconds={remainingTime.totalSeconds}
                  remainingVideoCount={remainingTime.remainingCount}
                />
              }
            />
            <Route
              path="/week/:weekNumber"
              element={<WeekView index={index} userState={userState} onOpen={visitItem} />}
            />
            <Route
              path="/lesson/:itemId"
              element={
                <LessonView
                  key={location.pathname}
                  lesson={activeLesson}
                  items={items}
                  userState={userState}
                  onVisit={visitItem}
                  onEngage={markEngaged}
                  setStatus={setStatus}
                  toggleBookmark={toggleBookmark}
                  onOpenPath={openPath}
                  onVideoProgress={updateVideoProgress}
                  onSpeedChange={setPlaybackSpeed}
                />
              }
            />
            <Route
              path="/assignment/:itemId"
              element={
                <AssignmentView
                  key={location.pathname}
                  assignment={activeAssignment}
                  items={items}
                  userState={userState}
                  onVisit={visitItem}
                  onEngage={markEngaged}
                  setStatus={setStatus}
                  toggleBookmark={toggleBookmark}
                  onOpenPath={openPath}
                />
              }
            />
            <Route
              path="*"
              element={
                <CenteredState
                  title="Page not found"
                  copy="This URL doesn't match any view in the study desk."
                />
              }
            />
          </Routes>
        </section>

        {/* Right rail */}
        <aside className="panel right-panel">
          <div className="card note-card">
            <div className="section-row">
              <strong>Notes</strong>
              <small>{activeItem ? activeItem.title : 'Select an item'}</small>
            </div>
            {activeItem ? (
              <textarea
                className="note-input"
                onChange={(e) => updateNote(activeItem.id, e.target.value)}
                placeholder="Notes…"
                rows={3}
                value={userState.notes[activeItem.id]?.body ?? ''}
              />
            ) : (
              <p className="muted">Open a lesson or assignment to take notes.</p>
            )}
          </div>

          {allNotes.length > 0 && (
            <NotesList notes={allNotes} onNavigate={(item) => navigate(href(item))} />
          )}

          <UtilityList
            label="Bookmarks"
            items={bookmarks}
            onNavigate={(item) => navigate(href(item))}
          />
          <UtilityList
            label="Recents"
            items={recents.map((e) => e.item)}
            onNavigate={(item) => navigate(href(item))}
          />
          <UtilityList
            label="Next up"
            items={nextUp}
            onNavigate={(item) => navigate(href(item))}
          />
          {message && <div className="card message-card">{message}</div>}
        </aside>
      </div>

      {paletteOpen && (
        <CommandPalette
          results={results}
          query={query}
          onQueryChange={setQuery}
          onSelect={(r) => {
            setPaletteOpen(false)
            setQuery('')
            navigate(r.to)
          }}
          onClose={() => setPaletteOpen(false)}
        />
      )}
    </>
  )
}

function ItemTypeIcon({ item }: { item: StudyItem }) {
  if (item.kind === 'assignment') return <FileCode2 size={14} />
  if (item.lessonType === 'video') return <Video size={14} />
  if (item.lessonType === 'pdf') return <FileText size={14} />
  return <FileText size={14} />
}

function UtilityList({
  label,
  items,
  onNavigate,
}: {
  label: string
  items: StudyItem[]
  onNavigate: (item: StudyItem) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? items : items.slice(0, 6)

  return (
    <div className="card utility-card">
      <div className="section-row">
        <strong>{label}</strong>
        <small>{items.length}</small>
      </div>
      {items.length > 0 ? (
        <>
          {visible.map((item) => (
            <button
              className="utility-link"
              key={item.id}
              onClick={() => onNavigate(item)}
              type="button"
            >
              <span className="utility-link-main">
                <ItemTypeIcon item={item} />
                {item.title}
              </span>
              <small>{item.weekLabel}</small>
            </button>
          ))}
          {items.length > 6 && (
            <button
              className="utility-toggle"
              onClick={() => setExpanded((e) => !e)}
              type="button"
            >
              {expanded ? 'Show less' : `Show all ${items.length}`}
            </button>
          )}
        </>
      ) : (
        <p className="muted">Nothing here yet.</p>
      )}
    </div>
  )
}

function NotesList({
  notes,
  onNavigate,
}: {
  notes: Array<{ id: string; item: StudyItem; note: { body: string; updatedAt: string } }>
  onNavigate: (item: StudyItem) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? notes : notes.slice(0, 4)

  return (
    <div className="card utility-card">
      <div className="section-row">
        <strong>All notes</strong>
        <small>{notes.length}</small>
      </div>
      {visible.map((n) => (
        <button className="utility-link" key={n.id} onClick={() => onNavigate(n.item)} type="button">
          <span className="utility-link-main">
            <ItemTypeIcon item={n.item} />
            {n.item.title}
          </span>
          <small className="note-preview">{n.note.body.slice(0, 80)}</small>
        </button>
      ))}
      {notes.length > 4 && (
        <button
          className="utility-toggle"
          onClick={() => setExpanded((e) => !e)}
          type="button"
        >
          {expanded ? 'Show less' : `Show all ${notes.length}`}
        </button>
      )}
    </div>
  )
}

function ShortcutHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="shortcut-row">
      <span className="shortcut-keys">
        {keys.map((key) => (
          <kbd key={key}>{key}</kbd>
        ))}
      </span>
      <span>{label}</span>
    </div>
  )
}

function CenteredState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="centered-state">
      <div className="card state-card">
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
    </div>
  )
}

export default App
