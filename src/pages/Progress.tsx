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
import { calculateVelocity, VELOCITY_EMPTY_MESSAGE } from '../core/insights/velocity'
import { compareGroupEstimates, compareTopicEstimates } from '../core/insights/estimates'
import { calculateQuizBreakdown } from '../core/insights/quizBreakdown'
import { calculateAttemptHeat, exportAttemptsToCsv } from '../core/insights/attemptHeat'
import { AccessibleBarChart } from '../core/insights/charts/AccessibleBarChart'
import { AccessibleLineChart } from '../core/insights/charts/AccessibleLineChart'
import { ShareCard } from '../core/insights/ShareCard'

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

  const velocity = calculateVelocity(state)
  const topicEstimates = compareTopicEstimates(state, trackTopics)
  const groupEstimates = compareGroupEstimates(state, trackTopics, trackGroups)
  const quizBreakdown = calculateQuizBreakdown(state, trackTopics)
  const attemptHeat = calculateAttemptHeat(state)

  const handleExportCsv = () => {
    const csv = exportAttemptsToCsv(attemptHeat.rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codeorbit-challenge-attempts.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

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

      {/* Analytics Suite (Stage 15c: Velocity, Estimates vs Actual, Quizzes, Attempt Heat, Share Card) */}
      <section className="analytics-suite" aria-label="Progress Analytics Suite">
        <AccessibleLineChart
          title="Learning Velocity (Last 14 Days)"
          description="Derived from your real lesson, quiz and check milestones."
          points={velocity.points.map((p) => ({ label: p.label, value: p.count }))}
          emptyMessage={VELOCITY_EMPTY_MESSAGE}
          yUnit="events"
        />

        <details className="card card--quiet analytics-collapsible">
          <summary className="card__title">Time Estimates vs Actual Time</summary>
          <p className="muted small" style={{ margin: '8px 0 16px' }}>
            Time estimates are authored learning aids. Actual times appear only after at least 3 measured sessions on this device (Principle P-07).
          </p>
          <AccessibleBarChart
            title="Estimated Time by Topic Group"
            data={groupEstimates.map((g) => ({
              label: g.groupTitle,
              value: g.estimatedMinutes,
              secondaryValue: g.measuredSeconds ? Math.round(g.measuredSeconds / 60) : undefined,
            }))}
            yUnit="min"
          />
          <table className="data-table" aria-label="Topic time estimates vs actual measurements">
            <caption>Topic time estimates vs actual time (measured on this device)</caption>
            <thead>
              <tr>
                <th scope="col">Topic</th>
                <th scope="col">Estimated</th>
                <th scope="col">Actual Time</th>
                <th scope="col">Sessions</th>
              </tr>
            </thead>
            <tbody>
              {topicEstimates.map((tc) => (
                <tr key={tc.topicId}>
                  <th scope="row">{tc.topicTitle}</th>
                  <td>{tc.estimatedFormatted}</td>
                  <td>{tc.hasSufficientSessions ? tc.measuredFormatted : <span className="muted">Needs ≥ 3 sessions</span>}</td>
                  <td>{tc.sessionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <details className="card card--quiet analytics-collapsible">
          <summary className="card__title">Quiz Performance Breakdown</summary>
          <p className="muted small" style={{ margin: '8px 0 16px' }}>
            Performance across all track quizzes. Topics with best score &lt; 70% are flagged as review candidates.
          </p>
          <table className="data-table" aria-label="Quiz scores and attempt history">
            <caption>Quiz breakdown per topic</caption>
            <thead>
              <tr>
                <th scope="col">Topic</th>
                <th scope="col">Questions</th>
                <th scope="col">Attempts</th>
                <th scope="col">Best Score</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {quizBreakdown.items.map((qb) => (
                <tr key={qb.topicId}>
                  <th scope="row">{qb.topicTitle}</th>
                  <td>{qb.questionCount}</td>
                  <td>{qb.attemptsCount}</td>
                  <td>{qb.bestScore ? `${qb.bestScore.correct}/${qb.bestScore.total} (${qb.bestScore.percentage}%)` : '–'}</td>
                  <td>
                    {qb.status === 'perfect' && <span className="status-chip status-chip--mastered">Perfect</span>}
                    {qb.status === 'passed' && !qb.isWeak && <span className="status-chip status-chip--completed">Passed</span>}
                    {qb.isWeak && <span className="status-chip status-chip--in-progress">Review Candidate</span>}
                    {qb.status === 'not-started' && <span className="muted small">Not Started</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <details className="card card--quiet analytics-collapsible">
          <summary className="card__title">Challenge Attempt Heat Table</summary>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 16px' }}>
            <p className="muted small" style={{ margin: 0 }}>
              Recent check attempts across challenges (up to last 10 attempts as ✓ / ✗).
            </p>
            <button type="button" className="btn btn--ghost small" onClick={handleExportCsv}>
              <Icon name="download" size={14} /> Export CSV
            </button>
          </div>
          <table className="data-table" aria-label="Challenge attempt heat table">
            <caption>Challenge attempts and recent checks</caption>
            <thead>
              <tr>
                <th scope="col">Challenge</th>
                <th scope="col">Attempts</th>
                <th scope="col">Hints Used</th>
                <th scope="col">Status</th>
                <th scope="col">Recent Checks</th>
              </tr>
            </thead>
            <tbody>
              {attemptHeat.rows.map((row) => (
                <tr key={row.challengeId}>
                  <th scope="row">{row.challengeTitle}</th>
                  <td>{row.attemptsCount}</td>
                  <td>{row.hintsUsed}</td>
                  <td>
                    {row.status === 'mastered' && <span className="status-chip status-chip--mastered">Mastered</span>}
                    {row.status === 'passed' && <span className="status-chip status-chip--completed">Passed</span>}
                    {row.status === 'in-progress' && <span className="status-chip status-chip--in-progress">In Progress</span>}
                    {row.status === 'not-started' && <span className="muted small">Not Started</span>}
                  </td>
                  <td>
                    {row.recentAttempts.length > 0 ? (
                      <div className="heat-matrix" aria-label={`Recent checks for ${row.challengeTitle}`}>
                        {row.recentAttempts.map((att, i) => (
                          <span
                            key={i}
                            className={`heat-chip ${att.passed ? 'heat-chip--pass' : 'heat-chip--fail'}`}
                            title={att.label}
                            aria-label={att.label}
                          >
                            {att.passed ? '✓' : '✗'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="muted small">No checks</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <ShareCard />
      </section>

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
