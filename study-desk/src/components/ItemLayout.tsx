import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  CircleDashed,
  FileText,
  FolderOpen,
} from 'lucide-react'
import type { StudyItem, StudyStatus, UserState } from '../types'
import { description, href } from '../utils/helpers'

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

  return (
    <div className="page page-enter">
      <section className="card page-card">
        <span className="eyebrow">
          {item.weekLabel} · {item.kind === 'lesson' ? item.lessonType : 'assignment'}
        </span>
        <h2>{item.title}</h2>
        <p>{description(item)}</p>
        <div className={`status-badge ${currentStatus}`}>
          {currentStatus === 'completed'
            ? 'Completed'
            : currentStatus === 'in-progress'
              ? 'In progress'
              : 'Not started'}
        </div>
      </section>

      <section className="action-row">
        <button
          className={`button${currentStatus === 'completed' ? ' status-completed' : ' subtle'}`}
          onClick={() => setStatus(item.id, 'completed')}
          type="button"
        >
          <CheckCircle2 size={16} />
          {currentStatus === 'completed' ? 'Completed' : 'Mark complete'}
        </button>
        <button
          className={`button${currentStatus === 'in-progress' ? ' status-in-progress' : ' subtle'}`}
          onClick={() => setStatus(item.id, 'in-progress')}
          type="button"
        >
          <CircleDashed size={16} />
          In progress
        </button>
        <button
          className={`button${isBookmarked ? ' bookmarked' : ' subtle'}`}
          onClick={() => toggleBookmark(item.id)}
          type="button"
        >
          <Bookmark size={16} />
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
        <button className="button subtle" onClick={() => onOpenPath(item.relativePath, 'file')} type="button">
          <FileText size={16} />
          Open asset
        </button>
        <button className="button subtle" onClick={() => onOpenPath(item.relativePath, 'folder')} type="button">
          <FolderOpen size={16} />
          Open folder
        </button>
        <button className="button subtle" onClick={() => onOpenPath(item.relativePath, 'editor')} type="button">
          Open in editor
        </button>
      </section>

      <section className="card viewer-card">{children}</section>

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
