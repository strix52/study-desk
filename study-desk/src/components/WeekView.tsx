import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { CourseIndex, StudyItem, UserState } from '../types'
import { weekProgress, href, description } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'
import { StatusBadge } from './StatusBadge'

interface WeekViewProps {
  index: CourseIndex
  userState: UserState
  onOpen: (item: StudyItem) => void
}

export function WeekView({ index, userState, onOpen }: WeekViewProps) {
  const weekNumber = Number.parseInt(useParams().weekNumber ?? '', 10)
  const week = index.weeks.find((w) => w.weekNumber === weekNumber)
  const [incompleteOnly, setIncompleteOnly] = useState(false)

  if (!week) {
    return (
      <div className="centered-state">
        <div className="card state-card">
          <h2>Week not found</h2>
          <p>The selected week is missing from the current index.</p>
        </div>
      </div>
    )
  }

  const items = [...week.lessons, ...week.assignments].sort((a, b) => a.order - b.order)
  const progress = weekProgress(week, userState)

  type Section =
    | { type: 'header'; label: string; key: string }
    | { type: 'item'; item: StudyItem; num: number; key: string }

  const visibleItems = incompleteOnly
    ? items.filter((item) => userState.itemStates[item.id]?.status !== 'completed')
    : items
  const sections: Section[] = []
  let currentPart: string | undefined
  let assignmentHeaderShown = false
  let itemNum = 0

  for (const item of visibleItems) {
    if (item.kind === 'lesson' && item.partLabel && item.partLabel !== currentPart) {
      currentPart = item.partLabel
      sections.push({ type: 'header', label: item.partLabel, key: `header-${item.partLabel}` })
    }
    if (item.kind === 'assignment' && !assignmentHeaderShown) {
      assignmentHeaderShown = true
      sections.push({ type: 'header', label: 'Assignments', key: 'header-assignments' })
    }
    itemNum++
    sections.push({ type: 'item', item, num: itemNum, key: item.id })
  }

  return (
    <div className="page page-enter">
      <section className="card page-card">
        <div className="section-row">
          <div>
            <span className="eyebrow">{week.weekLabel}</span>
            <h2>{week.title}</h2>
          </div>
          <button
            className={`button subtle${incompleteOnly ? ' status-in-progress' : ''}`}
            onClick={() => setIncompleteOnly((value) => !value)}
            type="button"
          >
            {incompleteOnly ? 'Show all' : 'Incomplete only'}
          </button>
        </div>
        <ProgressBar value={progress.fraction} />
        <p>
          {progress.completed}/{progress.total} complete across lectures and assignments
        </p>
      </section>

      {sections.length === 0 && (
        <section className="card page-card">
          <p>Everything in this week is complete.</p>
        </section>
      )}

      {sections.map((section) => {
        if (section.type === 'header') {
          return (
            <div className="part-divider" key={section.key}>
              <span>{section.label}</span>
            </div>
          )
        }

        const { item, num } = section
        const itemState = userState.itemStates[item.id]
        const status = itemState?.status ?? 'not-started'
        const videoFraction =
          item.kind === 'lesson' &&
          item.lessonType === 'video' &&
          itemState?.duration &&
          itemState.duration > 0
            ? (itemState.playbackPosition ?? 0) / itemState.duration
            : 0

        return (
          <article className={`card timeline-card ${status}`} key={section.key}>
            <div className="timeline-index">{String(num).padStart(2, '0')}</div>
            <div className="timeline-copy">
              <div className="section-row">
                <span className="item-chip">
                  {item.kind === 'lesson' ? item.lessonType : 'assignment'}
                </span>
                <StatusBadge status={status} />
              </div>
              <h3>{item.title}</h3>
              <p className="timeline-desc">{description(item)}</p>
              {videoFraction > 0 && videoFraction < 1 && (
                <ProgressBar value={videoFraction} className="timeline-progress" />
              )}
              <Link className="button subtle" onClick={() => onOpen(item)} to={href(item)}>
                Open
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
