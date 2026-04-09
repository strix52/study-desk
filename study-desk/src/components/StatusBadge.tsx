import { CheckCircle2, Circle, CircleDashed } from 'lucide-react'
import type { StudyStatus } from '../types'

export function StatusBadge({ status, size = 15 }: { status: StudyStatus; size?: number }) {
  if (status === 'completed') return <CheckCircle2 size={size} className="status-icon completed" />
  if (status === 'in-progress') return <CircleDashed size={size} className="status-icon in-progress" />
  return <Circle size={size} className="status-icon" />
}
