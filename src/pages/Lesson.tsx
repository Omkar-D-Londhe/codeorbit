import { useEffect, useId, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getGroup, getTopic, topicIndex, topics } from '../data/curriculum'
import { getLesson } from '../data/lessons'
import { getQuiz } from '../data/quizzes'
import { CodeBlock } from '../components/CodeBlock'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle, useMediaQuery } from '../lib/hooks'
import { topicProgress } from '../lib/progress'
import { practicePath, quizPath, trackPath } from '../lib/routes'
import { formatDateTime } from '../lib/status'
import { useApp } from '../state/AppState'
import NotFound from './NotFound'

function NotesEditor({ topicId, title }: { topicId: string; title: string }) {
  const { state, dispatch, saveStatus } = useApp()
  const rec = state.notes[topicId]
  const [text, setText] = useState(rec?.text ?? '')
  const id = useId()

  const onChange = (v: string) => {
    setText(v)
    dispatch({ type: 'SET_NOTE', topicId, text: v, now: Date.now() })
  }
  let status = ''
  if (saveStatus.kind === 'error') status = 'Not saved: this browser’s storage is unavailable.'
  else if (rec) status = saveStatus.kind === 'saved' && saveStatus.at >= rec.updatedAt ? `Saved in this browser · ${formatDateTime(rec.updatedAt)}` : 'Saving…'

  return (
    <div className="notes">
      <label htmlFor={id} className="field-label">Your notes for “{title}”</label>
      <textarea id={id} className="textarea" rows={6} value={text} onChange={(e) => onChange(e.target.value)} placeholder="Write what you want to remember." />
      <p className="muted small" role="status" aria-live="polite">{status}</p>
    </div>
  )
}

export default function Lesson() {
  const { topicId = '' } = useParams()
  const topic = getTopic(topicId)
  if (!topic) return <NotFound />
  return <LessonInner key={topic.id} topicId={topic.id} />
}

