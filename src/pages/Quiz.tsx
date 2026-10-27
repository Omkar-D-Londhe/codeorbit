import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { challengesForTopic } from '../data/challenges'
import { getTopic } from '../data/curriculum'
import { getQuiz } from '../data/quizzes'
import { Icon } from '../components/Icon'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle } from '../lib/hooks'
import {
  allChecked,
  checkAnswer,
  finish,
  goTo,
  isPass,
  newSession,
  scoreQuestion,
  scoreSession,
  setAnswer,
  skipQuestion,
  type QuizSession,
} from '../lib/quiz'
import { lessonPath, practicePath, trackPath } from '../lib/routes'
import { useApp } from '../state/AppState'
import { useClock } from '../core/time/Clock'
import { ChoiceQuestion } from '../core/learning/questions/ChoiceQuestion'
import { OutputPredictorQuestion } from '../core/learning/questions/OutputPredictorQuestion'
import { SorterQuestion } from '../core/learning/questions/SorterQuestion'
import { SpotBugQuestion } from '../core/learning/questions/SpotBugQuestion'
import { BlankQuestion } from '../core/learning/questions/BlankQuestion'
import { QuizTimer } from '../core/learning/QuizTimer'
import { QuizBreakdown } from '../core/learning/QuizBreakdown'
import { useActiveTime } from '../core/insights/activeTime'
import type { QuizAnswer, ChoiceQuizQuestion, OutputPredictorQuizQuestion, SorterQuizQuestion, SpotBugQuizQuestion, BlankQuizQuestion } from '../data/types'
import NotFound from './NotFound'

