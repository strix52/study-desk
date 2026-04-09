interface ProgressBarProps {
  value: number
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div className={`progress-bar${className ? ` ${className}` : ''}`}>
      <div
        className={`progress-bar-fill${clamped >= 1 ? ' complete' : ''}`}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  )
}
