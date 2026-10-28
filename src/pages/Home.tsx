import { Link } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { useDocumentTitle } from '../lib/hooks'
import { openErrorCount, topicProgress, trackProgress } from '../lib/progress'
import { dueCards } from '../core/learning/spaced'
import { ACTIVITY_LABEL, lessonPath, resumePath, trackPath } from '../lib/routes'
import { STATUS_LABEL, formatDateTime } from '../lib/status'
import { useApp } from '../state/AppState'
import { useTrack } from '../core/content/useTrack'
import { dayKey } from '../core/gamification/streak'
import { HeroRing } from '../core/insights/HeroRing'
import { StreakCalendar } from '../core/gamification/StreakCalendar'
import { GroupCards } from '../core/insights/GroupCards'
import { ActivityFeed } from '../core/insights/ActivityFeed'
import { QuickActions } from '../core/insights/QuickActions'
import { NextStepCard } from '../core/learning/NextStepCard'
import { DailyChallengeCard } from '../core/gamification/DailyChallengeCard'

function OrbitFrame() {
  // Decorative cropped constellation: static, aria-hidden, carries no data.
  return (
    <svg className="home-frame" viewBox="0 0 320 180" aria-hidden="true" focusable="false">
      <path d="M-10 190 A180 170 0 0 1 330 190" className="home-frame__arc" />
      <path d="M20 190 A150 140 0 0 1 300 190" className="home-frame__arc home-frame__arc--inner" />
      {[[34, 150], [70, 92], [120, 52], [180, 36], [240, 56], [286, 110]].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === 3 ? 5 : 3}
          className={i === 3 ? 'home-frame__star home-frame__star--lit' : 'home-frame__star'}
        />
      ))}
    </svg>
  )
}

/**
 * Stage 12 Dashboard: Track-aware dashboard composing
 * Row 1: Hero progress ring (160 px) + Continue / Start card + Daily Challenge card
 * Row 2: Topic group completion cards grid + Track curriculum strip + Streak calendar
 * Row 3: Activity feed + Recommended next step / Review + Quick actions toolbar
 */
