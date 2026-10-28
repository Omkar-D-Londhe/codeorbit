import { useEffect, useRef, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getGroup, getTopic, topicIndex, topics } from '../data/curriculum'
import { getLesson, getSectionId } from '../data/lessons'
import { getQuiz } from '../data/quizzes'
import { CodeBlock } from '../components/CodeBlock'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { useDocumentTitle, useMediaQuery } from '../lib/hooks'
import { topicProgress } from '../lib/progress'
import { practicePath, quizPath, trackPath } from '../lib/routes'
import { useApp } from '../state/AppState'
import { getRelatedTopics } from '../core/content/related'
import { sectionBookmarkId, sectionReviewCardId } from '../state/types'
import { createReviewCard } from '../core/learning/spaced'
import { VoiceRead, type VoiceReadParagraph } from '../core/speech/VoiceRead'
import { useClock } from '../core/time/Clock'
import { ReadingProgress } from '../core/learning/ReadingProgress'
import { EstimatedTime } from '../core/learning/EstimatedTime'
import { Toc } from '../core/learning/Toc'
import { renderTextWithTerms } from '../core/learning/DefinitionTerm'
import { LiveDemo } from '../core/learning/LiveDemo'
import { Takeaways } from '../core/learning/Takeaways'
import { A11yBox } from '../core/learning/A11yBox'
import { FocusMode } from '../core/learning/FocusMode'
import { NoteEditor } from '../core/notes/NoteEditor'
import { useActiveTime } from '../core/insights/activeTime'
import NotFound from './NotFound'

