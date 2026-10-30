import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChallenge } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { CodeBlock } from '../components/CodeBlock'
import { CodeEditor } from '../components/CodeEditor'
import { ConfirmDialog } from '../components/Dialog'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { SandboxedPreview } from '../components/SandboxedPreview'
import { useToast } from '../components/Toast'
import { useDocumentTitle, useMediaQuery } from '../lib/hooks'
import { lessonPath, trackPath } from '../lib/routes'
import { formatDateTime } from '../lib/status'
import { checkChallenge, type CheckResult } from '../lib/validators'
import { useApp } from '../state/AppState'
import { XpAward } from '../core/gamification/XpAward'
import { useClock } from '../core/time/Clock'
import { Splitter } from '../core/ui/Splitter'
import { AutoSaveIndicator } from '../core/editor/AutoSaveIndicator'
import { FullscreenEditor } from '../core/editor/FullscreenEditor'
import { toChallenge, toChallengeV2 } from '../core/content/challengeAdapter'
import type { ChallengeFile, ChallengeV2 } from '../core/content/types'
import { useTrack } from '../core/content/useTrack'
import { defaultTrackId } from '../core/content/registry'
import { ShareModal } from '../core/share/ShareModal'
import { draftKey } from '../state/reducer'
import { IframePreviewRunner } from '../core/runner/iframePreviewRunner'
import { DeviceFrame, type DeviceFrameMode } from '../core/ui/DeviceFrame'
import { DiffViewer } from '../core/learning/DiffViewer'
import { lintHtml, type A11yLintIssue } from '../tracks/html/a11yLint'
import { SnippetPanel } from '../core/learning/SnippetPanel'
import { HTML_SNIPPETS } from '../tracks/html/snippets'
import { isChallengeRecommended } from '../core/learning/difficulty'
import { Drawer } from '../core/ui/DockedPanel'
import type { EditorHandle, EditorDiagnostic } from '../core/editor/types'
import { FeedbackPanel } from '../core/learning/FeedbackPanel'
import { requirementsToDiagnostics } from '../core/learning/diagnostics'
import { useActiveTime } from '../core/insights/activeTime'
import { getProvider } from '../core/analysis/registry'
import { AnalysisPanel } from '../core/analysis/AnalysisPanel'
import { executePython, type PythonRunResult } from '../tracks/python/runner'
import {
  validateHtmlWithW3C,
  validateHtmlLocally,
  hasW3CConsent,
  setW3CConsent,
  W3CRateLimitError,
  type W3CValidationResult,
} from '../core/services/w3cValidator'
import {
  fetchAiHint,
  hasAiConsent,
  setAiConsent,
  type AiHintResult,
} from '../core/services/aiHints'
import {
  PeerRaceSession,
  type RaceStatus,
  type PeerProgress,
} from '../core/multiplayer/peerRace'
import { RaceHud } from '../core/multiplayer/RaceHud'
import { RaceLobbyModal } from '../core/multiplayer/RaceLobbyModal'
import { OptimisationPanel } from '../core/analysis/OptimisationPanel'
import { ComparisonView } from '../core/analysis/ComparisonView'
import { validateEstimate } from '../core/analysis/validate'
import type {
  ComplexityEstimate,
  OptimisationSuggestion,
  CorrectnessCheck,
  Comparison,
  SourceRange,
  AnalysisError,
} from '../core/analysis/types'
import NotFound from './NotFound'

const HINT_TITLES = ['Conceptual clue', 'Structural clue', 'Specific guidance']
type MobileTab = 'brief' | 'editor' | 'preview' | 'feedback' | 'analysis'

export default function Practice() {
  const { challengeId = '' } = useParams()
  const { state } = useApp()
  const customCh = state.custom?.challenges?.find((c) => c.id === challengeId)
  const ch = customCh ? toChallenge(customCh) : getChallenge(challengeId)
  if (!ch) return <NotFound />
  return <PracticeInner key={ch.id} challengeId={ch.id} isCustom={Boolean(customCh)} customV2={customCh} />
}

