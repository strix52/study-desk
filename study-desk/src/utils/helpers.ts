import type {
  CourseIndex,
  RecentEntry,
  SearchResult,
  StudyItem,
  StudyStatus,
  UserState,
  WeekEntry,
} from '../types'

export function orderedItems(index: CourseIndex): StudyItem[] {
  return index.weeks.flatMap((week) =>
    [...week.lessons, ...week.assignments].sort((a, b) => a.order - b.order),
  )
}

export function href(item: StudyItem): string {
  return item.kind === 'lesson' ? `/lesson/${item.id}` : `/assignment/${item.id}`
}

export function description(item: StudyItem): string {
  if (item.kind === 'lesson') {
    if (item.lessonType === 'video') return item.sourceFolder
    if (item.lessonType === 'pdf') return `PDF · ${item.sourceFolder}`
    return `Image · ${item.sourceFolder}`
  }
  const parts: string[] = []
  if (item.summary) parts.push(item.summary)
  else if (item.prompt) parts.push(item.prompt)
  else parts.push('Assignment from the local folder tree')
  if (item.difficulty) parts.push(`Difficulty: ${item.difficulty}`)
  if (item.hasTests) parts.push('Tests included')
  if (item.hasSolution) parts.push('Solution available')
  return parts.join(' · ')
}

export function normalizeState(state: UserState): UserState {
  return {
    itemStates: state.itemStates ?? {},
    notes: state.notes ?? {},
    recent: state.recent ?? [],
    lastActiveItemId: state.lastActiveItemId,
    playbackSpeed: state.playbackSpeed ?? 1,
    theme: state.theme ?? 'light',
    updatedAt: state.updatedAt ?? new Date().toISOString(),
  }
}

export function weekProgress(week: WeekEntry, userState: UserState) {
  const items = [...week.lessons, ...week.assignments]
  const completed = items.filter((i) => userState.itemStates[i.id]?.status === 'completed').length
  const inProgress = items.filter((i) => userState.itemStates[i.id]?.status === 'in-progress').length
  const total = items.length
  const fraction = total > 0 ? completed / total : 0
  const status: StudyStatus =
    completed === total && total > 0
      ? 'completed'
      : inProgress > 0 || completed > 0
        ? 'in-progress'
        : 'not-started'
  return { completed, inProgress, total, fraction, status }
}

export function courseProgress(index: CourseIndex, userState: UserState) {
  const items = orderedItems(index)
  const completed = items.filter((i) => userState.itemStates[i.id]?.status === 'completed').length
  const inProgress = items.filter((i) => userState.itemStates[i.id]?.status === 'in-progress').length
  const total = items.length
  const fraction = total > 0 ? completed / total : 0
  return { completed, inProgress, total, fraction }
}

export function recentTrail(recent: RecentEntry[], itemId: string): RecentEntry[] {
  return [
    { itemId, viewedAt: new Date().toISOString() },
    ...recent.filter((entry) => entry.itemId !== itemId),
  ].slice(0, 20)
}

export function nextQueue(items: StudyItem[], userState: UserState): StudyItem[] {
  const pivot = userState.lastActiveItemId
    ? items.findIndex((i) => i.id === userState.lastActiveItemId)
    : -1
  const rotated = pivot >= 0 ? [...items.slice(pivot + 1), ...items.slice(0, pivot + 1)] : items
  return rotated.filter((i) => userState.itemStates[i.id]?.status !== 'completed').slice(0, 6)
}

export function searchResults(index: CourseIndex, userState: UserState, query: string): SearchResult[] {
  const records: SearchResult[] = index.weeks.flatMap((week) => [
    {
      id: week.id,
      title: `${week.weekLabel} · ${week.title}`,
      subtitle: `${week.lessons.length} lessons · ${week.assignments.length} assignments`,
      to: `/week/${week.weekNumber}`,
    },
    ...[...week.lessons, ...week.assignments].map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: `${week.weekLabel} · ${item.kind === 'lesson' ? item.lessonType : 'assignment'}`,
      to: href(item),
    })),
  ])
  if (!query.trim()) {
    const items = orderedItems(index)
    const recentResults = userState.recent
      .map((entry) => items.find((item) => item.id === entry.itemId))
      .filter((item): item is StudyItem => Boolean(item))
      .slice(0, 6)
      .map((item) => ({
        id: `recent-${item.id}`,
        title: item.title,
        subtitle: `Recent · ${item.weekLabel} · ${item.kind === 'lesson' ? item.lessonType : 'assignment'}`,
        to: href(item),
      }))
    const recentIds = new Set(recentResults.map((result) => result.to))
    const queueResults = nextQueue(items, userState)
      .filter((item) => !recentIds.has(href(item)))
      .slice(0, 8)
      .map((item) => ({
        id: `next-${item.id}`,
        title: item.title,
        subtitle: `Next up · ${item.weekLabel} · ${item.kind === 'lesson' ? item.lessonType : 'assignment'}`,
        to: href(item),
      }))
    const suggested = [...recentResults, ...queueResults].slice(0, 14)
    return suggested.length > 0 ? suggested : records.slice(0, 12)
  }
  return records.filter((r) =>
    `${r.title} ${r.subtitle}`.toLowerCase().includes(query.trim().toLowerCase()),
  )
}

export function remainingVideoTime(items: StudyItem[], userState: UserState) {
  let totalSeconds = 0
  let remainingCount = 0

  for (const item of items) {
    if (item.kind !== 'lesson' || item.lessonType !== 'video') continue
    const state = userState.itemStates[item.id]
    const duration = state?.duration ?? 0
    if (!duration || duration <= 0) continue
    if (state?.status === 'completed') continue
    remainingCount += 1
    totalSeconds += Math.max(0, duration - (state?.playbackPosition ?? 0))
  }

  return { totalSeconds, remainingCount }
}
