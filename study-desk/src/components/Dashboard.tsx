import { Link } from 'react-router-dom'
import type { CourseIndex, StudyItem, UserState } from '../types'
import { courseProgress, orderedItems, weekProgress, href } from '../utils/helpers'
import { ProgressBar } from './ProgressBar'
import { Metric } from './Metric'

interface DashboardProps {
  index: CourseIndex
  userState: UserState
  lastActive?: StudyItem
}

export function Dashboard({ index, userState, lastActive }: DashboardProps) {
  const items = orderedItems(index)
  const overall = courseProgress(index, userState)
  const bookmarked = items.filter((i) => userState.itemStates[i.id]?.bookmarked).length

  return (
    <div className="page page-enter">
      <section className="card overview-card">
        <div>
          <span className="eyebrow">Study desk</span>
          <h2>Course overview</h2>
          <p>
            {overall.total} items across {index.stats.weeks} weeks &middot;{' '}
            {Math.round(overall.fraction * 100)}% complete
          </p>
          <ProgressBar value={overall.fraction} className="overview-progress" />
          {lastActive ? (
            <Link className="button primary" to={href(lastActive)}>
              Resume: {lastActive.title}
            </Link>
          ) : null}
        </div>
        <div className="overview-stats">
          <Metric label="Completed" value={overall.completed} />
          <Metric label="In progress" value={overall.inProgress} />
          <Metric label="Bookmarked" value={bookmarked} />
        </div>
      </section>

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
