import { Link } from 'react-router-dom'
import type { CourseIndex, StudyItem, UserState } from '../types'
import { courseProgress, weekProgress, href } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'

interface DashboardProps {
  index: CourseIndex
  userState: UserState
  lastActive?: StudyItem
  continueQueue: StudyItem[]
  remainingVideoSeconds: number
  remainingVideoCount: number
}

function formatHours(totalSeconds: number) {
  const hours = totalSeconds / 3600
  return hours >= 10 ? `${hours.toFixed(1)}h` : `${hours.toFixed(2)}h`
}

export function Dashboard({
  index,
  userState,
  lastActive,
  continueQueue,
  remainingVideoSeconds,
  remainingVideoCount,
}: DashboardProps) {
  const overall = courseProgress(index, userState)

  return (
    <div className="page page-enter">
      {lastActive ? (
        <section className="resume-strip">
          <span className="resume-label">Resume where you left off</span>
          <Link className="resume-link" to={href(lastActive)}>
            {lastActive.title} →
          </Link>
          <span className="resume-progress">
            {overall.completed}/{overall.total} · {Math.round(overall.fraction * 100)}%
          </span>
        </section>
      ) : (
        <section className="resume-strip">
          <span className="resume-label">Pick a week to start</span>
          <span className="resume-progress">
            {overall.completed}/{overall.total} · {Math.round(overall.fraction * 100)}%
          </span>
        </section>
      )}

      {continueQueue.length > 0 && (
        <section className="card continue-card">
          <div className="section-row">
            <strong>Continue queue</strong>
            <small>
              {formatHours(remainingVideoSeconds)} remaining · {remainingVideoCount} unfinished videos
            </small>
          </div>
          <div className="continue-list">
            {continueQueue.map((item, index) => (
              <Link className="continue-link" key={item.id} to={href(item)}>
                <span className="continue-index">#{index + 1}</span>
                <span className="continue-copy">
                  <strong>{item.title}</strong>
                  <small>
                    {item.weekLabel} · {item.kind === 'lesson' ? item.lessonType : 'assignment'}
                  </small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="week-grid">
        {index.weeks.map((week) => {
          const progress = weekProgress(week, userState)
          return (
            <article className="card week-card" key={week.id}>
              <span className="eyebrow">{week.weekLabel}</span>
              <h3>{week.title}</h3>
              <ProgressBar value={progress.fraction} />
              <p>
                {week.lessons.length} lessons &middot; {week.assignments.length} assignments
              </p>
              <div className="week-card-footer">
                <span>
                  {progress.completed}/{progress.total} complete
                </span>
                <Link className="button subtle" to={`/week/${week.weekNumber}`}>
                  Open week
                </Link>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}
