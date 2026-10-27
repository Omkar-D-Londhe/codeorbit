import { useCallback, useMemo } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { getTechnology, getTopic, topicsFor, groups } from '../data/curriculum'
import { LearningOrbit } from '../components/orbit/LearningOrbit'
import { TopicDetail } from '../components/orbit/TopicDetail'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../lib/hooks'
import { topicProgress, trackProgress } from '../lib/progress'
import { masteryPath } from '../lib/routes'
import { useApp } from '../state/AppState'
import { ConstellationOrbit } from '../core/orbit/constellation/ConstellationOrbit'
import { fuzzy } from '../core/search/fuzzy'

export default function Track() {
  const { technologyId = '' } = useParams()
  const tech = getTechnology(technologyId)
  if (!tech || tech.status !== 'available') return <Navigate to="/explore" replace />
  return <TrackInner technologyId={tech.id} name={tech.name} glyph={tech.glyph} description={tech.description} />
}

function TrackInner({
  technologyId,
  name,
  glyph,
  description,
}: {
  technologyId: string
  name: string
  glyph: string
  description: string
}) {
  useDocumentTitle(`${name} track`)
  const [searchParams, setSearchParams] = useSearchParams()
  const isLegacy = searchParams.get('orbit') === 'legacy'
  const statusParam = searchParams.get('status') || 'all'
  const tagParam = searchParams.get('tag') || ''
  const searchParam = searchParams.get('search') || searchParams.get('q') || ''

  const { state, dispatch } = useApp()
  const list = topicsFor(technologyId)
  const stored = state.selectedTopicId ? getTopic(state.selectedTopicId) : undefined
  // Restore a real previous selection; otherwise start at the first topic (no invented progress).
  const selected = stored && stored.technologyId === technologyId ? stored : list[0]
  const progressOf = useCallback((id: string) => topicProgress(state, getTopic(id)!), [state])
  const tp = trackProgress(state, technologyId)
  const select = useCallback((id: string) => dispatch({ type: 'SELECT_TOPIC', topicId: id }), [dispatch])

  // Collect all unique tags for this track
  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const t of list) {
      for (const tg of t.tags ?? []) set.add(tg)
    }
    return Array.from(set).sort()
  }, [list])

  // Determine filtered topics
  const isFiltered = statusParam !== 'all' || Boolean(tagParam) || Boolean(searchParam)

  const matchingTopics = useMemo(() => {
    if (!isFiltered) return list

    return list.filter((t) => {
      // 1. Status filter
      if (statusParam !== 'all') {
        const p = topicProgress(state, t)
        if (statusParam === 'completed' && p.status !== 'completed' && p.status !== 'mastered') return false
        if (statusParam === 'in-progress' && p.status !== 'in-progress') return false
        if (statusParam === 'available' && (p.status === 'completed' || p.status === 'mastered' || p.status === 'in-progress')) return false
      }

      // 2. Tag filter
      if (tagParam && !(t.tags ?? []).includes(tagParam)) {
        return false
      }

      // 3. Search query filter
      if (searchParam) {
        const matchesTitle = fuzzy(searchParam, t.title) !== null
        const matchesDesc = fuzzy(searchParam, t.description) !== null
        const matchesTag = (t.tags ?? []).some((tg) => fuzzy(searchParam, tg) !== null)
        if (!matchesTitle && !matchesDesc && !matchesTag) return false
      }

      return true
    })
  }, [list, isFiltered, statusParam, tagParam, searchParam, state])

  const highlightIds = isFiltered ? matchingTopics.map((t) => t.id) : null
  const liveAnnouncement = isFiltered ? `${matchingTopics.length} topics match` : ''

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams)
    if (val && val !== 'all') {
      next.set(key, val)
    } else {
      next.delete(key)
    }
    if (key === 'search') next.delete('q')
    setSearchParams(next, { replace: true })
  }

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('status')
    next.delete('tag')
    next.delete('search')
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  if (isLegacy) {
    return (
      <div className="page page--wide">
        <PageHeader
          crumbs={[{ label: 'Explore', to: '/explore' }, { label: name }]}
          title={`${name} Learning Orbit`}
          lede={`${tp.completedTopics} of ${tp.totalTopics} topics complete · ${tp.parts} of ${tp.partsTotal} steps done. Select a topic on the strip or the arch.`}
          actions={
            <Link className="btn btn--secondary btn--sm" to={masteryPath(technologyId)}>
              <Icon name="compass" size={16} /> Mastery map
            </Link>
          }
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

  return (
    <div className="page page--wide">
      <PageHeader
        crumbs={[{ label: 'Explore', to: '/explore' }, { label: name }]}
        title={`${name} Learning Orbit`}
        lede={`${tp.completedTopics} of ${tp.totalTopics} topics complete · ${tp.parts} of ${tp.partsTotal} steps done.`}
        actions={
          <Link className="btn btn--secondary btn--sm" to={masteryPath(technologyId)}>
            <Icon name="compass" size={16} /> Mastery map
          </Link>
        }
      />

      {/* 9.3 Filter bar & 2.8 Orbit search highlight */}
      <section className="orbit-filter-bar" aria-label="Filter topics in this track">
        <div className="orbit-filter-bar__search">
          <Icon name="search" size={16} className="orbit-filter-bar__icon" />
          <input
            type="search"
            className="input orbit-filter-input"
            placeholder="Filter topics by name or keyword..."
            value={searchParam}
            onChange={(e) => updateParam('search', e.target.value)}
            aria-label="Filter topics in this orbit"
          />
        </div>

        <div className="orbit-filter-bar__controls">
          <label className="orbit-filter-label">
            <span className="sr-only">Status filter</span>
            <select
              className="select select--sm"
              value={statusParam}
              onChange={(e) => updateParam('status', e.target.value)}
              aria-label="Filter by completion status"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          {allTags.length > 0 && (
            <label className="orbit-filter-label">
              <span className="sr-only">Tag filter</span>
              <select
                className="select select--sm"
                value={tagParam}
                onChange={(e) => updateParam('tag', e.target.value)}
                aria-label="Filter by tag"
              >
                <option value="">All tags</option>
                {allTags.map((tg) => (
                  <option key={tg} value={tg}>#{tg}</option>
                ))}
              </select>
            </label>
          )}

          {isFiltered && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={clearFilters}
              aria-label="Clear active filters"
            >
              <Icon name="close" size={14} /> Clear
            </button>
          )}
        </div>

        {/* 2.8 Screen-reader live region announcing match count */}
        {liveAnnouncement ? (
          <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="orbit-filter-announcer"
          >
            {liveAnnouncement}
          </div>
        ) : null}
      </section>

      <ConstellationOrbit
        technologyId={technologyId}
        technologyName={name}
        technologyGlyph={glyph}
        technologyDescription={description}
        topics={list}
        groups={groups}
        highlightIds={highlightIds}
      />
    </div>
  )
}
