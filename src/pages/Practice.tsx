import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const rec = state.challenges[challengeId]
  const code = state.drafts[challengeId] ?? challenge.starterCode
  const [ranCode, setRanCode] = useState<string | null>(null)
  const [result, setResult] = useState<CheckResult | null>(null)
  const [focus, setFocus] = useState(false)
  const [tab, setTab] = useState<MobileTab>('editor')
  const [confirm, setConfirm] = useState<null | 'reset' | 'solution'>(null)
  const draftEdited = code !== challenge.starterCode

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

  const setCode = useCallback((v: string) => dispatch({ type: 'SET_DRAFT', challengeId, code: v }), [dispatch, challengeId])

  const run = () => { setRanCode(code); if (mobile) setTab('preview') }
  const check = () => {
    const r = checkChallenge(challenge, code)
    setResult(r)
    setRanCode(code)
    dispatch({ type: 'RECORD_CHECK', challengeId, passed: r.passed, total: r.total, failedIds: r.results.filter((x) => x.status === 'fail').map((x) => x.id), now: now() })
    if (r.allPassed) toast.show(`All ${r.total} requirements met. Challenge complete.`)
    if (mobile) setTab('feedback')
  }
  const hint = () => dispatch({ type: 'REVEAL_HINT', challengeId, max: challenge.hints.length })
  const reset = () => {
    dispatch({ type: 'CLEAR_DRAFT', challengeId })
    setResult(null)
    setConfirm(null)
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
  const failed = result?.results.filter((r) => r.status === 'fail') ?? []

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
      {!mobile && (
        <button type="button" className="btn btn--ghost toolbar__end" aria-pressed={focus} onClick={() => setFocus((f) => !f)}>
          <Icon name={focus ? 'collapse' : 'expand'} size={18} />{focus ? 'Exit focus mode' : 'Focus mode'}
        </button>
      )}
    </div>
  )

  const editor = (
    <section className="pane" aria-labelledby="ed-h">
      <div className="pane__head"><h2 id="ed-h" className="pane__title">Editor</h2><span className="muted small">{draftNote}</span></div>
      <CodeEditor value={code} onChange={setCode} />
    </section>
  )

  const preview = useMemo(() => (
    <section className="pane" aria-labelledby="pv-h">
      <div className="pane__head">
        <h2 id="pv-h" className="pane__title">Preview</h2>
        <span className="muted small" role="status">
          {ranCode === null ? 'Not run yet' : stale ? 'Editor changed since the last run' : 'Showing your last run'}
        </span>
      </div>
      {ranCode === null ? (
        <div className="preview preview--empty"><p>Press <strong>Run</strong> to see your page here. The preview is sandboxed: scripts cannot run.</p></div>
      ) : (
        <div className="preview"><SandboxedPreview html={ranCode} /></div>
      )}
    </section>
  ), [ranCode, stale])

  const feedback = (
    <section className="pane coach" aria-labelledby="coach-h">
      <div className="pane__head">
        <h2 id="coach-h" className="pane__title">Code Coach</h2>
        <span className="muted small">Rule-based checks for this challenge, not an AI review.</span>
      </div>
      <div role="status" aria-live="polite">
        {!result ? (
          <p className="muted">
            {rec?.lastCheck ? `Last check: ${rec.lastCheck.passed} of ${rec.lastCheck.total} requirements met (${formatDateTime(rec.lastCheck.at)}). Press “Check solution” to check your current code.` : 'Press “Check solution” to see which requirements your code meets.'}
          </p>
        ) : (
          <>
            <p className={`coach__summary ${result.allPassed ? 'is-good' : ''}`}>
              <Icon name={result.allPassed ? 'check' : 'info'} size={18} />
              {result.passed} of {result.total} requirements met{result.allPassed ? ' — challenge complete.' : '.'}
            </p>
            <ul className="coach__rows">
              {result.results.map((r) => (
                <li key={r.id} className={`coach__row coach__row--${r.status}`}>
                  <span className="coach__status"><Icon name={r.status === 'pass' ? 'check' : 'x'} size={16} />{r.status === 'pass' ? 'Met' : 'Not met'}</span>
                  <div><p>{r.description}</p>{r.status === 'fail' && <p className="muted small">Why it matters: {r.explanation}</p>}</div>
                </li>
              ))}
            </ul>
            {result.allPassed ? (
              <p className="small">Next: <Link to={trackPath(topic.technologyId)}>choose your next topic on the Learning Orbit</Link>, or take the topic quiz.</p>
            ) : (
              <div className="coach__next">
                <p className="small">Next: fix “{failed[0].description}”, then check again. <Link to={lessonPath(challenge.topicId)}>Review the lesson</Link> or ask for a hint.</p>
                <button type="button" className="btn btn--ghost btn--sm" onClick={saveError}>Save to Error Notebook</button>
              </div>
            )}
          </>
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
      lede={<>{challenge.difficulty[0].toUpperCase() + challenge.difficulty.slice(1)}{rec?.completed ? ' · Completed' : ''}</>}
    />
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
        <div role="tabpanel" id="ppanel-editor" aria-labelledby="ptab-editor" hidden={tab !== 'editor'}>{editor}</div>
        <div role="tabpanel" id="ppanel-preview" aria-labelledby="ptab-preview" hidden={tab !== 'preview'}>{preview}</div>
        <div role="tabpanel" id="ppanel-feedback" aria-labelledby="ptab-feedback" hidden={tab !== 'feedback'}>{feedback}</div>
        {dialogs}
      </div>
    )
  }

  return (
    <div className={`page page--wide practice${focus ? ' practice--focus' : ''}`}>
      {!focus && header}
      <div className="practice__grid">
        {!focus && <div className="practice__brief">{brief}</div>}
        <div className="practice__work">
          {toolbar}
          <div className="practice__panes">{editor}{preview}</div>
          {feedback}
        </div>
      </div>
      {dialogs}
    </div>
  )
}
