import { useEffect } from 'react'
import type { LessonItem, StudyItem, StudyStatus, UserState } from '../types'
import { mediaUrl } from '../api'
import { VideoPlayer } from './VideoPlayer'
import { ItemLayout } from './ItemLayout'

interface LessonViewProps {
  lesson?: LessonItem
  items: StudyItem[]
  userState: UserState
  onVisit: (item: StudyItem) => void
  onEngage: (itemId: string) => void
  setStatus: (itemId: string, status: StudyStatus) => void
  toggleBookmark: (itemId: string) => void
  onOpenPath: (relativePath: string, action: 'folder' | 'file' | 'editor') => Promise<void>
  onVideoProgress: (itemId: string, position: number, duration: number) => void
  onSpeedChange: (speed: number) => void
}

export function LessonView(props: LessonViewProps) {
  const { lesson, items, userState, onVisit, onEngage, onVideoProgress, onSpeedChange, setStatus } = props

  useEffect(() => {
    if (lesson) onVisit(lesson)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id])

  useEffect(() => {
    if (!lesson) return
    const timeout = window.setTimeout(() => onEngage(lesson.id), 5000)
    return () => window.clearTimeout(timeout)
  }, [lesson, onEngage])

  if (!lesson) {
    return (
      <div className="centered-state">
        <div className="card state-card">
          <h2>Lesson missing</h2>
          <p>This lesson is not present in the current index.</p>
        </div>
      </div>
    )
  }

  return (
    <ItemLayout
      item={lesson}
      items={items}
      userState={userState}
      setStatus={setStatus}
      toggleBookmark={props.toggleBookmark}
      onOpenPath={props.onOpenPath}
    >
      {lesson.lessonType === 'video' && (
        <VideoPlayer
          key={lesson.id}
          src={mediaUrl(lesson.relativePath)}
          savedPosition={userState.itemStates[lesson.id]?.playbackPosition}
          playbackSpeed={userState.playbackSpeed ?? 1}
          onProgress={(pos, dur) => onVideoProgress(lesson.id, pos, dur)}
          onEnded={() => setStatus(lesson.id, 'completed')}
          onSpeedChange={onSpeedChange}
        />
      )}
      {lesson.lessonType === 'pdf' && (
        <iframe className="media pdf" src={mediaUrl(lesson.relativePath)} title={lesson.title} />
      )}
      {lesson.lessonType === 'image' && (
        <img alt={lesson.title} className="media image" src={mediaUrl(lesson.relativePath)} />
      )}
    </ItemLayout>
  )
}
