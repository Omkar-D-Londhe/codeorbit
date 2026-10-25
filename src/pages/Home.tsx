import { Link } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { ProgressRing } from '../components/ProgressRing'
import { useDocumentTitle } from '../lib/hooks'
import { nextAction, openErrorCount, topicProgress, trackProgress } from '../lib/progress'
import { ACTIVITY_LABEL, lessonPath, resumePath, trackPath } from '../lib/routes'
import { STATUS_LABEL, formatDateTime } from '../lib/status'
import { useApp } from '../state/AppState'
import { useTrack } from '../core/content/useTrack'

function OrbitFrame() {
  // Decorative cropped constellation: static, aria-hidden, carries no data.
  return (
    <svg className="home-frame" viewBox="0 0 320 180" aria-hidden="true" focusable="false">
      <path d="M-10 190 A180 170 0 0 1 330 190" className="home-frame__arc" />
      <path d="M20 190 A150 140 0 0 1 300 190" className="home-frame__arc home-frame__arc--inner" />
      {[[34, 150], [70, 92], [120, 52], [180, 36], [240, 56], [286, 110]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 3 ? 5 : 3} className={i === 3 ? 'home-frame__star home-frame__star--lit' : 'home-frame__star'} />
      ))}
    </svg>
  )
}

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
        <EmptyState icon="compass" title="No learning tracks are available yet">
          Learning tracks will appear here once registered.
        </EmptyState>
      </div>
    )
  }

  const trackTopics = track.topics
  const tp = trackProgress(state, track.id)
  const action = nextAction(state, track.id)
  const lv = state.lastVisited
  const lvTopic = lv ? getTopic(lv.topicId) : undefined
  const lvProgress = lvTopic ? topicProgress(state, lvTopic) : undefined
  const lvChallenge = lv?.activity === 'practice' ? challengesForTopic(lv.topicId).find((c) => c.id === lv.challengeId) ?? challengesForTopic(lv.topicId)[0] : undefined
  const allDone = tp.completedTopics === tp.totalTopics
  const anyProgress = tp.parts > 0 || !!lv || trackTopics.some((t) => topicProgress(state, t).touched)
  const nextTopic = action.topicId ? getTopic(action.topicId) : undefined
  const open = openErrorCount(state)

  return (
    <div className="page page--home">
      <PageHeader
        title={anyProgress ? 'Welcome back' : `Learn ${track.name} by exploring it`}
        lede={anyProgress ? 'Pick up where you left off, or choose a topic on the Learning Orbit.' : 'Short lessons, quick checks and a safe practice lab — all in this browser.'}
      />

      <div className="home-grid">
        <section className="card card--feature continue" aria-labelledby="continue-h">
          <OrbitFrame />
          <div className="continue__body">
            <p className="eyebrow">Continue learning</p>
            {lv && lvTopic && lvProgress && !allDone ? (
              <>
                <h2 id="continue-h" className="continue__title">{lvTopic.title}</h2>
                <p className="continue__desc">{lvTopic.description}</p>
                <ul className="meta-row" aria-label="Where you left off">
                  <li><Icon name="book" size={16} />{ACTIVITY_LABEL[lv.activity]}{lvChallenge ? `: ${lvChallenge.title}` : ''}</li>
                  <li><ProgressRing fraction={lvProgress.parts / lvProgress.partsTotal} size={22} stroke={2.5} className="ring--accent" />{lvProgress.parts} of {lvProgress.partsTotal} steps done</li>
                  <li>{STATUS_LABEL[lvProgress.status]}</li>
                </ul>
                <p className="muted small">Last activity: {formatDateTime(lv.at)}</p>
                <div className="btn-row">
                  <Link className="btn btn--primary btn--lg" to={resumePath(lv)}>Resume<Icon name="arrow-right" size={18} /></Link>
                  <Link className="btn btn--secondary btn--lg" to={trackPath(track.id)}>Browse topics</Link>
                </div>
              </>
            ) : allDone ? (
              <>
                <h2 id="continue-h" className="continue__title">Every {track.name} topic is complete</h2>
                <p className="continue__desc">You have finished all {tp.totalTopics} topics. Revisit any topic on the Learning Orbit, or look over your progress.</p>
                <div className="btn-row">
                  <Link className="btn btn--primary btn--lg" to="/progress">See your progress</Link>
                  <Link className="btn btn--secondary btn--lg" to={trackPath(track.id)}>Open the Learning Orbit</Link>
                </div>
              </>
            ) : (
              <>
                <h2 id="continue-h" className="continue__title">{anyProgress ? 'Choose what to do next' : `Start with ${track.name}`}</h2>
                <p className="continue__desc">
                  {anyProgress
                    ? 'You have saved progress. Open the Learning Orbit to pick a topic.'
                    : `${tp.totalTopics} topics from the page skeleton to a finished page. Each has a lesson, a short quiz and a practice challenge.`}
                </p>
                <div className="btn-row">
                  <Link className="btn btn--primary btn--lg" to={trackPath(track.id)}>{anyProgress ? 'Open the Learning Orbit' : `Start ${track.name}`}<Icon name="arrow-right" size={18} /></Link>
                  <Link className="btn btn--secondary btn--lg" to="/explore">Browse technologies</Link>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="card track-card" aria-labelledby="track-h">
          <p className="eyebrow">Learning track</p>
          <h2 id="track-h" className="card__title">{track.name}</h2>
          <p className="muted">{tp.completedTopics} of {tp.totalTopics} topics complete · {tp.parts} of {tp.partsTotal} steps</p>
          <ol className="seg" aria-label="Topic status, in curriculum order">
            {trackTopics.map((t, i) => {
              const p = topicProgress(state, t)
              return (
                <li key={t.id} className={`seg__item seg__item--${p.status}`}>
                  <Link to={lessonPath(t.id)} aria-label={`${i + 1}. ${t.title}: ${STATUS_LABEL[p.status]}`} title={`${t.title} — ${STATUS_LABEL[p.status]}`}>
                    <span aria-hidden="true">{p.status === 'completed' ? '✓' : p.status === 'mastered' ? '★' : i + 1}</span>
                  </Link>
                </li>
              )
            })}
          </ol>
          <Link className="btn btn--secondary" to={trackPath(track.id)}>Open track</Link>
          <p className="muted small track-card__previews">CSS, JavaScript, Bootstrap and Angular are planned. <Link to="/explore">See what is coming</Link>.</p>
        </section>
      </div>

      {(action.kind === 'next' || open > 0) && (
        <div className="home-secondary">
          {action.kind === 'next' && nextTopic && !(lv && action.topicId === lv.topicId && !allDone) && (
            <section className="card card--quiet" aria-labelledby="next-h">
              <p className="eyebrow">Recommended next</p>
              <h2 id="next-h" className="card__title">{nextTopic.title}</h2>
              <p className="muted">{action.reason}</p>
              <Link className="btn btn--secondary" to={lessonPath(nextTopic.id)}>Open lesson</Link>
            </section>
          )}
          {open > 0 && (
            <section className="card card--quiet" aria-labelledby="rev-h">
              <p className="eyebrow">Review</p>
              <h2 id="rev-h" className="card__title">{open} open {open === 1 ? 'item' : 'items'} in your Error Notebook</h2>
              <p className="muted">Things you saved from checks and quizzes, ready to revisit.</p>
              <Link className="btn btn--secondary" to="/review">Open Error Notebook</Link>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
