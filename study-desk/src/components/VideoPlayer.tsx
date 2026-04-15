import { useRef, useEffect, useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]

interface VideoPlayerProps {
  src: string
  savedPosition?: number
  playbackSpeed: number
  onProgress: (position: number, duration: number) => void
  onEnded: () => void
  onSpeedChange: (speed: number) => void
}

export function VideoPlayer({
  src,
  savedPosition,
  playbackSpeed,
  onProgress,
  onEnded,
  onSpeedChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastSaveRef = useRef(0)
  const positionRestored = useRef(false)
  const [toast, setToast] = useState(false)
  const [speedOpen, setSpeedOpen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    positionRestored.current = false

    function handleLoaded() {
      if (!video) return
      if (savedPosition && savedPosition > 2 && savedPosition < video.duration - 2) {
        video.currentTime = savedPosition
      }
      video.playbackRate = playbackSpeed
      positionRestored.current = true
    }

    if (video.readyState >= 1) {
      handleLoaded()
    } else {
      video.addEventListener('loadedmetadata', handleLoaded, { once: true })
    }
    return () => video.removeEventListener('loadedmetadata', handleLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    if (videoRef.current && positionRestored.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video || !positionRestored.current) return
    const now = Date.now()
    if (now - lastSaveRef.current < 5000) return
    lastSaveRef.current = now
    onProgress(video.currentTime, video.duration)
  }, [onProgress])

  const handlePause = useCallback(() => {
    const video = videoRef.current
    if (video && positionRestored.current) {
      onProgress(video.currentTime, video.duration)
    }
  }, [onProgress])

  const handleEnded = useCallback(() => {
    const video = videoRef.current
    if (video) onProgress(video.duration, video.duration)
    onEnded()
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }, [onEnded, onProgress])

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        className="media"
        controls
        preload="metadata"
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
        onEnded={handleEnded}
      />
      <div className="video-controls">
        <div className="speed-popover-wrap">
          <button
            className="speed-trigger"
            onClick={() => setSpeedOpen((v) => !v)}
            type="button"
            title="Playback speed"
          >
            {playbackSpeed}x
            <ChevronDown size={12} />
          </button>
          {speedOpen && (
            <div className="speed-popover" onMouseLeave={() => setSpeedOpen(false)}>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  className={`speed-option${playbackSpeed === s ? ' active' : ''}`}
                  onClick={() => {
                    onSpeedChange(s)
                    setSpeedOpen(false)
                  }}
                  type="button"
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {toast && <div className="video-toast">Lesson complete</div>}
    </div>
  )
}
