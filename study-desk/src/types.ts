export type LessonType = 'video' | 'pdf' | 'image'
export type StudyStatus = 'not-started' | 'in-progress' | 'completed'

export interface LessonItem {
  id: string
  kind: 'lesson'
  lessonType: LessonType
  weekNumber: number
  weekLabel: string
  title: string
  relativePath: string
  sourceFolder: string
  partLabel?: string
  extension: string
  order: number
}

export interface FilePreview {
  path: string
  language: string
  excerpt: string
}

export interface AssignmentItem {
  id: string
  kind: 'assignment'
  weekNumber: number
  weekLabel: string
  title: string
  relativePath: string
  order: number
  difficulty?: string
  summary?: string
  readme?: string
  prompt?: string
  previewFiles: FilePreview[]
  starterFiles: string[]
  testFiles: string[]
  solutionFiles: string[]
  hasReadme: boolean
  hasTests: boolean
  hasSolution: boolean
  childFolders: string[]
}

export type StudyItem = LessonItem | AssignmentItem

export interface WeekEntry {
  id: string
  weekNumber: number
  weekLabel: string
  title: string
  lectureFolders: string[]
  assignmentFolders: string[]
  lessons: LessonItem[]
  assignments: AssignmentItem[]
}

export interface CourseIndex {
  courseTitle: string
  courseRoot: string
  dataRoot: string
  generatedAt: string
  stats: {
    weeks: number
    lessons: number
    assignments: number
    videos: number
    pdfs: number
    images: number
  }
  weeks: WeekEntry[]
}

export interface ItemState {
  status: StudyStatus
  bookmarked?: boolean
  playbackPosition?: number
  duration?: number
  updatedAt: string
}

export interface NoteEntry {
  body: string
  updatedAt: string
}

export interface RecentEntry {
  itemId: string
  viewedAt: string
}

export interface UserState {
  lastActiveItemId?: string
  playbackSpeed?: number
  theme?: 'light' | 'dark'
  itemStates: Record<string, ItemState>
  notes: Record<string, NoteEntry>
  recent: RecentEntry[]
  updatedAt: string
}

export interface BootstrapPayload {
  index: CourseIndex
  state: UserState
}

export interface SearchResult {
  id: string
  title: string
  subtitle: string
  to: string
}
