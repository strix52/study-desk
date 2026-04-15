import { type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  FileText,
  FolderOpen,
  Pencil,
} from 'lucide-react'
import type { StudyItem, StudyStatus, UserState } from '../types'
import { href } from '../utils/helpers'

interface ItemLayoutProps {
  item: StudyItem
  items: StudyItem[]
  userState: UserState
  setStatus: (itemId: string, status: StudyStatus) => void
  toggleBookmark: (itemId: string) => void
  onOpenPath: (relativePath: string, action: 'folder' | 'file' | 'editor') => Promise<void>
  children: ReactNode
}

export function ItemLayout({
  item,
  items,
  userState,
  setStatus,
  toggleBookmark,
  onOpenPath,
  children,
}: ItemLayoutProps) {
  const state = userState.itemStates[item.id]
  const currentStatus = state?.status ?? 'not-started'
  const isBookmarked = state?.bookmarked ?? false
  const index = items.findIndex((entry) => entry.id === item.id)
  const previous = items[index - 1]
  const next = items[index + 1]
  const crossesWeekPrev = previous && previous.weekNumber !== item.weekNumber
  const crossesWeekNext = next && next.weekNumber !== item.weekNumber
  const [moreOpen, setMoreOpen] = useState(false)

  return (
    <div className="page page-enter">
      <header className="item-header">
        <div className="item-header-left">
          <span className="eyebrow">
            {item.weekLabel} · {item.kind === 'lesson' ? item.lessonType : 'assignment'}
          </span>
          <h2 className="item-title">{item.title}</h2>
        </div>
        <div className="item-header-actions">
          <button
            className={`btn-sm${currentStatus === 'completed' ? ' status-completed' : ''}`}
            onClick={() => setStatus(item.id, currentStatus === 'completed' ? 'not-started' : 'completed')}
            type="button"
            title={currentStatus === 'completed' ? 'Undo complete' : 'Mark complete'}
          >
            <CheckCircle2 size={15} />
          </button>
          <button
            className={`btn-sm${currentStatus === 'in-progress' ? ' status-in-progress' : ''}`}
            onClick={() => setStatus(item.id, currentStatus === 'in-progress' ? 'not-started' : 'in-progress')}
            type="button"
            title="In progress"
          >
            <CircleDashed size={15} />
          </button>
          <button
            className={`btn-sm${isBookmarked ? ' bookmarked' : ''}`}
            onClick={() => toggleBookmark(item.id)}
            type="button"
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark size={15} />
          </button>
          <div className="more-menu-wrap">
            <button className="btn-sm" onClick={() => setMoreOpen((v) => !v)} type="button" title="More actions">
              <ChevronDown size={15} />
            </button>
            {moreOpen && (
              <div className="more-menu" onMouseLeave={() => setMoreOpen(false)}>
                <button onClick={() => { onOpenPath(item.relativePath, 'file'); setMoreOpen(false) }} type="button">
                  <FileText size={14} /> Open asset
                </button>
                <button onClick={() => { onOpenPath(item.relativePath, 'folder'); setMoreOpen(false) }} type="button">
                  <FolderOpen size={14} /> Open folder
                </button>
                <button onClick={() => { onOpenPath(item.relativePath, 'editor'); setMoreOpen(false) }} type="button">
                  <Pencil size={14} /> Open in editor
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="viewer-area">{children}</section>

      <div className="pager">
        {previous ? (
          <Link className="card pager-link" to={href(previous)}>
            <ArrowLeft size={16} />
            <span>
              {crossesWeekPrev && <small className="pager-week">{previous.weekLabel}</small>}
              <small>Previous</small>
              {previous.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link className="card pager-link right" to={href(next)}>
            <span>
              {crossesWeekNext && <small className="pager-week">{next.weekLabel}</small>}
              <small>Next</small>
              {next.title}
            </span>
            <ArrowRight size={16} />
          </Link>
        ) : null}
      </div>
    </div>
  )
}
