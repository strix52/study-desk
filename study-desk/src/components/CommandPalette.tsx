import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'
import type { SearchResult } from '../types'

interface CommandPaletteProps {
  results: SearchResult[]
  query: string
  onQueryChange: (query: string) => void
  onSelect: (result: SearchResult) => void
  onClose: () => void
}

export function CommandPalette({ results, query, onQueryChange, onSelect, onClose }: CommandPaletteProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [trackedQuery, setTrackedQuery] = useState(query)
  const resultsRef = useRef<HTMLDivElement>(null)
  const visible = results.slice(0, 14)

  if (trackedQuery !== query) {
    setTrackedQuery(query)
    setActiveIndex(0)
  }

  useEffect(() => {
    const el = resultsRef.current?.children[activeIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, visible.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && visible[activeIndex]) {
      e.preventDefault()
      onSelect(visible[activeIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="palette-backdrop" onClick={onClose} role="presentation">
      <div
        className="palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-label="Search"
      >
        <div className="palette-input-row">
          <Search size={18} />
          <input
            autoFocus
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search weeks, lessons, PDFs, assignments..."
            value={query}
          />
        </div>
        <div className="palette-results" ref={resultsRef}>
          {visible.map((result, i) => (
            <button
              className={`palette-result${i === activeIndex ? ' active' : ''}`}
              key={result.id}
              onClick={() => onSelect(result)}
              onMouseEnter={() => setActiveIndex(i)}
              type="button"
            >
              <strong>{result.title}</strong>
              <small>{result.subtitle}</small>
            </button>
          ))}
          {visible.length === 0 && query.trim() && (
            <p className="muted palette-empty">No results for &ldquo;{query}&rdquo;</p>
          )}
        </div>
      </div>
    </div>
  )
}
