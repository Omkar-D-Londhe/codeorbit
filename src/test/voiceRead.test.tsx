import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VoiceRead, type VoiceReadParagraph } from '../core/speech/VoiceRead'

describe('Stage 18a - VoiceRead Component', () => {
  const sampleParagraphs: VoiceReadParagraph[] = [
    { sectionId: 'intro', paragraphIndex: 0, text: 'Welcome to HTML foundations.' },
    { sectionId: 'intro', paragraphIndex: 1, text: 'Every HTML document requires a doctype.' },
  ]

  let originalSpeechSynthesis: typeof window.speechSynthesis
  let originalUtterance: typeof window.SpeechSynthesisUtterance

  let mockSpeechSynthesis: {
    speak: ReturnType<typeof vi.fn>
    cancel: ReturnType<typeof vi.fn>
    pause: ReturnType<typeof vi.fn>
    resume: ReturnType<typeof vi.fn>
    getVoices: ReturnType<typeof vi.fn>
    onvoiceschanged: (() => void) | null
  }

  class MockSpeechSynthesisUtterance {
    text: string
    rate = 1.0
    voice: SpeechSynthesisVoice | null = null
    onend: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(text: string) {
      this.text = text
    }
  }

  beforeEach(() => {
    originalSpeechSynthesis = window.speechSynthesis
    originalUtterance = window.SpeechSynthesisUtterance

    mockSpeechSynthesis = {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([
        { name: 'Alex', lang: 'en-US', default: true },
        { name: 'Victoria', lang: 'en-GB', default: false },
      ]),
      onvoiceschanged: null,
    }

    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    })

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: MockSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: originalUtterance,
      writable: true,
      configurable: true,
    })
    vi.restoreAllMocks()
  })

  it('renders fallback notice when Web Speech API is unsupported', () => {
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    render(<VoiceRead paragraphs={sampleParagraphs} />)
    expect(screen.getByText('Voice read-aloud is not supported in this browser.')).toBeInTheDocument()
  })

  it('renders play, stop, speed and voice controls when supported', () => {
    render(<VoiceRead paragraphs={sampleParagraphs} />)

    expect(screen.getByRole('button', { name: 'Start reading aloud' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Stop reading' })).toBeDisabled()
    expect(screen.getByLabelText('Reading speed')).toBeInTheDocument()
    expect(screen.getByLabelText('Voice')).toBeInTheDocument()
  })

  it('handles play, pause, resume, and stop sequence', () => {
    const onHighlight = vi.fn()
    render(<VoiceRead paragraphs={sampleParagraphs} onHighlightParagraph={onHighlight} />)

    // 1. Play
    const playBtn = screen.getByRole('button', { name: 'Start reading aloud' })
    fireEvent.click(playBtn)

    expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1)
    expect(onHighlight).toHaveBeenCalledWith(sampleParagraphs[0])
    expect(screen.getByText('Paragraph 1 of 2')).toBeInTheDocument()

    // 2. Pause
    const pauseBtn = screen.getByRole('button', { name: 'Pause reading' })
    fireEvent.click(pauseBtn)
    expect(mockSpeechSynthesis.pause).toHaveBeenCalledTimes(1)

    // 3. Resume
    const resumeBtn = screen.getByRole('button', { name: 'Resume reading' })
    fireEvent.click(resumeBtn)
    expect(mockSpeechSynthesis.resume).toHaveBeenCalledTimes(1)

    // 4. Stop
    const stopBtn = screen.getByRole('button', { name: 'Stop reading' })
    fireEvent.click(stopBtn)
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    expect(onHighlight).toHaveBeenLastCalledWith(null)
  })

  it('allows changing playback speed', () => {
    render(<VoiceRead paragraphs={sampleParagraphs} />)

    const speedSelect = screen.getByLabelText('Reading speed')
    fireEvent.change(speedSelect, { target: { value: '1.25' } })

    const playBtn = screen.getByRole('button', { name: 'Start reading aloud' })
    fireEvent.click(playBtn)

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled()
    const utterance = mockSpeechSynthesis.speak.mock.calls[0][0] as MockSpeechSynthesisUtterance
    expect(utterance.rate).toBe(1.25)
  })

  it('cancels speech and clears highlighting when unmounted', () => {
    const onHighlight = vi.fn()
    const { unmount } = render(
      <VoiceRead paragraphs={sampleParagraphs} onHighlightParagraph={onHighlight} />
    )

    unmount()
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    expect(onHighlight).toHaveBeenCalledWith(null)
  })
})