export default function QuizPage() {
  const { topicId = '' } = useParams()
  useActiveTime(topicId)
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
  const now = useClock()
  const session = state.quizSessions[topicId]
  const nextBtn = useRef<HTMLButtonElement>(null)
  const resultsHeading = useRef<HTMLHeadingElement>(null)
  const challenge = challengesForTopic(topicId)[0]
  const n = quiz.questions.length

  const [timedMode, setTimedMode] = useState<boolean>(false)

  useEffect(() => {
    dispatch({ type: 'VISIT', topicId, activity: 'quiz', now: Date.now() })
  }, [topicId, dispatch])

  const update = (s: QuizSession) => dispatch({ type: 'QUIZ_UPDATE', topicId, session: s })
  const start = () => update(newSession(n, timedMode, timedMode ? n * 60 : undefined))

  const crumbs = [
    { label: 'Explore', to: '/explore' },
    { label: topic.technologyId.toUpperCase(), to: trackPath(topic.technologyId) },
    { label: topic.title, to: lessonPath(topicId) },
    { label: 'Quick quiz' },
  ]
  const header = <PageHeader crumbs={crumbs} title={`Quick quiz: ${topic.title}`} />

  const handleTimeExpire = () => {
    if (!session || session.finished) return
    // Auto-check any remaining questions as skipped/unanswered
    let updated = { ...session }
    for (let i = 0; i < n; i++) {
      if (!updated.checked[i]) {
        updated = skipQuestion(updated, i)
      }
    }
    const done = finish(updated)
    const sc = scoreSession(done, quiz)
    dispatch({ type: 'QUIZ_FINISH', topicId, session: done, correct: sc.correct, total: sc.total, now: now() })
    setTimeout(() => resultsHeading.current?.focus(), 0)
  }

  if (!session) {
    const best = state.topics[topicId]?.quizBest
    const passThreshold = Math.ceil((n * 2) / 3)

    return (
      <div className="page page--narrow">
        {header}
        <section className="card quiz-card">
          <p>
            {n} questions, one at a time. Check each answer to see an explanation. You pass with at least {passThreshold} correct.
          </p>
          {best && (
            <p className="muted">
              Your best score so far: {best.correct} of {best.total}.
            </p>
          )}

          <div
            className="quiz-timed-option"
            style={{
              padding: '12px 16px',
              background: 'var(--surface-raised, #242235)',
              border: '1px solid var(--border, #3a3556)',
              borderRadius: 'var(--r-md, 8px)',
              margin: 'var(--s-4, 16px) 0',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={timedMode}
                onChange={(e) => setTimedMode(e.target.checked)}
              />
              <span>Enable timed challenge mode (60s per question)</span>
            </label>
            <p className="muted small" style={{ margin: '6px 0 0 28px' }}>
              Timed mode gives you a calm timer ({n * 60} seconds total). If time expires, unanswered questions are marked incorrect and the quiz is submitted. The timer pauses if you switch tabs.
            </p>
          </div>

          <div className="btn-row">
            <button type="button" className="btn btn--primary btn--lg" onClick={start}>
              Start quiz
            </button>
            <Link className="btn btn--ghost btn--lg" to={lessonPath(topicId)}>
              Review the lesson first
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // ---- Results ----
  if (session.finished) {
    const score = scoreSession(session, quiz)
    const passed = isPass(score)
    const passThreshold = Math.ceil((score.total * 2) / 3)

    return (
      <div className="page page--narrow">
        {header}
        <section className="card quiz-card" aria-labelledby="res-h">
          <h2 id="res-h" ref={resultsHeading} tabIndex={-1} className="quiz-score">
            <Icon name={passed ? 'check' : 'info'} size={26} />
            {score.correct} of {score.total} correct
          </h2>
          <p className={passed ? 'success-text' : 'muted'}>
            {passed
              ? 'Passed — this counts toward the topic.'
              : `Not passed yet. You need at least ${passThreshold} correct. Review the explanations below and try again.`}
            {score.unanswered > 0 && ` ${score.unanswered} unanswered.`}
          </p>

          <QuizBreakdown quiz={quiz} session={session} topicId={topicId} />

          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={start}>
              Retry quiz
            </button>
            <Link className="btn btn--secondary" to={lessonPath(topicId)}>
              Back to the lesson
            </Link>
            {challenge && (
              <Link className="btn btn--secondary" to={practicePath(challenge.id)}>
                Practise this topic
              </Link>
            )}
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
  const isCorrect = scoreQuestion(q, chosen) === 1

  const isAnswerValid =
    chosen !== null &&
    (q.kind !== 'blank' || (typeof chosen === 'string' && chosen.trim().length > 0))

  const onNext = () => {
    if (isLast) {
      if (!allChecked(session)) return
      const done = finish(session)
      const sc = scoreSession(done, quiz)
      dispatch({ type: 'QUIZ_FINISH', topicId, session: done, correct: sc.correct, total: sc.total, now: now() })
      setTimeout(() => resultsHeading.current?.focus(), 0)
    } else {
      update(goTo(session, qi + 1))
    }
  }

  const handleSelectAnswer = (ans: QuizAnswer) => {
    update(setAnswer(session, qi, ans))
  }

  return (
    <div className="page page--narrow">
      {header}
      <section className="card quiz-card" aria-labelledby="q-h">
        <div
          className="quiz-progress"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, marginRight: '16px' }}>
            <span id="q-h">Question {qi + 1} of {n}</span>
            <progress
              value={session.checked.filter(Boolean).length}
              max={n}
              aria-label={`${session.checked.filter(Boolean).length} of ${n} questions answered`}
            />
          </div>
          {session.timed && (
            <QuizTimer
              initialSeconds={session.timeLeft ?? n * 60}
              onExpire={handleTimeExpire}
              onTick={(left) => {
                session.timeLeft = left
              }}
              active={!session.finished}
            />
          )}
        </div>

        {/* Dynamic question rendering by kind */}
        {(!q.kind || q.kind === 'choice') && (
          <ChoiceQuestion
            question={q as ChoiceQuizQuestion}
            chosen={typeof chosen === 'number' ? chosen : null}
            checked={checked}
            onSelect={handleSelectAnswer}
          />
        )}
        {q.kind === 'output' && (
          <OutputPredictorQuestion
            question={q as OutputPredictorQuizQuestion}
            chosen={typeof chosen === 'string' ? chosen : null}
            checked={checked}
            onSelect={handleSelectAnswer}
          />
        )}
        {q.kind === 'sort' && (
          <SorterQuestion
            question={q as SorterQuizQuestion}
            chosen={Array.isArray(chosen) ? chosen : null}
            checked={checked}
            onSelect={handleSelectAnswer}
          />
        )}
        {q.kind === 'bug' && (
          <SpotBugQuestion
            question={q as SpotBugQuizQuestion}
            chosen={typeof chosen === 'number' ? chosen : null}
            checked={checked}
            onSelect={handleSelectAnswer}
          />
        )}
        {q.kind === 'blank' && (
          <BlankQuestion
            question={q as BlankQuizQuestion}
            chosen={typeof chosen === 'string' ? chosen : null}
            checked={checked}
            onSelect={handleSelectAnswer}
          />
        )}

        {checked && (
          <div
            className={`feedback ${skipped ? 'feedback--neutral' : isCorrect ? 'feedback--good' : 'feedback--bad'}`}
            role="status"
          >
            <strong>{skipped ? 'Skipped' : isCorrect ? 'Correct' : 'Not quite'}</strong>
            <p>{q.explanation}</p>
          </div>
        )}

        <div className="quiz-actions">
          <button
            type="button"
            className="btn btn--ghost"
            disabled={qi === 0}
            onClick={() => update(goTo(session, qi - 1))}
          >
            <Icon name="arrow-left" size={18} />
            Previous
          </button>
          {!checked ? (
            <>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => update(skipQuestion(session, qi))}
              >
                Skip question
              </button>
              <button
                type="button"
                className="btn btn--primary"
                disabled={!isAnswerValid}
                onClick={() => {
                  update(checkAnswer(session, qi))
                  setTimeout(() => nextBtn.current?.focus(), 0)
                }}
              >
                Check answer
              </button>
            </>
          ) : (
            <button
              type="button"
              ref={nextBtn}
              className="btn btn--primary"
              disabled={isLast && !allChecked(session)}
              onClick={onNext}
            >
              {isLast ? 'See results' : 'Next question'}
              <Icon name="arrow-right" size={18} />
            </button>
          )}
        </div>

        {!checked && !isAnswerValid && (
          <p className="muted small">Select or type an answer to check it, or skip this question.</p>
        )}
        {checked && isLast && !allChecked(session) && (
          <p className="muted small">Go back and check or skip the remaining questions to see your results.</p>
        )}
      </section>
    </div>
  )
}
