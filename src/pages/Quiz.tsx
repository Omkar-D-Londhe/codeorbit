import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { getQuiz } from '../data/quizzes'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useToast } from '../components/Toast'
import { useDocumentTitle } from '../lib/hooks'
import { allChecked, checkAnswer, finish, goTo, isPass, newSession, scoreSession, selectOption, skipQuestion, type QuizSession } from '../lib/quiz'
import { lessonPath, practicePath, trackPath } from '../lib/routes'
import { useApp } from '../state/AppState'
import NotFound from './NotFound'

export default function QuizPage() {
  const { topicId = '' } = useParams()
  const topic = getTopic(topicId)
  const quiz = getQuiz(topicId)
  if (!topic || !quiz) return <NotFound />
  return <QuizInner key={topicId} topicId={topicId} />
}

function QuizInner({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!
  const quiz = getQuiz(topicId)!
  useDocumentTitle(`${topic.shortTitle} quiz`)
  const { state, dispatch } = useApp()
  const toast = useToast()
  const session = state.quizSessions[topicId]
  const nextBtn = useRef<HTMLButtonElement>(null)
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const challenge = challengesForTopic(topicId)[0]
  const n = quiz.questions.length

  useEffect(() => { dispatch({ type: 'VISIT', topicId, activity: 'quiz', now: Date.now() }) }, [topicId, dispatch])

  const update = (s: QuizSession) => dispatch({ type: 'QUIZ_UPDATE', topicId, session: s })
  const start = () => update(newSession(n))

  const crumbs = [{ label: 'Explore', to: '/explore' }, { label: 'HTML', to: trackPath(topic.technologyId) }, { label: topic.title, to: lessonPath(topicId) }, { label: 'Quick quiz' }]
  const header = <PageHeader crumbs={crumbs} title={`Quick quiz: ${topic.title}`} />

  if (!session) {
    const best = state.topics[topicId]?.quizBest
    return (
      <div className="page page--narrow">
        {header}
        <section className="card quiz-card">
          <p>{n} questions, one at a time. Check each answer to see an explanation. You pass with at least 2 correct.</p>
          {best && <p className="muted">Your best score so far: {best.correct} of {best.total}.</p>}
          <div className="btn-row">
            <button type="button" className="btn btn--primary btn--lg" onClick={start}>Start quiz</button>
            <Link className="btn btn--ghost btn--lg" to={lessonPath(topicId)}>Review the lesson first</Link>
          </div>
        </section>
      </div>
    )
  }

  // ---- Results ----
  if (session.finished) {
    const score = scoreSession(session, quiz)
    const passed = isPass(score)
    return (
      <div className="page page--narrow">
        {header}
        <section className="card quiz-card" aria-labelledby="res-h">
          <h2 id="res-h" ref={resultsHeading} tabIndex={-1} className="quiz-score">
            <Icon name={passed ? 'check' : 'info'} size={26} />
            {score.correct} of {score.total} correct
          </h2>
          <p className={passed ? 'success-text' : 'muted'}>
            {passed ? 'Passed — this counts toward the topic.' : 'Not passed yet. You need at least 2 correct. Review the explanations and try again.'}
            {score.unanswered > 0 && ` ${score.unanswered} unanswered.`}
          </p>
          <ol className="quiz-review">
            {quiz.questions.map((q, i) => {
              const a = session.answers[i]
              const correct = a === q.correctIndex
              return (
                <li key={q.id} className={`quiz-review__item ${a === null ? 'is-skipped' : correct ? 'is-correct' : 'is-wrong'}`}>
                  <p className="quiz-review__q"><span className="status-text">{a === null ? 'Unanswered' : correct ? 'Correct' : 'Incorrect'}</span> {q.prompt}</p>
                  {a !== null && !correct && <p className="small">Your answer: {q.options[a]}</p>}
                  <p className="small">Correct answer: {q.options[q.correctIndex]}</p>
                  <p className="muted small">{q.explanation}</p>
                  {!correct && (
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => {
                      dispatch({ type: 'ADD_ERROR', entry: { id: `err-${Date.now()}-${q.id}`, source: 'quiz', topicId, refId: q.id, title: q.prompt, detail: `Correct answer: ${q.options[q.correctIndex]}. ${q.explanation}`, status: 'open', createdAt: Date.now() } })
                      toast.show('Added to your Error Notebook.')
                    }}>Save to Error Notebook</button>
                  )}
                </li>
              )
            })}
          </ol>
          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={start}>Retry quiz</button>
            <Link className="btn btn--secondary" to={lessonPath(topicId)}>Back to the lesson</Link>
            {challenge && <Link className="btn btn--secondary" to={practicePath(challenge.id)}>Practise this topic</Link>}
          </div>
        </section>
      </div>
    )
  }

  // ---- Question flow ----
  const qi = session.index
  const q = quiz.questions[qi]
  const checked = session.checked[qi]
  const skipped = session.skipped[qi]
  const chosen = session.answers[qi]
  const isLast = qi === n - 1
  const correct = chosen === q.correctIndex

  const onNext = () => {
    if (isLast) {
      if (!allChecked(session)) return
      const done = finish(session)
      const sc = scoreSession(done, quiz)
      dispatch({ type: 'QUIZ_FINISH', topicId, session: done, correct: sc.correct, total: sc.total })
      setTimeout(() => resultsHeading.current?.focus(), 0)
    } else update(goTo(session, qi + 1))
  }

  return (
    <div className="page page--narrow">
      {header}
      <section className="card quiz-card" aria-labelledby="q-h">
        <div className="quiz-progress">
          <span id="q-h">Question {qi + 1} of {n}</span>
          <progress value={session.checked.filter(Boolean).length} max={n} aria-label={`${session.checked.filter(Boolean).length} of ${n} questions answered`} />
        </div>
        <fieldset className="quiz-fieldset" disabled={checked}>
          <legend className="quiz-q">{q.prompt}</legend>
          <div className="quiz-options">
            {q.options.map((opt, oi) => {
              const isChosen = chosen === oi
              const cls = checked ? (oi === q.correctIndex ? 'is-correct' : isChosen ? 'is-wrong' : '') : isChosen ? 'is-selected' : ''
              return (
                <label key={oi} className={`quiz-option ${cls}`}>
                  <input type="radio" name={`q-${q.id}`} checked={isChosen} onChange={() => update(selectOption(session, qi, oi))} />
                  <span className="quiz-option__text">{opt}</span>
                  {checked && oi === q.correctIndex && <span className="quiz-option__tag"><Icon name="check" size={16} />Correct answer</span>}
                  {checked && isChosen && oi !== q.correctIndex && <span className="quiz-option__tag"><Icon name="x" size={16} />Your answer</span>}
                </label>
              )
            })}
          </div>
        </fieldset>
        {checked && (
          <div className={`feedback ${skipped ? 'feedback--neutral' : correct ? 'feedback--good' : 'feedback--bad'}`} role="status">
            <strong>{skipped ? 'Skipped' : correct ? 'Correct' : 'Not quite'}</strong>
            <p>{q.explanation}</p>
          </div>
        )}
        <div className="quiz-actions">
          <button type="button" className="btn btn--ghost" disabled={qi === 0} onClick={() => update(goTo(session, qi - 1))}><Icon name="arrow-left" size={18} />Previous</button>
          {!checked ? (
            <>
              <button type="button" className="btn btn--secondary" onClick={() => update(skipQuestion(session, qi))}>Skip question</button>
              <button type="button" className="btn btn--primary" disabled={chosen === null} onClick={() => { update(checkAnswer(session, qi)); setTimeout(() => nextBtn.current?.focus(), 0) }}>Check answer</button>
            </>
          ) : (
            <button type="button" ref={nextBtn} className="btn btn--primary" disabled={isLast && !allChecked(session)} onClick={onNext}>
              {isLast ? 'See results' : 'Next question'}<Icon name="arrow-right" size={18} />
            </button>
          )}
        </div>
        {!checked && chosen === null && <p className="muted small">Select an answer to check it, or skip this question.</p>}
        {checked && isLast && !allChecked(session) && <p className="muted small">Go back and check or skip the remaining questions to see your results.</p>}
      </section>
    </div>
  )
}
