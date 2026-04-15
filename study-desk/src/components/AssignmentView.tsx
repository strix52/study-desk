import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { FileCode2, FileText } from 'lucide-react'
import type { AssignmentItem, StudyItem, StudyStatus, UserState } from '../types'
import { ItemLayout } from './ItemLayout'

interface AssignmentViewProps {
  items: StudyItem[]
  userState: UserState
  onVisit: (item: StudyItem) => void
  onEngage: (itemId: string) => void
  setStatus: (itemId: string, status: StudyStatus) => void
  toggleBookmark: (itemId: string) => void
  onOpenPath: (relativePath: string, action: 'folder' | 'file' | 'editor') => Promise<void>
}

export function AssignmentView(props: AssignmentViewProps) {
  const itemId = useParams().itemId
  const { items, onVisit, onEngage } = props
  const assignment = items.find(
    (item): item is AssignmentItem => item.id === itemId && item.kind === 'assignment',
  )

  useEffect(() => {
    if (assignment) onVisit(assignment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id])

  useEffect(() => {
    if (!assignment) return
    const timeout = window.setTimeout(() => onEngage(assignment.id), 5000)
    return () => window.clearTimeout(timeout)
  }, [assignment, onEngage])

  if (!assignment) {
    return (
      <div className="centered-state">
        <div className="card state-card">
          <h2>Assignment missing</h2>
          <p>This assignment is not present in the current index.</p>
        </div>
      </div>
    )
  }

  return (
    <ItemLayout
      item={assignment}
      items={items}
      userState={props.userState}
      setStatus={props.setStatus}
      toggleBookmark={props.toggleBookmark}
      onOpenPath={props.onOpenPath}
    >
      <div className="assignment-grid">
        <article className="card inner-card">
          <div className="section-row">
            <strong>Assignment brief</strong>
            <span className="item-chip">{assignment.difficulty ?? 'general'}</span>
          </div>
          <p>
            {assignment.summary ??
              assignment.prompt ??
              'No README summary or starter-file prompt was detected for this folder.'}
          </p>
          <div className="flag-row">
            <span className="item-chip">{assignment.hasReadme ? 'README' : 'No README'}</span>
            <span className="item-chip">{assignment.hasTests ? 'Tests' : 'No tests'}</span>
            <span className="item-chip">
              {assignment.hasSolution ? 'Solutions' : 'No solution'}
            </span>
          </div>
        </article>

        {assignment.readme && (
          <article className="card inner-card markdown-card">
            <div className="section-row">
              <strong>README preview</strong>
              <FileText size={15} />
            </div>
            <div className="markdown-body">
              <ReactMarkdown>{assignment.readme}</ReactMarkdown>
            </div>
          </article>
        )}

        {assignment.previewFiles.length > 0 && (
          <article className="card inner-card">
            <div className="section-row">
              <strong>Starter preview</strong>
              <FileCode2 size={15} />
            </div>
            {assignment.previewFiles.map((file) => (
              <div className="code-block" key={file.path}>
                <span>{file.path}</span>
                <pre>{file.excerpt}</pre>
              </div>
            ))}
          </article>
        )}
      </div>
    </ItemLayout>
  )
}
