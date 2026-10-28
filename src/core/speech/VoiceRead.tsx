import { useState, useEffect, useRef, useCallback } from 'react'
import { Icon } from '../../components/Icon'
import { useMotionAllowed } from '../atmosphere/useMotionAllowed'

export interface VoiceReadParagraph {
  sectionId: string
  paragraphIndex: number
  text: string
}

export interface VoiceReadProps {
  paragraphs: VoiceReadParagraph[]
  onHighlightParagraph?: (paragraph: VoiceReadParagraph | null) => void
}

export const SPEECH_RATES = [0.75, 1.0, 1.25, 1.5] as const

export function isSpeechSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.speechSynthesis !== 'undefined' &&
    window.speechSynthesis !== null &&
    typeof window.SpeechSynthesisUtterance !== 'undefined'
  )
}

export function VoiceRead({ paragraphs, onHighlightParagraph }: VoiceReadProps) {
  const supported = isSpeechSupported()
  const motionAllowed = useMotionAllowed()

  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rate, setRate] = useState<number>(1.0)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('')

  const currentIndexRef = useRef(currentIndex)
  currentIndexRef.current = currentIndex

  const isPlayingRef = useRef(isPlaying)
  isPlayingRef.current = isPlaying

  // Populate available browser speech voices
  useEffect(() => {
    if (!supported || !window.speechSynthesis) return

    const loadVoices = () => {
      if (!window.speechSynthesis?.getVoices) return
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
      if (available.length > 0 && !selectedVoiceName) {
        // Prefer default English or system default
        const defaultVoice = available.find((v) => v.default || v.lang.startsWith('en')) || available[0]
        setSelectedVoiceName(defaultVoice.name)
      }
    }

    loadVoices()
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [supported, selectedVoiceName])

  // Stop and cancel speech on unmount or when paragraph queue / lesson changes
  const handleStop = useCallback(() => {
    if (supported && window.speechSynthesis?.cancel) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentIndex(0)
    onHighlightParagraph?.(null)
  }, [supported, onHighlightParagraph])

  useEffect(() => {
    return () => {
      if (supported && window.speechSynthesis?.cancel) {
        window.speechSynthesis.cancel()
      }
      onHighlightParagraph?.(null)
    }
  }, [supported, paragraphs, onHighlightParagraph])

  const speakParagraphAtIndex = useCallback(
    (index: number) => {
      if (!supported || index >= paragraphs.length) {
        handleStop()
        return
      }

      window.speechSynthesis.cancel()
      const item = paragraphs[index]
      setCurrentIndex(index)
      onHighlightParagraph?.(item)

      const utterance = new SpeechSynthesisUtterance(item.text)
      utterance.rate = rate

      if (selectedVoiceName && voices.length > 0) {
        const found = voices.find((v) => v.name === selectedVoiceName)
        if (found) utterance.voice = found
      }

      utterance.onend = () => {
        if (!isPlayingRef.current) return
        if (index + 1 < paragraphs.length) {
          speakParagraphAtIndex(index + 1)
        } else {
          handleStop()
        }
      }

      utterance.onerror = (e) => {
        // If canceled explicitly, error name is 'canceled' / 'interrupted'
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('[VoiceRead] Speech error:', e.error)
        }
        handleStop()
      }

      window.speechSynthesis.speak(utterance)
    },
    [supported, paragraphs, rate, selectedVoiceName, voices, handleStop, onHighlightParagraph]
  )

  const handlePlay = () => {
    if (!supported || paragraphs.length === 0) return

    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    setIsPlaying(true)
    setIsPaused(false)
    speakParagraphAtIndex(currentIndex)
  }

  const handlePause = () => {
    if (!supported) return
    window.speechSynthesis.pause()
    setIsPaused(true)
  }

  if (!supported) {
    return (
      <div
        className="voice-read-bar voice-read-bar--unsupported"
        role="note"
        aria-label="Voice read status"
        style={{
          padding: '8px 12px',
          background: 'var(--card-bg, #191B25)',
          borderRadius: 'var(--radius, 8px)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--muted)',
          fontSize: '13px',
          marginTop: '8px',
        }}
      >
        <Icon name="info" size={16} />
        <span>Voice read-aloud is not supported in this browser.</span>
      </div>
    )
  }

  return (
    <div
      className="voice-read-bar"
      role="region"
      aria-label="Voice read-aloud controls"
      data-motion-allowed={motionAllowed ? 'true' : 'false'}
      style={{
        position: 'sticky',
        top: '64px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(25, 27, 37, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--radius, 8px)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        margin: '12px 0 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Icon name="volume-2" size={18} />
        <span style={{ fontWeight: 600, fontSize: '13px' }}>Voice Read</span>
        {isPlaying && (
          <span className="small muted" style={{ marginLeft: '4px' }}>
            Paragraph {currentIndex + 1} of {paragraphs.length}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {/* Play / Pause / Stop buttons */}
        {!isPlaying || isPaused ? (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handlePlay}
            aria-label={isPaused ? 'Resume reading' : 'Start reading aloud'}
          >
            <Icon name="play" size={14} />
            <span>{isPaused ? 'Resume' : 'Play'}</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={handlePause}
            aria-label="Pause reading"
          >
            <Icon name="pause" size={14} />
            <span>Pause</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={handleStop}
          disabled={!isPlaying && !isPaused && currentIndex === 0}
          aria-label="Stop reading"
        >
          <Icon name="x" size={14} />
          <span>Stop</span>
        </button>

        {/* Speed selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <label htmlFor="voice-speed-select" className="sr-only">
            Reading speed
          </label>
          <select
            id="voice-speed-select"
            className="select"
            style={{ minHeight: '32px', height: '32px', padding: '0 8px', fontSize: '12px' }}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            aria-label="Reading speed"
          >
            {SPEECH_RATES.map((r) => (
              <option key={r} value={r}>
                {r}×
              </option>
            ))}
          </select>
        </div>

        {/* Voice selector */}
        {voices.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <label htmlFor="voice-name-select" className="sr-only">
              Voice
            </label>
            <select
              id="voice-name-select"
              className="select"
              style={{
                minHeight: '32px',
                height: '32px',
                maxWidth: '160px',
                padding: '0 8px',
                fontSize: '12px',
                textOverflow: 'ellipsis',
              }}
              value={selectedVoiceName}
              onChange={(e) => setSelectedVoiceName(e.target.value)}
              aria-label="Voice select"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