export default function Lesson() {
  const { topicId = '' } = useParams()
  useActiveTime(topicId)
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
  const toast = useToast()
  const now = useClock()
  const narrow = useMediaQuery('(max-width: 899px)')
  const wide = useMediaQuery('(min-width: 1100px)')
  const [tab, setTab] = useState<'lesson' | 'study'>('lesson')
  const [focusMode, setFocusMode] = useState(false)
  const focusOpenerRef = useRef<HTMLButtonElement>(null)
  const prevFocusMode = useRef(focusMode)

  useEffect(() => {
    if (prevFocusMode.current && !focusMode) {
      focusOpenerRef.current?.focus()
    }
    prevFocusMode.current = focusMode
  }, [focusMode])

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

  const tocSections = lesson.sections.map((s, i) => ({
    id: getSectionId(s, i),
    heading: s.heading,
  }))

  const [readingParagraph, setReadingParagraph] = useState<VoiceReadParagraph | null>(null)

  const voiceParagraphs = useMemo<VoiceReadParagraph[]>(() => {
    const list: VoiceReadParagraph[] = []
    lesson.sections.forEach((s, sIdx) => {
      const sectionId = getSectionId(s, sIdx)
      s.body.forEach((para, pIdx) => {
        list.push({
          sectionId,
          paragraphIndex: pIdx,
          text: para,
        })
      })
    })
    return list
  }, [lesson.sections])

  const lessonPanel = (
    <article className="lesson" aria-labelledby="lesson-h">
      <div className="lesson__meta-bar">
        <EstimatedTime lesson={lesson} />
      </div>
      <VoiceRead paragraphs={voiceParagraphs} onHighlightParagraph={setReadingParagraph} />
      <p className="lesson__objective"><strong>Objective.</strong> {lesson.objective}</p>
      {lesson.sections.map((s, i) => {
        const sectionId = getSectionId(s, i)
        const isSectionBookmarked = (state.sectionBookmarks ?? []).includes(sectionBookmarkId(topicId, sectionId))
        const reviewCardId = sectionReviewCardId(topicId, sectionId)
        const isSectionInReview = Boolean(state.review?.[reviewCardId])
        return (
          <section key={sectionId} id={`section-${sectionId}`} className="lesson__section" aria-labelledby={sectionId}>
            <div className="lesson__section-header">
              <h2 id={sectionId}>{s.heading}</h2>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  type="button"
                  className={`btn btn--ghost btn--sm ${isSectionInReview ? 'is-active' : ''}`}
                  aria-pressed={isSectionInReview}
                  aria-label={isSectionInReview ? `Remove ${s.heading} from review` : `Add ${s.heading} to review`}
                  onClick={() => {
                    if (isSectionInReview) {
                      dispatch({ type: 'REMOVE_REVIEW_CARD', cardId: reviewCardId })
                      toast.show('Removed from review queue')
                    } else {
                      dispatch({
                        type: 'ADD_REVIEW_CARD',
                        card: createReviewCard({
                          id: reviewCardId,
                          source: { kind: 'section', refId: `${topicId}#${sectionId}` },
                          topicId,
                          prompt: `Review section: ${s.heading} (${topic.title})`,
                          answer: s.body[0] || lesson.objective,
                        }),
                      })
                      toast.show('Added to spaced review queue')
                    }
                  }}
                >
                  <Icon name="refresh" size={16} />
                  <span className="small">{isSectionInReview ? 'In review' : 'Add to review'}</span>
                </button>
                <button
                  type="button"
                  className={`btn btn--ghost btn--sm ${isSectionBookmarked ? 'is-active' : ''}`}
                  aria-pressed={isSectionBookmarked}
                  aria-label={isSectionBookmarked ? `Remove bookmark for ${s.heading}` : `Bookmark ${s.heading}`}
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_SECTION_BOOKMARK', topicId, sectionId })
                    toast.show(isSectionBookmarked ? 'Section bookmark removed' : 'Section bookmarked')
                  }}
                >
                  <Icon name="bookmark" size={16} />
                  <span className="sr-only">{isSectionBookmarked ? 'Bookmarked' : 'Bookmark section'}</span>
                </button>
              </div>
            </div>
            {s.body.map((para, j) => {
              const isReading = readingParagraph?.sectionId === sectionId && readingParagraph?.paragraphIndex === j
              return (
                <p
                  key={j}
                  className={isReading ? 'is-reading' : undefined}
                  style={
                    isReading
                      ? {
                          backgroundColor: 'rgba(154, 139, 255, 0.15)',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          borderLeft: '3px solid var(--accent, #9A8BFF)',
                          transition: 'background-color 160ms ease-out',
                        }
                      : undefined
                  }
                  aria-current={isReading ? 'true' : undefined}
                >
                  {renderTextWithTerms(para, lesson.terms)}
                </p>
              )
            })}
            {s.code && <CodeBlock code={s.code.code} label={s.code.label} />}
            {s.callout && (
              <aside className={`callout callout--${s.callout.kind}`}>
                <Icon name={s.callout.kind === 'why' ? 'info' : 'alert'} size={18} />
                <div><strong>{s.callout.kind === 'why' ? 'Why it matters' : 'Common mistake'}</strong><p>{s.callout.text}</p></div>
              </aside>
            )}
          </section>
        )
      })}
      {lesson.demos && lesson.demos.length > 0 && (
        <div className="lesson__demos" aria-label="Interactive demos">
          {lesson.demos.map((demo) => (
            <LiveDemo key={demo.id} demo={demo} />
          ))}
        </div>
      )}
      {lesson.takeaways && <Takeaways takeaways={lesson.takeaways} />}
      {lesson.a11yNotes && <A11yBox notes={lesson.a11yNotes} />}
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
          onClick={() => dispatch({ type: 'SET_LESSON_COMPLETE', topicId, value: !p.lessonDone, now: now() })}>
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
        <NoteEditor topicId={topicId} title={topic.title} />
      </section>
      {(() => {
        const related = getRelatedTopics(topic, topics, 4)
        if (related.length === 0) return null
        return (
          <section className="study__block">
            <h2 className="study__h">Related topics</h2>
            <ul className="related-topics-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {related.map(({ topic: rt, reason }) => (
                <li key={rt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', fontSize: '13px' }}>
                  <Link to={`/lesson/${rt.id}`} style={{ color: 'var(--accent, #9a8bff)', textDecoration: 'none' }} className="hover-underline">
                    {rt.title}
                  </Link>
                  <span className="badge badge--subtle" style={{ fontSize: '10px', flexShrink: 0 }}>
                    {reason}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })()}
    </aside>
  )

  if (focusMode) {
    return (
      <div className="page page--wide">
        <ReadingProgress />
        <FocusMode
          active={focusMode}
          onExit={() => setFocusMode(false)}
          openerRef={focusOpenerRef}
        >
          {lessonPanel}
        </FocusMode>
      </div>
    )
  }

  return (
    <div className="page page--wide">
      <ReadingProgress />
      <PageHeader
        crumbs={[{ label: 'Explore', to: '/explore' }, { label: topic.technologyId.toUpperCase(), to: trackPath(topic.technologyId) }, { label: topic.title }]}
        miniConstellation={{ technologyId: topic.technologyId, topicId: topic.id }}
        title={topic.title}
        lede={`${getGroup(topic.groupId)?.title} · Topic ${idx + 1} of ${topics.length}`}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              ref={focusOpenerRef}
              type="button"
              className="btn btn--ghost"
              onClick={() => setFocusMode(true)}
              aria-label="Enter focus reading mode"
            >
              <Icon name="expand" size={18} />
              <span>Focus mode</span>
            </button>
            <Link className="btn btn--ghost" to={trackPath(topic.technologyId)}>
              <Icon name="compass" size={18} />
              <span>Learning Orbit</span>
            </Link>
          </div>
        }
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
          <div role="tabpanel" id="panel-lesson" aria-labelledby="tab-lesson" hidden={tab !== 'lesson'}>
            <Toc sections={tocSections} mobile />
            {lessonPanel}
          </div>
          <div role="tabpanel" id="panel-study" aria-labelledby="tab-study" hidden={tab !== 'study'}>{studyPanel}</div>
        </>
      ) : wide && tocSections.length > 1 ? (
        <div className="lesson-layout lesson-layout--3col">
          <aside className="lesson-layout__toc">
            <Toc sections={tocSections} />
          </aside>
          <div className="lesson-layout__main">
            {lessonPanel}
          </div>
          <div className="lesson-layout__side">
            {studyPanel}
          </div>
        </div>
      ) : (
        <div className="split">
          <div className="split__main">
            {tocSections.length > 1 && <Toc sections={tocSections} mobile />}
            {lessonPanel}
          </div>
          <div className="split__side">{studyPanel}</div>
        </div>
      )}
    </div>
  )
}