export default function Home() {
  useDocumentTitle('Home')
  const { state } = useApp()
  const track = useTrack()

  if (!track) {
    return (
      <div className="page page--home">
        <PageHeader
          title="Learn by exploring"
          lede="Short lessons, quick checks and a safe practice lab — all in this browser."
        />
        <EmptyState variant="tracks" icon="compass" title="No learning tracks are available yet">
          Learning tracks will appear here once registered.
        </EmptyState>
      </div>
    )
  }

  const trackTopics = track.topics
  const tp = trackProgress(state, track.id)
  const lv = state.lastVisited
  const lvTopic = lv ? getTopic(lv.topicId) : undefined
  const lvProgress = lvTopic ? topicProgress(state, lvTopic) : undefined
  const lvChallenge =
    lv?.activity === 'practice'
      ? challengesForTopic(lv.topicId).find((c) => c.id === lv.challengeId) ??
        challengesForTopic(lv.topicId)[0]
      : undefined
  const allDone = tp.completedTopics === tp.totalTopics
  const anyProgress = tp.parts > 0 || !!lv || trackTopics.some((t) => topicProgress(state, t).touched)
  const open = openErrorCount(state)
  const due = dueCards(state.review ?? {}).length
  const notesCount = Object.keys(state.notes || {}).length
  const today = dayKey(Date.now())
  const gamificationEnabled = state.settings.gamificationEnabled !== false

  return (
    <div className="page page--home dashboard-page">
      <PageHeader
        title={anyProgress ? 'Welcome back' : `Learn ${track.name} by exploring it`}
        lede={
          anyProgress
            ? 'Pick up where you left off, or choose a topic on the Learning Orbit.'
            : 'Short lessons, quick checks and a safe practice lab — all in this browser.'
        }
      />

      <div className="dashboard-container">
        {/* ROW 1: Hero Ring + Continue + Daily Challenge */}
        <div className="dashboard-row dashboard-row--1">
          <div className="dashboard-item dashboard-item--hero">
            <HeroRing
              completedTopics={tp.completedTopics}
              totalTopics={tp.totalTopics}
              parts={tp.parts}
              partsTotal={tp.partsTotal}
              trackName={track.name}
            />
          </div>

          <div className="dashboard-item dashboard-item--continue">
            <section className="card card--feature continue" aria-labelledby="continue-h" data-tour="lesson">
              <OrbitFrame />
              <div className="continue__body">
                <p className="eyebrow">Continue learning</p>
                {lv && lvTopic && lvProgress && !allDone ? (
                  <>
                    <h2 id="continue-h" className="continue__title">
                      {lvTopic.title}
                    </h2>
                    <p className="continue__desc">{lvTopic.description}</p>
                    <ul className="meta-row" aria-label="Where you left off">
                      <li>
                        <Icon name="book" size={16} />
                        {ACTIVITY_LABEL[lv.activity]}
                        {lvChallenge ? `: ${lvChallenge.title}` : ''}
                      </li>
                      <li>
                        <ProgressRing
                          fraction={lvProgress.parts / lvProgress.partsTotal}
                          size={22}
                          stroke={2.5}
                          className="ring--accent"
                        />
                        {lvProgress.parts} of {lvProgress.partsTotal} steps done
                      </li>
                      <li>{STATUS_LABEL[lvProgress.status]}</li>
                    </ul>
                    <p className="muted small">Last activity: {formatDateTime(lv.at)}</p>
                    <div className="btn-row">
                      <Link className="btn btn--primary btn--lg" to={resumePath(lv)}>
                        Resume
                        <Icon name="arrow-right" size={18} />
                      </Link>
                      <Link className="btn btn--secondary btn--lg" to={trackPath(track.id)}>
                        Browse topics
                      </Link>
                    </div>
                  </>
                ) : allDone ? (
                  <>
                    <h2 id="continue-h" className="continue__title">
                      Every {track.name} topic is complete
                    </h2>
                    <p className="continue__desc">
                      You have finished all {tp.totalTopics} topics. Revisit any topic on the
                      Learning Orbit, or look over your progress.
                    </p>
                    <div className="btn-row">
                      <Link className="btn btn--primary btn--lg" to="/progress">
                        See your progress
                      </Link>
                      <Link className="btn btn--secondary btn--lg" to={trackPath(track.id)}>
                        Open the Learning Orbit
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 id="continue-h" className="continue__title">
                      {anyProgress ? 'Choose what to do next' : `Start with ${track.name}`}
                    </h2>
                    <p className="continue__desc">
                      {anyProgress
                        ? 'You have saved progress. Open the Learning Orbit to pick a topic.'
                        : `${tp.totalTopics} topics from the page skeleton to a finished page. Each has a lesson, a short quiz and a practice challenge.`}
                    </p>
                    <div className="btn-row">
                      <Link className="btn btn--primary btn--lg" to={trackPath(track.id)}>
                        {anyProgress ? 'Open the Learning Orbit' : `Start ${track.name}`}
                        <Icon name="arrow-right" size={18} />
                      </Link>
                      <Link className="btn btn--secondary btn--lg" to="/explore">
                        Browse technologies
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          <div className="dashboard-item dashboard-item--daily" data-tour="practice">
            <DailyChallengeCard />
          </div>
        </div>

        {/* ROW 2: Group Cards Grid + Track Strip + Streak Calendar */}
        <div className="dashboard-row dashboard-row--2">
          <div className="dashboard-item dashboard-item--groups">
            <GroupCards track={track} state={state} />
          </div>

          <div className="dashboard-item dashboard-item--track-seg">
            <section className="card track-card" aria-labelledby="track-h">
              <p className="eyebrow">Learning track</p>
              <h2 id="track-h" className="card__title">
                {track.name}
              </h2>
              <p className="muted">
                {tp.completedTopics} of {tp.totalTopics} topics complete · {tp.parts} of {tp.partsTotal} steps
              </p>
              <ol className="seg" aria-label="Topic status, in curriculum order">
                {trackTopics.map((t, i) => {
                  const p = topicProgress(state, t)
                  return (
                    <li key={t.id} className={`seg__item seg__item--${p.status}`}>
                      <Link
                        to={lessonPath(t.id)}
                        aria-label={`${i + 1}. ${t.title}: ${STATUS_LABEL[p.status]}`}
                        title={`${t.title} — ${STATUS_LABEL[p.status]}`}
                      >
                        <span aria-hidden="true">
                          {p.status === 'completed' ? '✓' : p.status === 'mastered' ? '★' : i + 1}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ol>
              <Link className="btn btn--secondary" to={trackPath(track.id)}>
                Open track
              </Link>
              <p className="muted small track-card__previews">
                CSS, JavaScript, Bootstrap and Angular are planned.{' '}
                <Link to="/explore">See what is coming</Link>.
              </p>
            </section>
          </div>

          {gamificationEnabled && (
            <div className="dashboard-item dashboard-item--calendar">
              <StreakCalendar days={state.activityDays} today={today} weeks={12} />
            </div>
          )}
        </div>

        {/* ROW 3: Activity Feed + Smart Next Step / Review + Quick Actions */}
        <div className="dashboard-row dashboard-row--3">
          {state.activity && state.activity.length > 0 && (
            <div className="dashboard-item dashboard-item--feed">
              <ActivityFeed activity={state.activity} />
            </div>
          )}

          <div className="dashboard-item dashboard-item--next-step">
            <NextStepCard state={state} trackId={track.id} trackName={track.name} />
          </div>

          {(open > 0 || due > 0) && (
            <div className="dashboard-item dashboard-item--review">
              <section className="card card--quiet" aria-labelledby="rev-h">
                <p className="eyebrow">Review</p>
                <h2 id="rev-h" className="card__title">
                  {due > 0
                    ? `${due} ${due === 1 ? 'card' : 'cards'} due for spaced review today`
                    : `${open} open ${open === 1 ? 'item' : 'items'} in your Error Notebook`}
                </h2>
                <p className="muted">
                  {due > 0
                    ? 'Strengthen retention with scheduled spaced repetition practice.'
                    : 'Things you saved from checks and quizzes, ready to revisit.'}
                </p>
                <Link className="btn btn--secondary" to="/review">
                  {due > 0 ? 'Start Due Review' : 'Open Error Notebook'}
                </Link>
              </section>
            </div>
          )}

          <div className="dashboard-item dashboard-item--quick-actions">
            <QuickActions
              lastVisited={lv}
              trackId={track.id}
              openErrors={open}
              notesCount={notesCount}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