function PracticeInner({
  challengeId,
  isCustom,
  customV2,
}: {
  challengeId: string
  isCustom?: boolean
  customV2?: ChallengeV2
}) {
  const { state, dispatch, saveStatus } = useApp()
  const activeTrack = useTrack()
  const challenge = customV2 ? toChallenge(customV2) : getChallenge(challengeId)!
  const topic = getTopic(challenge.topicId)
  useActiveTime(topic?.id)
  useDocumentTitle(challenge.title)
  const now = useClock()
  const toast = useToast()
  const mobile = useMediaQuery('(max-width: 767px)')

  const chV2 = useMemo(() => customV2 ?? toChallengeV2(challenge), [customV2, challenge])
  const [extraFiles, setExtraFiles] = useState<ChallengeFile[]>([])
  const allFiles = useMemo(() => [...chV2.files, ...extraFiles], [chV2.files, extraFiles])
  const [activeFileName, setActiveFileName] = useState(
    () => chV2.files.find((f) => !f.readOnly)?.name ?? chV2.files[0]?.name ?? 'index.html'
  )
  const fileCount = allFiles.length

  const rec = state.challenges[challengeId]
  const currentKey = draftKey(challengeId, activeFileName, fileCount)
  const activeStarter = allFiles.find((f) => f.name === activeFileName)?.content ?? challenge.starterCode
  const code = state.drafts[currentKey] ?? (fileCount === 1 ? (state.drafts[challengeId] ?? challenge.starterCode) : activeStarter)

  const currentLanguage = activeTrack?.language?.id || activeTrack?.id || ''
  const isPythonTrack = activeTrack?.id === 'python'
  const isJavaOrCppTrack = activeTrack?.id === 'java' || activeTrack?.id === 'cpp'
  const hasComplexityCapability = Boolean(activeTrack?.capabilities?.includes('complexity'))
  const [pythonExecutionEnabled, setPythonExecutionEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('codeorbit:python:execution_enabled') === 'true'
    } catch {
      return false
    }
  })
  const [pythonDownloading, setPythonDownloading] = useState(false)
  const [pythonDownloadProgress, setPythonDownloadProgress] = useState(0)
  const [pythonInitError, setPythonInitError] = useState<string | null>(null)
  const [pythonRunResult, setPythonRunResult] = useState<PythonRunResult | null>(null)
  const [isRunningPython, setIsRunningPython] = useState(false)
  const [declinedNotice, setDeclinedNotice] = useState(false)
  const [compiledOutput, setCompiledOutput] = useState<{ stdout: string; stderr?: string; durationMs?: number } | null>(null)

  const showRun =
    (activeTrack?.capabilities.includes('preview') || activeTrack?.capabilities.includes('execution')) &&
    (!isPythonTrack || pythonExecutionEnabled)
  const analysisProvider = getProvider(currentLanguage)
  const providerAvailable = Boolean(analysisProvider)

  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisEstimate, setAnalysisEstimate] = useState<ComplexityEstimate | null>(null)
  const [analysisSuggestions, setAnalysisSuggestions] = useState<OptimisationSuggestion[]>([])
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null)
  const [analysisComparison, setAnalysisComparison] = useState<Comparison | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<Record<string, CorrectnessCheck>>({})
  const [isVerifying, setIsVerifying] = useState(false)

  const [ranCode, setRanCode] = useState<string | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [focus, setFocus] = useState(false)
  const [tab, setTab] = useState<MobileTab>('editor')
  const [confirm, setConfirm] = useState<null | 'reset' | 'solution' | 'w3c-consent' | 'ai-consent'>(null)
  const [w3cResult, setW3cResult] = useState<W3CValidationResult | null>(null)
  const [isValidatingW3C, setIsValidatingW3C] = useState(false)
  const [aiHintResult, setAiHintResult] = useState<AiHintResult | null>(null)
  const [isLoadingAiHint, setIsLoadingAiHint] = useState(false)
  const [raceSession] = useState(() => new PeerRaceSession())
  const [raceStatus, setRaceStatus] = useState<RaceStatus>('idle')
  const [raceOpponent, setRaceOpponent] = useState<PeerProgress | null>(null)
  const [raceLobbyOpen, setRaceLobbyOpen] = useState(false)

  useEffect(() => {
    const unsub1 = raceSession.onStatusChange(setRaceStatus)
    const unsub2 = raceSession.onProgressChange(setRaceOpponent)
    return () => {
      unsub1()
      unsub2()
      raceSession.close()
    }
  }, [raceSession])

  useEffect(() => {
    const handlePreviewMessage = (ev: MessageEvent) => {
      if (!ev.data || typeof ev.data !== 'object') return
      if (ev.data.type !== 'codeorbit:angular-preview') return
      // Validated preview message schema from sandboxed iframe
    }
    window.addEventListener('message', handlePreviewMessage)
    return () => window.removeEventListener('message', handlePreviewMessage)
  }, [])
  const [fullscreen, setFullscreen] = useState(false)
  useEffect(() => {
    document.documentElement.classList.toggle('is-fullscreen', fullscreen)
    return () => {
      document.documentElement.classList.remove('is-fullscreen')
    }
  }, [fullscreen])
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameMode>('desktop')
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [lintIssues, setLintIssues] = useState<A11yLintIssue[] | null>(null)
  const [diagnostics, setDiagnostics] = useState<EditorDiagnostic[]>([])
  const [awardedXp, setAwardedXp] = useState<number | null>(null)
  const [trackStylesheets, setTrackStylesheets] = useState<string[]>([])
  const [stylesheetError, setStylesheetError] = useState<string | null>(null)

  const loadStylesheets = useCallback(async () => {
    if (!activeTrack?.previewStylesheets || activeTrack.previewStylesheets.length === 0) {
      setTrackStylesheets([])
      setStylesheetError(null)
      return
    }
    try {
      const sheets = await Promise.all(activeTrack.previewStylesheets.map((fn) => fn()))
      setTrackStylesheets(sheets)
      setStylesheetError(null)
    } catch {
      setStylesheetError('Bootstrap styles could not be loaded')
    }
  }, [activeTrack])

  useEffect(() => {
    loadStylesheets()
  }, [loadStylesheets])

  const fullscreenOpenerRef = useRef<HTMLButtonElement>(null)
  const editorHandleRef = useRef<EditorHandle | null>(null)
  const isNarrowDesktop = useMediaQuery('(min-width: 768px) and (max-width: 899px)')

  const recResult = useMemo(() => isChallengeRecommended(challenge, state), [challenge, state])

  const [splitRatio, setSplitRatio] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('codeorbit:splitter:ratio')
      if (saved) {
        const parsed = parseFloat(saved)
        if (!isNaN(parsed) && parsed >= 25 && parsed <= 75) return parsed
      }
    } catch {
      // fallback
    }
    return 50
  })

  const handleSplitChange = useCallback((newRatio: number) => {
    setSplitRatio(newRatio)
    try {
      localStorage.setItem('codeorbit:splitter:ratio', String(newRatio))
    } catch {
      // ignore
    }
  }, [])

  const handleSplitReset = useCallback(() => {
    setSplitRatio(50)
    try {
      localStorage.setItem('codeorbit:splitter:ratio', '50')
    } catch {
      // ignore
    }
  }, [])

  const draftEdited = code !== activeStarter

  useEffect(() => { dispatch({ type: 'VISIT', topicId: challenge.topicId, activity: 'practice', challengeId, now: Date.now() }) }, [challenge.topicId, challengeId, dispatch])

  // Focus mode: hide navigation chrome via a root class. Esc leaves it. Draft lives in app state, so nothing is lost.
  useEffect(() => {
    document.documentElement.classList.toggle('is-focus', focus)
    if (!focus) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[role="dialog"]')) setFocus(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [focus])
  useEffect(() => () => document.documentElement.classList.remove('is-focus'), [])

  const setCode = useCallback(
    (v: string) => {
      dispatch({
        type: 'SET_DRAFT',
        challengeId,
        code: v,
        fileName: fileCount > 1 ? activeFileName : undefined,
      })
    },
    [dispatch, challengeId, fileCount, activeFileName]
  )

  const currentFiles: ChallengeFile[] = useMemo(() => {
    return allFiles.map((f) => {
      const k = draftKey(challengeId, f.name, fileCount)
      const val = state.drafts[k] ?? (fileCount === 1 ? (state.drafts[challengeId] ?? f.content) : f.content)
      return { ...f, content: val }
    })
  }, [allFiles, state.drafts, challengeId, fileCount])

  const handleHighlightRange = useCallback((range: SourceRange) => {
    const diag: EditorDiagnostic = {
      line: range.startLine,
      column: range.startCol,
      severity: 'warning',
      message: `Bottleneck (${range.file}:${range.startLine})`,
    }
    setDiagnostics([diag])
    editorHandleRef.current?.focus()
  }, [])

  const handleRunAnalysis = useCallback(async () => {
    if (!analysisProvider) return
    setAnalysisLoading(true)
    setAnalysisError(null)
    const abortController = new AbortController()
    try {
      const rawEstimate = await analysisProvider.analyze(
        {
          language: currentLanguage,
          files: currentFiles,
        },
        abortController.signal
      )
      const valResult = validateEstimate(
        rawEstimate,
        { language: currentLanguage, files: currentFiles },
        analysisProvider.maxConfidence
      )
      if (!valResult.ok) {
        setAnalysisError(valResult.error)
        setAnalysisEstimate(null)
      } else {
        setAnalysisEstimate(valResult.value)
        dispatch({
          type: 'RECORD_ANALYSIS',
          record: {
            id: `analysis-${Date.now()}`,
            at: Date.now(),
            language: currentLanguage,
            estimate: valResult.value,
          },
        })
        if (analysisProvider.suggest) {
          try {
            const suggs = await analysisProvider.suggest(
              { language: currentLanguage, files: currentFiles },
              valResult.value
            )
            setAnalysisSuggestions(suggs || [])
          } catch {
            setAnalysisSuggestions([])
          }
        }
      }
    } catch (err: unknown) {
      setAnalysisError({
        code: 'internal',
        message: err instanceof Error ? err.message : 'Analysis failed',
      })
      setAnalysisEstimate(null)
    } finally {
      setAnalysisLoading(false)
    }
  }, [analysisProvider, currentLanguage, currentFiles, dispatch])

  const handleApplySuggestion = useCallback(
    (sug: OptimisationSuggestion) => {
      const patchFile = sug.patch?.files?.[0]
      const ext = activeTrack?.language?.fileExtension || ''
      const optFileName = patchFile?.name || `solution-optimised${ext}`
      const optContent = patchFile?.content || code

      setExtraFiles((prev) => {
        const exists = prev.some((f) => f.name === optFileName)
        if (exists) return prev.map((f) => (f.name === optFileName ? { ...f, content: optContent } : f))
        return [...prev, { name: optFileName, language: currentLanguage, content: optContent }]
      })

      dispatch({
        type: 'SET_DRAFT',
        challengeId,
        code: optContent,
        fileName: optFileName,
      })
      setActiveFileName(optFileName)
      toast.show(`Applied suggestion as new draft "${optFileName}". Original code preserved.`)

      if (analysisEstimate && (sug.expected.time || sug.expected.auxiliarySpace)) {
        const check = verificationStatus[sug.id] || {
          passed: false,
          cases: [],
          coverageNote: 'Unverified suggestion (verification not run)',
        }
        const afterEstimate: ComplexityEstimate = {
          ...analysisEstimate,
          time: {
            worst: sug.expected.time || analysisEstimate.time.worst,
          },
          auxiliarySpace: sug.expected.auxiliarySpace || analysisEstimate.auxiliarySpace,
        }
        setAnalysisComparison({
          before: analysisEstimate,
          after: afterEstimate,
          correctness: check,
        })
      }
    },
    [activeTrack, code, currentLanguage, challengeId, dispatch, toast, analysisEstimate, verificationStatus]
  )

  const handleVerifySuggestion = useCallback(
    async (sug: OptimisationSuggestion) => {
      if (!analysisProvider?.verifyEquivalence) return
      setIsVerifying(true)
      try {
        const patchFile = sug.patch?.files?.[0]
        const optFiles = patchFile ? [patchFile] : currentFiles
        const res = await analysisProvider.verifyEquivalence(
          { language: currentLanguage, files: currentFiles },
          { language: currentLanguage, files: optFiles }
        )
        setVerificationStatus((prev) => ({ ...prev, [sug.id]: res }))
        toast.show(res.passed ? `Verification passed (${res.cases.length} cases)` : 'Verification failed')
      } catch {
        toast.show('Verification check failed', 'warning')
      } finally {
        setIsVerifying(false)
      }
    },
    [analysisProvider, currentLanguage, currentFiles, toast]
  )

  const enablePythonExecution = useCallback(async () => {
    setPythonDownloading(true)
    setPythonInitError(null)
    setPythonDownloadProgress(20)
    const timer = setInterval(() => {
      setPythonDownloadProgress((p) => (p < 80 ? p + 20 : p))
    }, 250)

    try {
      await executePython('# CodeOrbit Warmup\n', [], { timeoutMs: 20000 })
      clearInterval(timer)
      setPythonDownloadProgress(100)
      setPythonExecutionEnabled(true)
      try {
        localStorage.setItem('codeorbit:python:execution_enabled', 'true')
      } catch {
        // ignore storage errors
      }
      toast.show('Python WebAssembly runtime ready.')
    } catch (err) {
      clearInterval(timer)
      setPythonInitError(err instanceof Error ? err.message : 'Pyodide initialization failed. Please retry.')
    } finally {
      setPythonDownloading(false)
    }
  }, [toast])

  const run = async () => {
    if (isPythonTrack) {
      if (!pythonExecutionEnabled) return
      setIsRunningPython(true)
      try {
        const res = await executePython(code, challenge.tests || [], { timeoutMs: 3000 })
        setPythonRunResult(res)
      } finally {
        setIsRunningPython(false)
      }
      if (mobile) setTab('preview')
      return
    }
    if (isJavaOrCppTrack && activeTrack?.runner) {
      const res = await activeTrack.runner.run({ files: currentFiles })
      setCompiledOutput({
        stdout: res.status === 'ok' ? (res.stdout || '') : '',
        stderr: res.stderr || (res.status !== 'ok' ? res.message : undefined),
        durationMs: res.durationMs,
      })
      if (mobile) setTab('preview')
      return
    }
    const runner = activeTrack?.runner || new IframePreviewRunner()
    runner.run({ files: currentFiles }).then((res) => {
      if (res.status === 'ok' && res.previewDoc) {
        setRanCode(res.previewDoc)
      }
    })
    if (mobile) setTab('preview')
  }

  const check = () => {
    const htmlFile = currentFiles.find((f) => f.name.toLowerCase().endsWith('.html')) ?? currentFiles[0]
    const htmlCode = htmlFile ? htmlFile.content : code
    const cssFile = currentFiles.find((f) => f.name.toLowerCase().endsWith('.css'))
    const cssCode = cssFile ? cssFile.content : undefined
    const r = checkChallenge(challenge, htmlCode, cssCode)
    setResult(r)
    const diags = requirementsToDiagnostics(r.results)
    setDiagnostics(diags)
    if (isJavaOrCppTrack && activeTrack?.runner) {
      activeTrack.runner.run({ files: currentFiles }).then((res) => {
        setCompiledOutput({
          stdout: res.status === 'ok' ? (res.stdout || '') : '',
          stderr: res.stderr || (res.status !== 'ok' ? res.message : undefined),
          durationMs: res.durationMs,
        })
      })
    } else if (!isPythonTrack) {
      const runner = activeTrack?.runner || new IframePreviewRunner()
      runner.run({ files: currentFiles }).then((res) => {
        if (res.status === 'ok' && res.previewDoc) {
          setRanCode(res.previewDoc)
        }
      })
    } else if (pythonExecutionEnabled) {
      executePython(code, challenge.tests || [], { timeoutMs: 3000 }).then((res) => {
        setPythonRunResult(res)
      })
    }
    dispatch({
      type: 'RECORD_CHECK',
      challengeId,
      passed: r.passed,
      total: r.total,
      failedIds: r.results.filter((x) => x.status === 'fail').map((x) => x.id),
      now: now(),
    })
    if (raceStatus === 'racing') {
      raceSession.sendProgress(r.passed, r.total)
      if (r.allPassed) {
        raceSession.sendFinish(code, Date.now())
      }
    }
    if (r.allPassed) {
      toast.show(`All ${r.total} requirements met. Challenge complete.`)
      if (!rec?.completed) {
        const isIndependent = !rec?.solutionRevealed && (rec?.hintsRevealed ?? 0) === 0
        setAwardedXp(isIndependent ? 40 : 25)
      }
    }

    const issues = lintHtml(htmlCode)
    setLintIssues(issues)
    if (mobile) setTab('feedback')
  }

  const runLinter = () => {
    const htmlFile = currentFiles.find((f) => f.name.toLowerCase().endsWith('.html')) ?? currentFiles[0]
    const htmlCode = htmlFile ? htmlFile.content : code
    const issues = lintHtml(htmlCode)
    setLintIssues(issues)
    toast.show(
      issues.length === 0
        ? 'No accessibility issues found.'
        : `Found ${issues.length} accessibility quick-check ${issues.length === 1 ? 'issue' : 'issues'}.`,
      'info'
    )
  }

  const runW3CValidation = async (bypassConsentPrompt = false) => {
    if (!hasW3CConsent() && !bypassConsentPrompt) {
      setConfirm('w3c-consent')
      return
    }
    setIsValidatingW3C(true)
    try {
      const htmlFile = currentFiles.find((f) => f.name.toLowerCase().endsWith('.html')) ?? currentFiles[0]
      const htmlCode = htmlFile ? htmlFile.content : code
      const res = await validateHtmlWithW3C(htmlCode)
      setW3cResult(res)
      if (res.source === 'w3c-remote') {
        toast.show(
          res.isValid
            ? 'W3C Validator: Document conforms to HTML5 standard.'
            : `W3C Validator found ${res.messages.length} issue(s).`,
          res.isValid ? 'success' : 'warning'
        )
      } else {
        toast.show(
          `Local HTML checks applied (${res.error ? 'offline/network fallback' : 'fallback'}).`,
          'info'
        )
      }
    } catch (err) {
      if (err instanceof W3CRateLimitError) {
        toast.show(err.message, 'warning')
      } else {
        toast.show(`Validation error: ${err instanceof Error ? err.message : String(err)}`, 'warning')
      }
    } finally {
      setIsValidatingW3C(false)
    }
  }

  const requestAiHint = async (bypassConsentPrompt = false) => {
    if (!hasAiConsent() && !bypassConsentPrompt) {
      setConfirm('ai-consent')
      return
    }

    setIsLoadingAiHint(true)
    try {
      const failedReqs = result?.results.filter((r) => r.status === 'fail').map((r) => r.description) || []
      const res = await fetchAiHint({
        challengeId,
        title: challenge.title,
        prompt: challenge.prompt,
        code,
        failedRequirements: failedReqs,
        fallbackHints: challenge.hints,
      })
      setAiHintResult(res)
      dispatch({ type: 'REVEAL_HINT', challengeId, max: challenge.hints.length })
      toast.show('AI Coach provided a targeted hint.', 'info')
    } catch (err) {
      toast.show(`Could not retrieve AI hint: ${err instanceof Error ? err.message : String(err)}`, 'warning')
    } finally {
      setIsLoadingAiHint(false)
    }
  }

  const hint = () => dispatch({ type: 'REVEAL_HINT', challengeId, max: challenge.hints.length })
  const reset = () => {
    dispatch({ type: 'CLEAR_DRAFT', challengeId })
    setResult(null)
    setDiagnostics([])
    setConfirm(null)
    setLintIssues(null)
    toast.show('Editor reset to the starter code.', 'info')
  }
  const saveError = () => {
    if (!result) return
    const failed = result.results.filter((r) => r.status === 'fail')
    if (failed.length === 0) return
    dispatch({
      type: 'ADD_ERROR',
      entry: {
        id: `err-${Date.now()}-${challengeId}`, source: 'challenge', topicId: challenge.topicId, refId: challengeId, title: challenge.title,
        detail: `Not yet met: ${failed.map((f) => f.description).join('; ')}`, code, status: 'open', createdAt: Date.now(),
      },
    })
    toast.show('Added to your Error Notebook.')
  }
  const copySolution = async () => {
    try { await navigator.clipboard.writeText(challenge.solutionCode); toast.show('Reference solution copied. Your draft was not changed.') }
    catch { toast.show('Copying is not available in this browser.', 'warning') }
  }

  const hintsShown = rec?.hintsRevealed ?? 0
  const stale = ranCode !== null && ranCode !== code
  const status = (id: string): 'pass' | 'fail' | 'unchecked' => result?.results.find((r) => r.id === id)?.status ?? 'unchecked'

  const draftNote =
    saveStatus.kind === 'error' ? 'Draft not saved: browser storage unavailable.'
    : saveStatus.kind === 'saved' ? `Draft saved in this browser · ${formatDateTime(saveStatus.at)}`
    : 'Drafts are saved in this browser as you type.'

  const brief = (
    <div className="brief">
      <section className="brief__block">
        <h2 className="study__h">Challenge</h2>
        <p>{challenge.prompt}</p>
        <p className="muted small"><strong>Objective:</strong> {challenge.objective}</p>
        {challenge.notice && (
          <p className="notice" role="note" style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: '6px', fontSize: '13px' }}>
            <strong>Notice:</strong> {challenge.notice}
          </p>
        )}
        {topic && (
          <p className="muted small">
            <Link to={lessonPath(challenge.topicId)}>Review the “{topic.title}” lesson</Link>
          </p>
        )}
      </section>
      <section className="brief__block" aria-labelledby="req-h">
        <h2 className="study__h" id="req-h">Requirements</h2>
        <ul className="reqs">
          {challenge.requirements.map((r) => {
            const s = status(r.id)
            return (
              <li key={r.id} className={`req req--${s}`}>
                <Icon name={s === 'pass' ? 'check' : s === 'fail' ? 'x' : 'circle'} size={16} />
                <span>{r.description}</span>
                <span className="req__state">{s === 'pass' ? 'Met' : s === 'fail' ? 'Not met' : 'Not checked'}</span>
              </li>
            )
          })}
        </ul>
      </section>
      <section className="brief__block" aria-labelledby="hints-h">
        <h2 className="study__h" id="hints-h">Hints</h2>
        {hintsShown === 0 && <p className="muted small">Hints appear one at a time. None are shown until you ask.</p>}
        <ol className="hints">
          {challenge.hints.slice(0, hintsShown).map((h, i) => (
            <li key={i}><strong>Hint {i + 1} · {HINT_TITLES[i]}</strong><p>{h}</p></li>
          ))}
          {aiHintResult && (
            <li style={{ borderLeft: '3px solid var(--accent, #6366f1)', paddingLeft: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="chip chip--sm chip--accent"><Icon name="sparkles" size={12} /> AI Hint</span>
                <span className="muted small" style={{ fontSize: '11px' }}>{aiHintResult.source === 'ai-proxy' ? 'Proxied LLM' : 'Curriculum Fallback'}</span>
              </div>
              <p>{aiHintResult.hint}</p>
              <span className="muted small" style={{ fontStyle: 'italic', fontSize: '11px' }}>{aiHintResult.disclaimer}</span>
            </li>
          )}
        </ol>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn--secondary" style={{ flex: 1 }} onClick={hint} disabled={hintsShown >= challenge.hints.length}>
            <Icon name="bulb" size={18} />{hintsShown >= challenge.hints.length ? 'No more hints' : `Show hint ${hintsShown + 1} of ${challenge.hints.length}`}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            title="Ask AI Coach for a targeted hint"
            onClick={() => requestAiHint(false)}
            disabled={isLoadingAiHint}
          >
            <Icon name="sparkles" size={18} />
            {isLoadingAiHint ? 'Thinking...' : 'AI Hint'}
          </button>
        </div>
      </section>
      <section className="brief__block" aria-labelledby="sol-h">
        <h2 className="study__h" id="sol-h">Reference solution</h2>
        {!rec?.solutionRevealed ? (
          <>
            <p className="muted small">Try the hints first. Revealing the solution is a deliberate step, and a topic only counts as mastered if you finish without it. Your draft is never replaced.</p>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => setConfirm('solution')}><Icon name="eye" size={18} />Reveal reference solution…</button>
          </>
        ) : (
          <div className="solution">
            <CodeBlock code={challenge.solutionCode} label="Reference solution" copyable={false} />
            <ul className="solution__notes">{challenge.solutionExplanation.map((e, i) => <li key={i}>{e}</li>)}</ul>
            <button type="button" className="btn btn--ghost btn--sm" onClick={copySolution}><Icon name="copy" size={16} />Copy solution</button>
          </div>
        )}
      </section>
    </div>
  )

  const toolbar = (
    <div className="toolbar" role="toolbar" aria-label="Practice actions">
      {showRun && (
        <button type="button" className="btn btn--secondary" onClick={run}><Icon name="play" size={18} />Run</button>
      )}
      <button type="button" className="btn btn--primary" onClick={check}><Icon name="check" size={18} />Check solution</button>
      {awardedXp !== null && <XpAward amount={awardedXp} onComplete={() => setAwardedXp(null)} />}
      <button type="button" className="btn btn--ghost" onClick={hint} disabled={hintsShown >= challenge.hints.length}><Icon name="bulb" size={18} />Hint</button>
      <button type="button" className="btn btn--ghost" onClick={() => (draftEdited ? setConfirm('reset') : toast.show('The editor already has the starter code.', 'info'))}><Icon name="reset" size={18} />Reset</button>
      <button
        type="button"
        className={`btn btn--ghost ${showDiff ? 'is-active' : ''}`}
        aria-pressed={showDiff}
        disabled={!rec?.solutionRevealed}
        title={!rec?.solutionRevealed ? 'Reveal the solution to compare' : undefined}
        onClick={() => setShowDiff((s) => !s)}
      >
        <Icon name="code" size={18} />Diff
      </button>
      {hasComplexityCapability && providerAvailable ? (
        <button
          type="button"
          className={`btn btn--ghost ${analysisOpen ? 'is-active' : ''}`}
          aria-pressed={analysisOpen}
          onClick={() => {
            if (mobile) setTab('analysis')
            else setAnalysisOpen((o) => !o)
          }}
          aria-label="Analyse & improve"
        >
          <Icon name="compass" size={18} />Analyse &amp; improve
        </button>
      ) : (
        <button
          type="button"
          className="btn btn--ghost"
          disabled
          aria-disabled="true"
          title={
            isPythonTrack
              ? 'Complexity analysis is not available for Python yet'
              : !hasComplexityCapability
                ? 'Complexity analysis is not supported for this track'
                : `Complexity analysis is not available for ${currentLanguage ? currentLanguage.toUpperCase() : 'this language'} yet`
          }
          onClick={() => {
            if (mobile) setTab('analysis')
            else setAnalysisOpen(true)
          }}
        >
          <Icon name="compass" size={18} />Analyse &amp; improve
        </button>
      )}
      <button
        type="button"
        className={`btn btn--ghost ${raceStatus !== 'idle' ? 'is-active' : ''}`}
        onClick={() => setRaceLobbyOpen(true)}
        title="Challenge a peer to a live race"
      >
        <Icon name="repeat" size={18} />
        {raceStatus !== 'idle' ? `Race #${raceSession.roomCode}` : 'Race'}
      </button>
      {!mobile && (
        <button type="button" className="btn btn--ghost toolbar__end" aria-pressed={focus} onClick={() => setFocus((f) => !f)}>
          <Icon name={focus ? 'collapse' : 'expand'} size={18} />{focus ? 'Exit focus mode' : 'Focus mode'}
        </button>
      )}
    </div>
  )

  const editor = (
    <section className="pane" aria-labelledby="ed-h">
      <div className="pane__head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 id="ed-h" className="pane__title">Editor</h2>
          <AutoSaveIndicator title={draftNote} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setSnippetsOpen(true)}
            aria-label="Code snippets"
          >
            <Icon name="bulb" size={16} />Snippets
          </button>
          <button
            type="button"
            ref={fullscreenOpenerRef}
            className="btn btn--ghost btn--sm"
            onClick={() => setFullscreen(true)}
            aria-label="Fullscreen editor"
          >
            <Icon name="expand" size={16} />Fullscreen
          </button>
          <Link to="/settings" className="btn btn--ghost btn--sm" aria-label="Editor settings">
            <Icon name="gear" size={16} />
          </Link>
        </div>
      </div>
      {fileCount > 1 && (
        <div role="tablist" aria-label="Challenge files" className="tabs tabs--files" style={{ marginBottom: 0, borderRadius: 0, borderBottom: '1px solid var(--c-border)' }}>
          {allFiles.map((f) => (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={activeFileName === f.name}
              className={`tab ${activeFileName === f.name ? 'is-active' : ''}`}
              onClick={() => setActiveFileName(f.name)}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
      <CodeEditor
        value={code}
        onChange={setCode}
        editorRef={editorHandleRef}
        diagnostics={diagnostics}
        language={currentLanguage}
        label={`${activeTrack?.name || 'Code'} editor`}
      />
    </section>
  )

  const preview = useMemo(() => {
    if (isJavaOrCppTrack) {
      const langName = activeTrack?.name || 'Java/C++'
      return (
        <section className="pane" aria-labelledby="pv-h" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pane__head">
            <h2 id="pv-h" className="pane__title">{langName} Execution Sandbox</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="chip chip--sm">In-Worker Evaluator</span>
              {compiledOutput?.durationMs !== undefined && (
                <span className="muted small">{compiledOutput.durationMs}ms</span>
              )}
            </div>
          </div>
          <div className="preview preview--empty" style={{ padding: 'var(--s-4)', textAlign: 'left', overflow: 'auto' }}>
            <div style={{ marginBottom: '14px' }}>
              <h3 className="h6" style={{ marginBottom: '4px' }}>Standard Output:</h3>
              <pre
                style={{
                  background: 'var(--code-bg, #0d0d17)',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '160px',
                  fontSize: '13px',
                  color: 'var(--c-text)',
                  border: '1px solid var(--c-border)',
                }}
              >
                {compiledOutput ? (compiledOutput.stdout || '(No output produced)') : '(Click "Check solution" to compile and execute)'}
              </pre>
            </div>
            {compiledOutput?.stderr && (
              <div style={{ marginBottom: '14px' }}>
                <h3 className="h6" style={{ marginBottom: '4px', color: 'var(--c-danger)' }}>Standard Error:</h3>
                <pre
                  style={{
                    background: 'var(--code-bg, #0d0d17)',
                    color: 'var(--c-danger)',
                    padding: '10px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '160px',
                    fontSize: '13px',
                    border: '1px solid var(--c-danger, #ef4444)',
                  }}
                >
                  {compiledOutput.stderr}
                </pre>
              </div>
            )}
            <div
              style={{
                background: 'var(--code-bg, #0d0d17)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--r-sm)',
                padding: '10px 12px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                color: 'var(--c-text-muted)',
              }}
            >
              Sandbox constraints: 3,000ms watchdog · 128MB memory ceiling · 64KB buffer limit
            </div>
          </div>
        </section>
      )
    }

    if (isPythonTrack) {
      if (!pythonExecutionEnabled) {
        return (
          <section className="pane" aria-labelledby="pv-h" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="pane__head">
              <h2 id="pv-h" className="pane__title">Structure Preview</h2>
              <span className="muted small" role="status">Structure check mode — your code is not run</span>
            </div>
            <div className="preview preview--empty" style={{ padding: 'var(--s-4)', textAlign: 'left', overflow: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className="chip chip--sm">Non-Executing</span>
                <span className="muted small">Python 3</span>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: 'var(--text-sm)', color: 'var(--c-text-muted)' }}>
                Python code is inspected using static structural rules. Code execution and runtime evaluation are not active in this preview.
              </p>

              {!declinedNotice && (
                <div
                  className="card"
                  style={{
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid var(--c-primary, #38bdf8)',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--c-surface-1, #1e1e2e)',
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Python Execution Sandbox</strong>
                  <p style={{ margin: '0 0 10px 0', fontSize: 'var(--text-xs, 12px)', color: 'var(--c-text-muted)' }}>
                    Running Python in your browser requires downloading the self-hosted Pyodide runtime (~10 MB). This is downloaded once and cached locally for full offline access.
                  </p>
                  {pythonDownloading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="spinner" />
                      <span className="small">Preparing Python sandbox... {pythonDownloadProgress}%</span>
                    </div>
                  ) : pythonInitError ? (
                    <div>
                      <span style={{ color: 'var(--c-danger)', display: 'block', fontSize: '12px', marginBottom: '8px' }}>
                        {pythonInitError}
                      </span>
                      <button type="button" className="btn btn--secondary btn--sm" onClick={enablePythonExecution}>
                        Retry
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn--primary btn--sm" onClick={enablePythonExecution}>
                        Download &amp; Enable Python (~10 MB)
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDeclinedNotice(true)}>
                        Keep Structure Preview
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div
                style={{
                  background: 'var(--code-bg, #0d0d17)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '320px',
                  overflow: 'auto',
                  color: 'var(--c-text)',
                }}
              >
                {code || '# No Python code entered'}
              </div>
            </div>
          </section>
        )
      }

      return (
        <section className="pane" aria-labelledby="pv-h" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="pane__head">
            <h2 id="pv-h" className="pane__title">Python Sandbox</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="chip chip--sm">WebAssembly Worker</span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setPythonExecutionEnabled(false)
                  try {
                    localStorage.setItem('codeorbit:python:execution_enabled', 'false')
                  } catch {
                    // ignore storage error
                  }
                }}
              >
                Structure Preview
              </button>
            </div>
          </div>
          <div className="preview preview--empty" style={{ padding: 'var(--s-4)', textAlign: 'left', overflow: 'auto' }}>
            {isRunningPython ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                Executing in isolated Web Worker sandbox...
              </div>
            ) : pythonRunResult ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 className="h6" style={{ marginBottom: '4px' }}>Standard Output:</h3>
                  <pre
                    style={{
                      background: 'var(--code-bg, #0d0d17)',
                      padding: '10px',
                      borderRadius: '4px',
                      overflow: 'auto',
                      maxHeight: '160px',
                      fontSize: '13px',
                      color: 'var(--c-text)',
                    }}
                  >
                    {pythonRunResult.stdout || '(No output produced)'}
                  </pre>
                  {pythonRunResult.stderr && (
                    <div style={{ marginTop: '8px' }}>
                      <h3 className="h6" style={{ marginBottom: '4px', color: 'var(--c-danger)' }}>Standard Error:</h3>
                      <pre
                        style={{
                          background: 'var(--code-bg, #0d0d17)',
                          color: 'var(--c-danger)',
                          padding: '10px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '160px',
                          fontSize: '13px',
                        }}
                      >
                        {pythonRunResult.stderr}
                      </pre>
                    </div>
                  )}
                </div>

                {pythonRunResult.testResults.length > 0 && (
                  <div>
                    <h3 className="h6" style={{ marginBottom: '6px' }}>Test Results:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pythonRunResult.testResults.map((t) => (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            background: 'var(--c-surface-2, #2a2a3c)',
                            borderRadius: '4px',
                            borderLeft: `3px solid ${t.passed ? 'var(--c-success, #22c55e)' : 'var(--c-danger, #ef4444)'}`,
                          }}
                        >
                          <span style={{ fontSize: '13px' }}>{t.name}</span>
                          <span className={`chip chip--sm ${t.passed ? 'chip--success' : 'chip--danger'}`}>
                            {t.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                Click <strong>Run</strong> in the toolbar to execute your code in the WebAssembly sandbox.
              </div>
            )}
          </div>
        </section>
      )
    }

    return (
      <section className="pane" aria-labelledby="pv-h" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="pane__head">
          <h2 id="pv-h" className="pane__title">Preview</h2>
          <span className="muted small" role="status">
            {ranCode === null ? 'Not run yet' : stale ? 'Editor changed since the last run' : 'Showing your last run'}
          </span>
        </div>
        {ranCode === null ? (
          <div className="preview preview--empty"><p>Press <strong>Run</strong> to see your page here. The preview is sandboxed: scripts cannot run.</p></div>
        ) : stylesheetError ? (
          <div className="preview preview--empty">
            <p>{stylesheetError}</p>
            <button type="button" className="btn btn--secondary btn--sm" onClick={loadStylesheets}>
              Retry
            </button>
          </div>
        ) : (
          <div className="preview" style={{ height: '100%', minHeight: '300px' }}>
            <DeviceFrame mode={deviceFrame} onModeChange={setDeviceFrame}>
              <SandboxedPreview
                html={ranCode}
                frame={deviceFrame}
                needsMedia={challenge.needsMedia}
                stylesheets={trackStylesheets}
                mode={activeTrack?.id === 'angular' || activeTrack?.id === 'javascript' || activeTrack?.runner?.kind === 'script-preview' ? 'script' : 'static'}
              />
            </DeviceFrame>
          </div>
        )}
      </section>
    )
  }, [
    isJavaOrCppTrack,
    activeTrack?.id,
    activeTrack?.runner?.kind,
    activeTrack?.name,
    compiledOutput,
    isPythonTrack,
    pythonExecutionEnabled,
    declinedNotice,
    pythonDownloading,
    pythonDownloadProgress,
    pythonInitError,
    pythonRunResult,
    isRunningPython,
    code,
    ranCode,
    stale,
    deviceFrame,
    challenge.needsMedia,
    stylesheetError,
    trackStylesheets,
    loadStylesheets,
    enablePythonExecution,
  ])

  const feedback = (
    <section className="pane coach" aria-labelledby="coach-h">
      <div className="pane__head">
        <h2 id="coach-h" className="pane__title">Code Coach</h2>
        <span className="muted small">Rule-based checks specific to this challenge.</span>
      </div>
      <div role="status" aria-live="polite">
        <FeedbackPanel
          result={result}
          challenge={challenge}
          history={rec?.history}
          onSaveError={saveError}
          onAskHint={hint}
        />
      </div>

      {/* A11y Linter Section (6.7) */}
      <div style={{ marginTop: 'var(--s-4)', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--s-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ fontWeight: 650, fontSize: 'var(--fs-small)' }}>Accessibility Linter</span>
            <span className="muted small" style={{ marginLeft: '8px' }}>Quick checks, not a full audit</span>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={runLinter}>
            <Icon name="check" size={14} />Run linter
          </button>
        </div>
        {lintIssues === null ? (
          <p className="muted small" style={{ margin: 0 }}>
            Press “Run linter” or “Check solution” to test for missing alt attributes, unlabelled controls, and heading hierarchy.
          </p>
        ) : lintIssues.length === 0 ? (
          <div style={{ color: 'var(--c-success, #10b981)', fontSize: 'var(--fs-small)' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>✓ No quick-check issues found.</p>
            <p className="muted small" style={{ marginTop: '2px', margin: 0 }}>
              Note: Passing automated quick checks does not guarantee full WCAG accessibility conformance.
            </p>
          </div>
        ) : (
          <ul className="reqs" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {lintIssues.map((issue) => (
              <li
                key={issue.id}
                className={`req req--${issue.severity === 'error' ? 'fail' : 'warning'}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '16px 1fr',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: 'var(--r-sm)',
                  backgroundColor: issue.severity === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${issue.severity === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  marginBottom: '6px',
                }}
              >
                <Icon name={issue.severity === 'error' ? 'x' : 'info'} size={16} />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 'var(--fs-small)' }}>{issue.message}</p>
                  {issue.snippet && (
                    <code style={{ fontSize: 'var(--fs-meta)', color: 'var(--c-text-quiet)', wordBreak: 'break-all' }}>
                      {issue.snippet}
                    </code>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* W3C HTML Validation Section (Gate O-14) */}
      {(currentLanguage === defaultTrackId() || activeTrack?.id === defaultTrackId()) && (
        <div style={{ marginTop: 'var(--s-4)', borderTop: '1px solid var(--c-border)', paddingTop: 'var(--s-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <span style={{ fontWeight: 650, fontSize: 'var(--fs-small)' }}>W3C HTML Validation</span>
              <span className="muted small" style={{ marginLeft: '8px' }}>
                {w3cResult ? (w3cResult.source === 'w3c-remote' ? 'Official Nu Checker' : 'Local Fallback') : 'Standards check'}
              </span>
            </div>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={isValidatingW3C}
              onClick={() => runW3CValidation(false)}
            >
              <Icon name="check" size={14} />
              {isValidatingW3C ? 'Validating...' : 'Validate HTML'}
            </button>
          </div>
          {w3cResult === null ? (
            <p className="muted small" style={{ margin: 0 }}>
              Press “Validate HTML” to check your markup against W3C HTML5 standards.
            </p>
          ) : w3cResult.messages.length === 0 ? (
            <div style={{ color: 'var(--c-success, #10b981)', fontSize: 'var(--fs-small)' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>✓ Document conforms to W3C HTML5 standards.</p>
            </div>
          ) : (
            <ul className="reqs" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {w3cResult.messages.map((m, idx) => (
                <li
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    padding: '6px 8px',
                    fontSize: 'var(--fs-small)',
                    marginBottom: '4px',
                    borderRadius: 'var(--r-sm)',
                    backgroundColor: m.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                    border: `1px solid ${m.type === 'error' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                  }}
                >
                  <Icon name={m.type === 'error' ? 'x' : 'info'} size={16} />
                  <div style={{ flex: 1 }}>
                    <div>{m.message}</div>
                    {m.lastLine && (
                      <span className="muted small" style={{ fontFamily: 'var(--font-mono)' }}>
                        Line {m.lastLine}:{m.lastColumn ?? 1}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )

  const dialogs = (
    <>
      <ConfirmDialog open={confirm === 'reset'} title="Reset to the starter code?" confirmLabel="Reset editor" danger onConfirm={reset} onCancel={() => setConfirm(null)}>
        <p>Your current code in this challenge will be replaced with the starter code. This cannot be undone.</p>
      </ConfirmDialog>
      <ConfirmDialog open={confirm === 'solution'} title="Reveal the reference solution?" confirmLabel="Reveal solution" onConfirm={() => { dispatch({ type: 'REVEAL_SOLUTION', challengeId }); setConfirm(null) }} onCancel={() => setConfirm(null)}>
        <p>You will see the full answer and its explanation. Your draft stays as it is. If you complete this challenge afterwards, the topic cannot be marked as mastered.</p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'w3c-consent'}
        title="Transmit HTML to W3C Validator?"
        confirmLabel="Agree & Validate"
        onConfirm={() => {
          setW3CConsent(true)
          setConfirm(null)
          runW3CValidation(true)
        }}
        onCancel={() => {
          setConfirm(null)
          const htmlFile = currentFiles.find((f) => f.name.toLowerCase().endsWith('.html')) ?? currentFiles[0]
          const res = validateHtmlLocally(htmlFile ? htmlFile.content : code)
          setW3cResult(res)
          toast.show('Declined remote transmission. Applied local checks only.', 'info')
        }}
      >
        <p>
          Live W3C HTML Validation transmits your HTML markup to the official public W3C Nu HTML Checker
          service (<code>https://validator.w3.org/nu/</code>).
        </p>
        <p className="muted small">
          Zero personal data, cookies, or account identifiers are transmitted. If you decline, local offline rules are used.
        </p>
      </ConfirmDialog>
      <ConfirmDialog
        open={confirm === 'ai-consent'}
        title="Enable AI-Powered Hints?"
        confirmLabel="Agree & Request Hint"
        onConfirm={() => {
          setAiConsent(true)
          setConfirm(null)
          requestAiHint(true)
        }}
        onCancel={() => {
          setConfirm(null)
          toast.show('AI hints cancelled. Standard curriculum hints remain available.', 'info')
        }}
      >
        <p>
          AI Hint Expansion transmits your code snippet and failing challenge requirements to a secure
          serverless proxy to generate contextual pedagogical feedback.
        </p>
        <p className="muted small">
          No personal information or account credentials are transmitted. Requesting an AI hint increments
          your revealed hints counter. You can decline at any time.
        </p>
      </ConfirmDialog>
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        snapshot={{
          v: 1,
          trackId: topic?.technologyId ?? customV2?.trackId ?? activeTrack?.id ?? '',
          title: challenge.title,
          files: currentFiles.map((f) => ({ name: f.name, content: f.content })),
        }}
      />
      <RaceLobbyModal
        open={raceLobbyOpen}
        session={raceSession}
        status={raceStatus}
        opponent={raceOpponent}
        onClose={() => setRaceLobbyOpen(false)}
        onStartRace={() => {
          setRaceLobbyOpen(false)
          raceSession.startCountdown()
        }}
      />
    </>
  )

  const header = (
    <PageHeader
      crumbs={
        topic
          ? [
              { label: 'Explore', to: '/explore' },
              { label: topic.technologyId.toUpperCase(), to: trackPath(topic.technologyId) },
              { label: topic.title, to: lessonPath(challenge.topicId) },
              { label: 'Practice' },
            ]
          : [
              { label: 'Explore', to: '/explore' },
              { label: 'Creator', to: '/create' },
              { label: challenge.title },
            ]
      }
      miniConstellation={topic ? { technologyId: topic.technologyId, topicId: challenge.topicId } : undefined}
      title={challenge.title}
      actions={
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShareOpen(true)}
            aria-label="Share challenge snapshot"
          >
            <Icon name="share" size={14} /> Share
          </button>
        </div>
      }
      lede={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isCustom && <span className="chip chip--sm">Custom Challenge</span>}
          <span>{challenge.difficulty[0].toUpperCase() + challenge.difficulty.slice(1)}{rec?.completed ? ' · Completed' : ''}</span>
          {!recResult.recommended && recResult.reason && (
            <span
              className="muted small"
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--r-sm)',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--c-warning, #f59e0b)',
                fontWeight: 500,
              }}
              title={recResult.reason}
            >
              Recommended: Beginner first
            </span>
          )}
        </span>
      }
    />
  )

  const diffSection = showDiff && (
    <section className="pane pane--diff" style={{ marginTop: 'var(--s-4)' }}>
      <DiffViewer myCode={code} referenceCode={challenge.solutionCode} solutionRevealed={Boolean(rec?.solutionRevealed)} />
    </section>
  )

  const snippetsDrawer = (
    <Drawer
      open={snippetsOpen}
      onClose={() => setSnippetsOpen(false)}
      title="Code Snippets"
    >
      <SnippetPanel
        snippets={HTML_SNIPPETS}
        onInsert={(snipCode) => {
          editorHandleRef.current?.insertAtCursor(snipCode)
          setSnippetsOpen(false)
          toast.show('Snippet inserted into editor.')
        }}
        onClose={() => setSnippetsOpen(false)}
      />
    </Drawer>
  )

  const analysisContent = (
    <div style={{ padding: '0.5rem' }}>
      {analysisComparison ? (
        <div>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={{ marginBottom: '1rem' }}
            onClick={() => setAnalysisComparison(null)}
          >
            <Icon name="arrow-left" size={14} /> Back to analysis
          </button>
          <ComparisonView comparison={analysisComparison} />
        </div>
      ) : (
        <>
          <AnalysisPanel
            language={currentLanguage}
            hasCapability={hasComplexityCapability}
            providerAvailable={providerAvailable}
            estimate={analysisEstimate}
            error={analysisError}
            isLoading={analysisLoading}
            onRunAnalysis={handleRunAnalysis}
            onHighlightRange={handleHighlightRange}
            onSelectBottleneck={(b) => handleHighlightRange(b.range)}
          />
          {analysisSuggestions.length > 0 && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--c-border)', paddingTop: '1rem' }}>
              <OptimisationPanel
                suggestions={analysisSuggestions}
                onApplySuggestion={handleApplySuggestion}
                onVerifySuggestion={analysisProvider?.verifyEquivalence ? handleVerifySuggestion : undefined}
                verificationStatus={verificationStatus}
                isVerifying={isVerifying}
              />
            </div>
          )}
        </>
      )}
    </div>
  )

  const analysisDrawer = (
    <Drawer
      open={analysisOpen}
      onClose={() => setAnalysisOpen(false)}
      title="Analyse & improve"
    >
      {analysisContent}
    </Drawer>
  )

  const localPercent = result
    ? result.total > 0
      ? Math.round((result.passed / result.total) * 100)
      : 0
    : 0

  const raceHud = (
    <RaceHud
      session={raceSession}
      status={raceStatus}
      countdown={raceSession.countdown}
      opponentProgress={raceOpponent}
      localPercent={localPercent}
      onLeave={() => raceSession.leave()}
    />
  )

  if (mobile) {
    const tabs: Array<[MobileTab, string]> = [
      ['brief', 'Brief'],
      ['editor', 'Editor'],
      ['preview', 'Preview'],
      ['feedback', 'Feedback'],
      ['analysis', 'Analyse & improve'],
    ]
    return (
      <div className="page page--wide practice practice--mobile">
        {header}
        {raceHud}
        {toolbar}
        <div role="tablist" aria-label="Practice panels" className="tabs">
          {tabs.map(([k, label]) => (
            <button key={k} type="button" role="tab" id={`ptab-${k}`} aria-selected={tab === k} aria-controls={`ppanel-${k}`} className={`tab${tab === k ? ' is-active' : ''}`} onClick={() => setTab(k)}>{label}</button>
          ))}
        </div>
        <div role="tabpanel" id="ppanel-brief" aria-labelledby="ptab-brief" hidden={tab !== 'brief'}>{brief}</div>
        <div role="tabpanel" id="ppanel-editor" aria-labelledby="ptab-editor" hidden={tab !== 'editor'}>{editor}{diffSection}</div>
        <div role="tabpanel" id="ppanel-preview" aria-labelledby="ptab-preview" hidden={tab !== 'preview'}>{preview}</div>
        <div role="tabpanel" id="ppanel-feedback" aria-labelledby="ptab-feedback" hidden={tab !== 'feedback'}>{feedback}</div>
        <div role="tabpanel" id="ppanel-analysis" aria-labelledby="ptab-analysis" hidden={tab !== 'analysis'}>{analysisContent}</div>
        {dialogs}
        {snippetsDrawer}
        {analysisDrawer}
        <FullscreenEditor
          open={fullscreen}
          onClose={() => setFullscreen(false)}
          title={challenge.title}
          openerRef={fullscreenOpenerRef}
          editor={<CodeEditor value={code} onChange={setCode} language={currentLanguage} />}
          preview={preview}
        />
      </div>
    )
  }

  const splitOrientation = isNarrowDesktop ? 'vertical' : 'horizontal'
  const panesStyle = splitOrientation === 'horizontal'
    ? { display: 'grid', gridTemplateColumns: `${splitRatio}% auto minmax(0, 1fr)`, alignItems: 'stretch' }
    : { display: 'grid', gridTemplateRows: `${splitRatio}% auto minmax(0, 1fr)`, gap: '8px' }

  return (
    <div className={`page page--wide practice${focus ? ' practice--focus' : ''}`}>
      {!focus && header}
      <div className="practice__grid">
        {!focus && <div className="practice__brief">{brief}</div>}
        <div className="practice__work">
          {raceHud}
          {toolbar}
          <div className="practice__panes" style={panesStyle}>
            {editor}
            <Splitter
              ratio={splitRatio}
              onChange={handleSplitChange}
              orientation={splitOrientation}
              onReset={handleSplitReset}
            />
            {preview}
          </div>
          {diffSection}
          {feedback}
        </div>
      </div>
      {dialogs}
      {snippetsDrawer}
      {analysisDrawer}
      <FullscreenEditor
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={challenge.title}
        openerRef={fullscreenOpenerRef}
        editor={<CodeEditor value={code} onChange={setCode} language={currentLanguage} />}
        preview={preview}
      />
    </div>
  )
}