function LessonInner({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!
  const lesson = getLesson(topicId)!
  const quiz = getQuiz(topicId)
  const challenge = challengesForTopic(topicId)[0]
  useDocumentTitle(topic.title)
  const { state, dispatch } = useApp()
  const narrow = useMediaQuery('(max-width: 899px)')
  const [tab, setTab] = useState<'lesson' | 'study'>('lesson')

  useEffect(() => { dispatch({ type: 'VISIT', topicId, activity: 'lesson', now: Date.now() }) }, [topicId, dispatch])

  const idx = topicIndex(topicId)
  const prev = topics[idx - 1]
  const next = topics[idx + 1]
  const p = topicProgress(state, topic)
  const bookmarked = state.bookmarks.includes(topicId)
  const quizBest = state.topics[topicId]?.quizBest
  const sess = state.quizSessions[topicId]
  const quizInFlight = !!sess && !sess.finished && (sess.answers.some((a) => a !== null) || sess.skipped.some(Boolean))
  const chRec = challenge ? state.challenges[challenge.id] : undefined

  const lessonPanel = (
    <article className="lesson" aria-labelledby="lesson-h">
      <p className="lesson__objective"><strong>Objective.</strong> {lesson.objective}</p>
      {lesson.sections.map((s, i) => (
        <section key={s.heading} className="lesson__section" aria-labelledby={`sec-${i}`}>
          <h2 id={`sec-${i}`}>{s.heading}</h2>
          {s.body.map((para, j) => <p key={j}>{para}</p>)}
          {s.code && <CodeBlock code={s.code.code} label={s.code.label} />}
          {s.callout && (
            <aside className={`callout callout--${s.callout.kind}`}>
              <Icon name={s.callout.kind === 'why' ? 'info' : 'alert'} size={18} />
              <div><strong>{s.callout.kind === 'why' ? 'Why it matters' : 'Common mistake'}</strong><p>{s.callout.text}</p></div>
            </aside>
          )}
        </section>
      ))}
      <nav className="pager" aria-label="Topic navigation">
        {prev ? <Link className="btn btn--secondary" to={`/lesson/${prev.id}`}><Icon name="arrow-left" size={18} />Previous: {prev.shortTitle}</Link> : <span />}
        {next ? <Link className="btn btn--secondary" to={`/lesson/${next.id}`}>Next: {next.shortTitle}<Icon name="arrow-right" size={18} /></Link> : <Link className="btn btn--secondary" to={trackPath(topic.technologyId)}>Back to the Orbit</Link>}
      </nav>
    </article>
  )

  const studyPanel = (
    <aside className="study" aria-label="Study panel">
      <section className="study__block">
        <h2 className="study__h">Lesson</h2>
        <button type="button" className={`btn ${p.lessonDone ? 'btn--success' : 'btn--secondary'} btn--block`} aria-pressed={p.lessonDone}
          onClick={() => dispatch({ type: 'SET_LESSON_COMPLETE', topicId, value: !p.lessonDone })}>
          <Icon name={p.lessonDone ? 'check' : 'circle'} size={18} />{p.lessonDone ? 'Lesson marked complete' : 'Mark lesson complete'}
        </button>
        <button type="button" className="btn btn--ghost btn--block" aria-pressed={bookmarked} onClick={() => dispatch({ type: 'TOGGLE_BOOKMARK', topicId })}>
          <Icon name="bookmark" size={18} />{bookmarked ? 'Bookmarked' : 'Bookmark this topic'}
        </button>
      </section>
      {quiz && (
        <section className="study__block">
          <h2 className="study__h">Quick quiz</h2>
          <p className="muted small">
            {quizBest ? `Best score: ${quizBest.correct} of ${quizBest.total}.` : `${quiz.questions.length} questions. Pass with 2 of 3.`}
            {p.quizPassed ? ' Passed.' : ''}
          </p>
          <Link className="btn btn--primary btn--block" to={quizPath(topicId)}><Icon name="quiz" size={18} />{quizInFlight ? 'Resume quiz' : quizBest ? 'Retake quiz' : 'Start quiz'}</Link>
        </section>
      )}
      {challenge && (
        <section className="study__block">
          <h2 className="study__h">Practice</h2>
          <p className="muted small">{challenge.title} · {challenge.difficulty}{chRec?.completed ? ' · Completed' : ''}</p>
          <Link className="btn btn--primary btn--block" to={practicePath(challenge.id)}><Icon name="code" size={18} />{chRec?.completed ? 'Open practice again' : 'Practise this topic'}</Link>
        </section>
      )}
      <section className="study__block">
        <h2 className="study__h">Notes</h2>
        <NotesEditor topicId={topicId} title={topic.title} />
      </section>
    </aside>
  )

  return (
    <div className="page page--wide">
      <PageHeader
        crumbs={[{ label: 'Explore', to: '/explore' }, { label: 'HTML', to: trackPath(topic.technologyId) }, { label: topic.title }]}
        title={topic.title}
        lede={`${getGroup(topic.groupId)?.title} · Topic ${idx + 1} of ${topics.length}`}
        actions={<Link className="btn btn--ghost" to={trackPath(topic.technologyId)}><Icon name="compass" size={18} />Learning Orbit</Link>}
      />
      <h2 id="lesson-h" className="sr-only">Lesson content</h2>
      {narrow ? (
        <>
          <div role="tablist" aria-label="Lesson sections" className="tabs">
            {(['lesson', 'study'] as const).map((t) => (
              <button key={t} role="tab" type="button" id={`tab-${t}`} aria-selected={tab === t} aria-controls={`panel-${t}`} className={`tab${tab === t ? ' is-active' : ''}`}
                onClick={() => setTab(t)}>{t === 'lesson' ? 'Lesson' : 'Quiz, practice & notes'}</button>
            ))}
          </div>
          <div role="tabpanel" id="panel-lesson" aria-labelledby="tab-lesson" hidden={tab !== 'lesson'}>{lessonPanel}</div>
          <div role="tabpanel" id="panel-study" aria-labelledby="tab-study" hidden={tab !== 'study'}>{studyPanel}</div>
        </>
      ) : (
        <div className="split">
          <div className="split__main">{lessonPanel}</div>
          <div className="split__side">{studyPanel}</div>
        </div>
      )}
    </div>
  )
}
