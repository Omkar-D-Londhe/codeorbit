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
import { useClock } from '../core/time/Clock'
import { Splitter } from '../core/ui/Splitter'
import { AutoSaveIndicator } from '../core/editor/AutoSaveIndicator'
import { FullscreenEditor } from '../core/editor/FullscreenEditor'
import { toChallengeV2 } from '../core/content/challengeAdapter'
import type { ChallengeFile } from '../core/content/types'
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
import NotFound from './NotFound'

const HINT_TITLES = ['Conceptual clue', 'Structural clue', 'Specific guidance']
type MobileTab = 'brief' | 'editor' | 'preview' | 'feedback'

export default function Practice() {
  const { challengeId = '' } = useParams()
  const ch = getChallenge(challengeId)
  if (!ch) return <NotFound />
  return <PracticeInner key={ch.id} challengeId={ch.id} />
}

function PracticeInner({ challengeId }: { challengeId: string }) {
  const challenge = getChallenge(challengeId)!
  const topic = getTopic(challenge.topicId)!
  useDocumentTitle(challenge.title)
  const { state, dispatch, saveStatus } = useApp()
  const now = useClock()
  const toast = useToast()
  const mobile = useMediaQuery('(max-width: 767px)')

  const chV2 = useMemo(() => toChallengeV2(challenge), [challenge])
  const [activeFileName, setActiveFileName] = useState(chV2.files[0]?.name ?? 'index.html')
  const fileCount = chV2.files.length

  const rec = state.challenges[challengeId]
  const currentKey = draftKey(challengeId, activeFileName, fileCount)
  const activeStarter = chV2.files.find((f) => f.name === activeFileName)?.content ?? challenge.starterCode
  const code = state.drafts[currentKey] ?? (fileCount === 1 ? (state.drafts[challengeId] ?? challenge.starterCode) : activeStarter)

  const [ranCode, setRanCode] = useState<string | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [focus, setFocus] = useState(false)
  const [tab, setTab] = useState<MobileTab>('editor')
  const [confirm, setConfirm] = useState<null | 'reset' | 'solution'>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameMode>('desktop')
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [lintIssues, setLintIssues] = useState<A11yLintIssue[] | null>(null)
  const [diagnostics, setDiagnostics] = useState<EditorDiagnostic[]>([])

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
    return chV2.files.map((f) => {
      const k = draftKey(challengeId, f.name, fileCount)
      const val = state.drafts[k] ?? (fileCount === 1 ? (state.drafts[challengeId] ?? f.content) : f.content)
      return { ...f, content: val }
    })
  }, [chV2.files, state.drafts, challengeId, fileCount])

  const run = () => {
    const runner = new IframePreviewRunner()
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
    const r = checkChallenge(challenge, htmlCode)
    setResult(r)
    const diags = requirementsToDiagnostics(r.results)
    setDiagnostics(diags)
    const runner = new IframePreviewRunner()
    runner.run({ files: currentFiles }).then((res) => {
      if (res.status === 'ok' && res.previewDoc) {
        setRanCode(res.previewDoc)
      }
    })
    dispatch({
      type: 'RECORD_CHECK',
      challengeId,
      passed: r.passed,
      total: r.total,
      failedIds: r.results.filter((x) => x.status === 'fail').map((x) => x.id),
      now: now(),
    })
    if (r.allPassed) toast.show(`All ${r.total} requirements met. Challenge complete.`)

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
        <p className="muted small">
          <Link to={lessonPath(challenge.topicId)}>Review the “{topic.title}” lesson</Link>
        </p>
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
        </ol>
        <button type="button" className="btn btn--secondary btn--block" onClick={hint} disabled={hintsShown >= challenge.hints.length}>
          <Icon name="bulb" size={18} />{hintsShown >= challenge.hints.length ? 'No more hints' : `Show hint ${hintsShown + 1} of ${challenge.hints.length}`}
        </button>
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
      <button type="button" className="btn btn--secondary" onClick={run}><Icon name="play" size={18} />Run</button>
      <button type="button" className="btn btn--primary" onClick={check}><Icon name="check" size={18} />Check solution</button>
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
          {chV2.files.map((f) => (
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
      <CodeEditor value={code} onChange={setCode} editorRef={editorHandleRef} diagnostics={diagnostics} />
    </section>
  )

  const preview = useMemo(() => (
    <section className="pane" aria-labelledby="pv-h" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="pane__head">
        <h2 id="pv-h" className="pane__title">Preview</h2>
        <span className="muted small" role="status">
          {ranCode === null ? 'Not run yet' : stale ? 'Editor changed since the last run' : 'Showing your last run'}
        </span>
      </div>
      {ranCode === null ? (
        <div className="preview preview--empty"><p>Press <strong>Run</strong> to see your page here. The preview is sandboxed: scripts cannot run.</p></div>
      ) : (
        <div className="preview" style={{ height: '100%', minHeight: '300px' }}>
          <DeviceFrame mode={deviceFrame} onModeChange={setDeviceFrame}>
            <SandboxedPreview html={ranCode} frame={deviceFrame} />
          </DeviceFrame>
        </div>
      )}
    </section>
  ), [ranCode, stale, deviceFrame])

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
    </>
  )

  const header = (
    <PageHeader
      crumbs={[{ label: 'Explore', to: '/explore' }, { label: 'HTML', to: trackPath(topic.technologyId) }, { label: topic.title, to: lessonPath(challenge.topicId) }, { label: 'Practice' }]}
      title={challenge.title}
      lede={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

  if (mobile) {
    const tabs: Array<[MobileTab, string]> = [['brief', 'Brief'], ['editor', 'Editor'], ['preview', 'Preview'], ['feedback', 'Feedback']]
    return (
      <div className="page page--wide practice practice--mobile">
        {header}
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
        {dialogs}
        {snippetsDrawer}
        <FullscreenEditor
          open={fullscreen}
          onClose={() => setFullscreen(false)}
          title={challenge.title}
          openerRef={fullscreenOpenerRef}
          editor={<CodeEditor value={code} onChange={setCode} />}
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
      <FullscreenEditor
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        title={challenge.title}
        openerRef={fullscreenOpenerRef}
        editor={<CodeEditor value={code} onChange={setCode} />}
        preview={preview}
      />
    </div>
  )
}
