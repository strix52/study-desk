import { Link } from 'react-router-dom'
import type { CourseIndex, StudyItem, UserState } from '../types'
import { courseProgress, weekProgress, href } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'

interface DashboardProps {
  index: CourseIndex
  userState: UserState
  lastActive?: StudyItem
}

export function Dashboard({ index, userState, lastActive }: DashboardProps) {
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
