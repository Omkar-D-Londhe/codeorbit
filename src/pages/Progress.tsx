import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopic } from '../data/curriculum'
import { ConfirmDialog } from '../components/Dialog'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { useToast } from '../components/Toast'
import { useDocumentTitle } from '../lib/hooks'
import { topicProgress, trackProgress, nextAction } from '../lib/progress'
import { lessonPath } from '../lib/routes'
import { STATUS_ICON, STATUS_LABEL } from '../lib/status'
import { useApp } from '../state/AppState'
import { useTrack } from '../core/content/useTrack'
import { XpBar } from '../core/gamification/XpBar'
import { BadgeGallery } from '../core/gamification/BadgeGallery'
import { PersonalBestsSection } from '../core/gamification/PersonalBestsSection'

export default function Progress() {
  useDocumentTitle('My Progress')
  const { state, resetAll } = useApp()
  const track = useTrack()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)

  if (!track) {
    return (
      <div className="page">
        <PageHeader title="My progress" lede="Everything here comes from what you have actually done in this browser." />
        <EmptyState icon="compass" title="No learning tracks are available yet">
          Progress will appear here once tracks are available.
        </EmptyState>
      </div>
    )
  }

  const trackTopics = track.topics
  const trackGroups = track.groups
  const tp = trackProgress(state, track.id)
  const action = nextAction(state, track.id)
  const next = action.topicId ? getTopic(action.topicId) : undefined
  const started = trackTopics.some((t) => topicProgress(state, t).touched)

  return (
    <div className="page">
      <PageHeader title="My progress" lede="Everything here comes from what you have actually done in this browser." />

      <XpBar />

      {/* Streak summary line & link to dashboard (Stage 12: no duplicate daily card) */}
      <section className="card card--quiet progress-streak-summary" aria-labelledby="prog-streak-h">
        <p className="eyebrow">Daily challenge</p>
        <h2 id="prog-streak-h" className="card__title">Daily challenge & activity</h2>
        <p className="muted">
          Today's daily challenge and active learning streak are available on your dashboard.
        </p>
        <div className="btn-row">
          <Link className="btn btn--secondary" to="/">Go to Dashboard</Link>
        </div>
      </section>

      <section className="card progress-summary" aria-labelledby="sum-h">
        <ProgressRing fraction={tp.partsTotal ? tp.parts / tp.partsTotal : 0} size={72} stroke={5} className="ring--accent" />
        <div>
          <h2 id="sum-h" className="card__title">{track.name} track</h2>
          <p>{tp.completedTopics} of {tp.totalTopics} topics complete · {tp.parts} of {tp.partsTotal} steps done{tp.masteredTopics > 0 ? ` · ${tp.masteredTopics} mastered` : ''}</p>
          {next && action.kind !== 'all-complete' && (
            <p className="muted">{started ? 'Suggested next' : 'Start here'}: <Link to={lessonPath(next.id)}>{next.title}</Link>. {action.reason}</p>
          )}
          {!started && <p className="muted">No progress yet. Complete a lesson, quiz or challenge and it will appear here.</p>}
        </div>
      </section>

      <PersonalBestsSection />

      {trackGroups.map((g) => {
        const ts = trackTopics.filter((t) => t.groupId === g.id)
        return (
          <section key={g.id} className="progress-group" aria-labelledby={`g-${g.id}`}>
            <h2 id={`g-${g.id}`} className="section-title">{g.title}</h2>
            <ul className="progress-list">
              {ts.map((t) => {
                const p = topicProgress(state, t)
                const prereq = t.prerequisiteIds.map((id) => getTopic(id)?.title).filter(Boolean)
                return (
                  <li key={t.id} className="progress-row">
                    <span className={`status-chip status-chip--${p.status}`}><Icon name={STATUS_ICON[p.status]} size={14} />{STATUS_LABEL[p.status]}</span>
                    <div className="progress-row__main">
                      <Link className="progress-row__title" to={lessonPath(t.id)}>{t.title}</Link>
                      <p className="muted small">
                        Lesson {p.lessonDone ? '✓' : '–'} · Quiz {p.quizPassed ? '✓' : '–'} · Practice {p.practiceDone ? '✓' : '–'}
                        {prereq.length > 0 && ` · Builds on: ${prereq.join(', ')}`}
                      </p>
                    </div>
                    <span className="muted small">{p.parts} of {p.partsTotal}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}

      <BadgeGallery />

      <details className="card card--quiet rules">
        <summary>How progress is counted</summary>
        <ul>
          <li><strong>Lesson</strong>: you mark it complete.</li>
          <li><strong>Quiz</strong>: your best score is at least 2 of 3.</li>
          <li><strong>Practice</strong>: every requirement passes in a check.</li>
          <li><strong>Completed</strong>: all three steps are done. <strong>Mastered</strong>: completed with a perfect quiz score and without revealing the reference solution first.</li>
          <li>These are learning aids, not exam grades.</li>
        </ul>
      </details>

      <section className="card card--quiet" aria-labelledby="data-h">
        <h2 id="data-h" className="card__title">Your data</h2>
        <p className="muted">Progress, drafts, notes and bookmarks are stored in this browser only. They do not sync to other devices or browsers.</p>
        <button type="button" className="btn btn--danger-ghost" onClick={() => setConfirm(true)}><Icon name="trash" size={18} />Clear all saved data…</button>
      </section>
      <ConfirmDialog open={confirm} title="Clear all saved data?" confirmLabel="Clear everything" danger onCancel={() => setConfirm(false)}
        onConfirm={() => { resetAll(); setConfirm(false); toast.show('All saved data was cleared.', 'info') }}>
        <p>This removes your progress, quiz results, code drafts, notes, bookmarks and Error Notebook from this browser. It cannot be undone.</p>
      </ConfirmDialog>
    </div>
  )
}
