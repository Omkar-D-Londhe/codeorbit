import { useCallback } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getTechnology, getTopic, topicsFor } from '../data/curriculum'
import { LearningOrbit } from '../components/orbit/LearningOrbit'
import { TopicDetail } from '../components/orbit/TopicDetail'
import { PageHeader } from '../components/PageHeader'
import { useDocumentTitle } from '../lib/hooks'
import { topicProgress, trackProgress } from '../lib/progress'
import { useApp } from '../state/AppState'

export default function Track() {
  const { technologyId = '' } = useParams()
  const tech = getTechnology(technologyId)
  if (!tech || tech.status !== 'available') return <Navigate to="/explore" replace />
  return <TrackInner technologyId={tech.id} name={tech.name} />
}

function TrackInner({ technologyId, name }: { technologyId: string; name: string }) {
  useDocumentTitle(`${name} track`)
  const { state, dispatch } = useApp()
  const list = topicsFor(technologyId)
  const stored = state.selectedTopicId ? getTopic(state.selectedTopicId) : undefined
  // Restore a real previous selection; otherwise start at the first topic (no invented progress).
  const selected = stored && stored.technologyId === technologyId ? stored : list[0]
  const progressOf = useCallback((id: string) => topicProgress(state, getTopic(id)!), [state])
  const tp = trackProgress(state, technologyId)
  const select = useCallback((id: string) => dispatch({ type: 'SELECT_TOPIC', topicId: id }), [dispatch])

  return (
    <div className="page page--wide">
      <PageHeader
        crumbs={[{ label: 'Explore', to: '/explore' }, { label: name }]}
        title={`${name} Learning Orbit`}
        lede={`${tp.completedTopics} of ${tp.totalTopics} topics complete · ${tp.parts} of ${tp.partsTotal} steps done. Select a topic on the strip or the arch.`}
      />
      <section className="card orbit-card" aria-label={`${name} Learning Orbit`}>
        <LearningOrbit topics={list} selectedId={selected.id} progressOf={progressOf} onSelect={select} />
      </section>
      <TopicDetail
        topic={selected}
        progress={progressOf(selected.id)}
        bookmarked={state.bookmarks.includes(selected.id)}
        hasNote={!!state.notes[selected.id]}
        onSelect={select}
      />
    </div>
  )
}
