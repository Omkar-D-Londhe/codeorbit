import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { useDocumentTitle } from '../lib/hooks'
import { trackProgress } from '../lib/progress'
import { trackPath, lessonPath, practicePath } from '../lib/routes'
import { useApp } from '../state/AppState'
import { getTracks } from '../core/content/registry'
import { challenges } from '../data/challenges'
import { fuzzy } from '../core/search/fuzzy'

const CAPABILITY_LABELS: Record<string, string> = {
  lessons: 'Lessons',
  quizzes: 'Quizzes',
  practice: 'Practice',
  preview: 'Preview',
  execution: 'Run',
  diagnostics: 'Analysis',
  complexity: 'Complexity',
  optimisation: 'Optimization',
  diff: 'Diff',
  snippets: 'Snippets',
  a11yLint: 'A11y Lint',
}

function getDeduplicatedCapabilities(capabilities: string[]): Array<{ id: string; label: string }> {
  const seenLabels = new Set<string>()
  const result: Array<{ id: string; label: string }> = []

  for (const cap of Array.from(new Set(capabilities))) {
    const label = CAPABILITY_LABELS[cap] || cap
    if (!seenLabels.has(label)) {
      seenLabels.add(label)
      result.push({ id: cap, label })
    }
  }
  return result
}

export default function Explore() {
  useDocumentTitle('Explore')
  const { state } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const statusParam = searchParams.get('status') || 'all'
  const tagParam = searchParams.get('tag') || ''
  const difficultyParam = searchParams.get('difficulty') || 'all'
  const searchParam = searchParams.get('search') || searchParams.get('q') || ''

  const allTracks = getTracks()
  const availableTracks = allTracks.filter((t) => t.availability === 'available' || t.availability === 'preview' || t.availability === 'decision-gated')
  const plannedTracks = allTracks.filter((t) => t.availability === 'planned')

  // Collect all available tags across all available tracks
  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const tr of availableTracks) {
      for (const top of tr.topics) {
        for (const tg of top.tags ?? []) set.add(tg)
      }
    }
    return Array.from(set).sort()
  }, [availableTracks])

  const isFiltered = statusParam !== 'all' || Boolean(tagParam) || difficultyParam !== 'all' || Boolean(searchParam)

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
    next.delete('difficulty')
    next.delete('search')
    next.delete('q')
    setSearchParams(next, { replace: true })
  }

  // Filtered tracks
  const filteredAvailable = useMemo(() => {
    if (statusParam === 'planned') return []
    return availableTracks.filter((t) => {
      if (searchParam) {
        const matchesName = fuzzy(searchParam, t.name) !== null
        const matchesDesc = fuzzy(searchParam, t.description) !== null
        const matchesTopic = t.topics.some(
          (top) => fuzzy(searchParam, top.title) !== null || (top.tags ?? []).some((tg) => fuzzy(searchParam, tg) !== null)
        )
        if (!matchesName && !matchesDesc && !matchesTopic) return false
      }
      if (tagParam) {
        const hasTag = t.topics.some((top) => (top.tags ?? []).includes(tagParam))
        if (!hasTag) return false
      }
      return true
    })
  }, [availableTracks, statusParam, searchParam, tagParam])

  const filteredPlanned = useMemo(() => {
    if (statusParam === 'available') return []
    if (tagParam || difficultyParam !== 'all') return [] // Planned tracks don't have topics/tags/challenges yet
    return plannedTracks.filter((t) => {
      if (searchParam) {
        const matchesName = fuzzy(searchParam, t.name) !== null
        const matchesDesc = fuzzy(searchParam, t.description) !== null
        if (!matchesName && !matchesDesc) return false
      }
      return true
    })
  }, [plannedTracks, statusParam, searchParam, tagParam, difficultyParam])

  // Matching topics and challenges when filters are active
  const matchingItems = useMemo(() => {
    if (!tagParam && difficultyParam === 'all' && !searchParam) return []

    const results: Array<{
      type: 'topic' | 'challenge'
      id: string
      title: string
      subtitle: string
      path: string
      tag?: string
      difficulty?: string
    }> = []

    for (const tr of availableTracks) {
      for (const top of tr.topics) {
        const hasTag = !tagParam || (top.tags ?? []).includes(tagParam)
        const matchesSearch = !searchParam || fuzzy(searchParam, top.title) !== null || (top.tags ?? []).some((tg) => fuzzy(searchParam, tg) !== null)

        if (hasTag && matchesSearch && difficultyParam === 'all') {
          results.push({
            type: 'topic',
            id: top.id,
            title: top.title,
            subtitle: `${tr.name} · Topic`,
            path: lessonPath(top.id),
            tag: top.tags?.[0],
          })
        }

        // Check challenges for this topic
        const chs = challenges.filter((c) => c.topicId === top.id)
        for (const ch of chs) {
          const matchesDiff = difficultyParam === 'all' || ch.difficulty === difficultyParam
          const matchesChSearch = !searchParam || fuzzy(searchParam, ch.title) !== null || matchesSearch
          if (hasTag && matchesDiff && matchesChSearch) {
            results.push({
              type: 'challenge',
              id: ch.id,
              title: ch.title,
              subtitle: `${tr.name} · ${ch.difficulty} challenge`,
              path: practicePath(ch.id),
              difficulty: ch.difficulty,
            })
          }
        }
      }
    }

    return results
  }, [availableTracks, tagParam, difficultyParam, searchParam])

  if (availableTracks.length === 0) {
    return (
      <div className="page">
        <PageHeader title="Explore technologies" lede="Choose a learning track to begin." />
        <EmptyState variant="tracks" icon="compass" title="No learning tracks are available yet">
          Learning tracks will appear here once registered.
        </EmptyState>
      </div>
    )
  }

  const primaryTrack = filteredAvailable[0]
  const otherAvailable = filteredAvailable.slice(1)
  const tp = primaryTrack ? trackProgress(state, primaryTrack.id) : null

  return (
    <div className="page" data-concept-id="fc-16">
      <PageHeader
        title="Explore technologies"
        lede="Filter tracks, topics and practice challenges by status, tag or difficulty."
        actions={
          <Link to="/create" className="btn btn--secondary btn--sm" data-concept-id="fc-18">
            <Icon name="plus" size={14} /> Create Challenge
          </Link>
        }
      />

      {/* Filter and Tag Bar */}
      <section className="orbit-filter-bar explore-filter-bar" data-concept-id="fc-13" aria-label="Explore filters">
        <div className="orbit-filter-bar__search">
          <Icon name="search" size={16} className="orbit-filter-bar__icon" />
          <input
            type="search"
            className="input orbit-filter-input"
            data-concept-id="fc-20"
            placeholder="Search technologies, topics, tags..."
            value={searchParam}
            onChange={(e) => updateParam('search', e.target.value)}
            aria-label="Filter explore catalog"
          />
        </div>

        <div className="orbit-filter-bar__controls" data-concept-id="fc-22">
          <label className="orbit-filter-label">
            <span className="sr-only">Track status</span>
            <select
              className="select select--sm"
              value={statusParam}
              onChange={(e) => updateParam('status', e.target.value)}
              aria-label="Filter by track status"
            >
              <option value="all">All statuses</option>
              <option value="available">Available now</option>
              <option value="planned">Coming later</option>
            </select>
          </label>

          {allTags.length > 0 && (
            <label className="orbit-filter-label">
              <span className="sr-only">Topic tag</span>
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

          <label className="orbit-filter-label">
            <span className="sr-only">Challenge difficulty</span>
            <select
              className="select select--sm"
              value={difficultyParam}
              onChange={(e) => updateParam('difficulty', e.target.value)}
              aria-label="Filter by challenge difficulty"
            >
              <option value="all">All difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>

          {isFiltered && (
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={clearFilters}
              aria-label="Clear explore filters"
            >
              <Icon name="close" size={14} /> Clear
            </button>
          )}
        </div>
      </section>

      {/* Primary Available Track */}
      {primaryTrack && tp && (
        <section className="card card--feature tech-feature" data-concept-id="fc-11 fc-01 fc-19" aria-labelledby={`${primaryTrack.id}-h`}>
          <div className="tech-glyph tech-glyph--lg" aria-hidden="true">{primaryTrack.glyph}</div>
          <div className="tech-feature__body">
            <p className="eyebrow" data-concept-id="fc-23">
              <span className={`badge ${primaryTrack.availability === 'preview' || primaryTrack.availability === 'decision-gated' ? 'badge--preview' : 'badge--available'}`}>
                {primaryTrack.availability === 'preview' || primaryTrack.availability === 'decision-gated' ? 'Preview' : 'Available'}
              </span>
              {primaryTrack.availability === 'preview' && (
                <span className="badge badge--subtle" style={{ marginLeft: '6px' }}>Structure check mode</span>
              )}
              {primaryTrack.availability === 'decision-gated' && (
                <span className="badge badge--subtle" data-testid="decision-pending-badge" style={{ marginLeft: '6px' }}>Decision pending</span>
              )}
            </p>
            <h2 id={`${primaryTrack.id}-h`} className="card__title card__title--lg">{primaryTrack.name}</h2>
            <p className="muted">{primaryTrack.description}</p>
            {primaryTrack.availability === 'decision-gated' && (
              <div className="decision-memo-callout" style={{ margin: '8px 0', padding: '8px 12px', background: 'var(--color-bg-subtle, rgba(255,255,255,0.04))', borderRadius: '6px', borderLeft: '3px solid var(--color-warning, #f59e0b)' }}>
                <p className="muted small" style={{ margin: 0 }}>
                  <strong>Execution decision pending (Gate O-05):</strong> Practice code execution is disabled pending architecture review.{' '}
                  <Link to="/concepts" className="link-subtle" style={{ textDecoration: 'underline' }}>View memo summary in Concept Atlas</Link>
                </p>
              </div>
            )}
            <ul className="meta-row" data-concept-id="fc-21">
              <li>{primaryTrack.topics.length} topics</li>
              <li>{primaryTrack.groups.length} groups</li>
              <li>{tp.completedTopics} of {tp.totalTopics} complete</li>
            </ul>
            {primaryTrack.capabilities.length > 0 && (
              <div className="track-capabilities" data-concept-id="fc-30" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0 16px 0' }}>
                {!primaryTrack.capabilities.includes('execution') && (
                  <span className="badge badge--pill badge--subtle" data-testid="capability-run-unavailable">
                    Run: not available
                  </span>
                )}
                {getDeduplicatedCapabilities(primaryTrack.capabilities).map((item) => (
                  <span key={item.id} className="badge badge--pill badge--subtle" data-testid={`capability-${item.id}`}>
                    {item.label}
                  </span>
                ))}
              </div>
            )}
            <Link className="btn btn--primary btn--lg" data-concept-id="fc-10" to={trackPath(primaryTrack.id)}>
              Open track<Icon name="arrow-right" size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Additional Available Tracks */}
      {otherAvailable.map((track) => {
        const otherTp = trackProgress(state, track.id)
        return (
          <section
            key={track.id}
            className="card card--feature tech-feature"
            style={{ marginTop: '20px' }}
            aria-labelledby={`${track.id}-h`}
          >
            <div className="tech-glyph tech-glyph--lg" aria-hidden="true" style={{ color: track.tint }}>
              {track.glyph}
            </div>
            <div className="tech-feature__body">
              <p className="eyebrow">
                <span className={`badge ${track.availability === 'preview' || track.availability === 'decision-gated' ? 'badge--preview' : 'badge--available'}`}>
                  {track.availability === 'preview' || track.availability === 'decision-gated' ? 'Preview' : 'Available'}
                </span>
                {track.availability === 'preview' && (
                  <span className="badge badge--subtle" style={{ marginLeft: '6px' }}>Structure check mode</span>
                )}
                {track.availability === 'decision-gated' && (
                  <span className="badge badge--subtle" data-testid="decision-pending-badge" style={{ marginLeft: '6px' }}>Decision pending</span>
                )}
              </p>
              <h2 id={`${track.id}-h`} className="card__title card__title--lg">{track.name}</h2>
              <p className="muted">{track.description}</p>
              {track.availability === 'decision-gated' && (
                <div className="decision-memo-callout" style={{ margin: '8px 0', padding: '8px 12px', background: 'var(--color-bg-subtle, rgba(255,255,255,0.04))', borderRadius: '6px', borderLeft: '3px solid var(--color-warning, #f59e0b)' }}>
                  <p className="muted small" style={{ margin: 0 }}>
                    <strong>Execution decision pending (Gate O-05):</strong> Practice code execution is disabled pending architecture review.{' '}
                    <Link to="/concepts" className="link-subtle" style={{ textDecoration: 'underline' }}>View memo summary in Concept Atlas</Link>
                  </p>
                </div>
              )}
              <ul className="meta-row">
                <li>{track.topics.length} topics</li>
                <li>{track.groups.length} groups</li>
                <li>{otherTp.completedTopics} of {otherTp.totalTopics} complete</li>
              </ul>
              {track.capabilities.length > 0 && (
                <div className="track-capabilities" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0 16px 0' }}>
                  {!track.capabilities.includes('execution') && (
                    <span className="badge badge--pill badge--subtle" data-testid="capability-run-unavailable">
                      Run: not available
                    </span>
                  )}
                  {getDeduplicatedCapabilities(track.capabilities).map((item) => (
                    <span key={item.id} className="badge badge--pill badge--subtle" data-testid={`capability-${item.id}`}>
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
              <Link className="btn btn--primary btn--lg" to={trackPath(track.id)}>
                Open track<Icon name="arrow-right" size={18} />
              </Link>
            </div>
          </section>
        )
      })}

      {/* Filtered Topics and Challenges list if tags or difficulties or search matched */}
      {matchingItems.length > 0 && (
        <section className="card card--quiet" style={{ marginTop: '24px', padding: '20px' }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Matching Topics & Challenges ({matchingItems.length})
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {matchingItems.map((item) => (
              <li key={`${item.type}-${item.id}`} className="card" style={{ padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span className="badge badge--subtle" style={{ textTransform: 'capitalize' }}>
                    {item.type}
                  </span>
                  {item.difficulty && (
                    <span className="badge badge--pill badge--subtle" style={{ fontSize: '11px' }}>
                      {item.difficulty}
                    </span>
                  )}
                  {item.tag && (
                    <span className="badge badge--pill badge--subtle" style={{ fontSize: '11px' }}>
                      #{item.tag}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '4px 0' }}>
                  <Link to={item.path} style={{ color: 'var(--text)', textDecoration: 'none' }} className="hover-underline">
                    {item.title}
                  </Link>
                </h3>
                <p className="muted small" style={{ margin: '0 0 10px 0' }}>{item.subtitle}</p>
                <Link to={item.path} className="btn btn--secondary btn--sm" style={{ width: '100%', justifyContent: 'center' }}>
                  {item.type === 'challenge' ? 'Start challenge' : 'View topic'} <Icon name="arrow-right" size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Custom & Shared Challenges */}
      {state.custom?.challenges && state.custom.challenges.length > 0 && (
        <section aria-labelledby="custom-challenges-title" style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 id="custom-challenges-title" className="section-title" style={{ margin: 0 }}>
              Custom &amp; Shared Challenges ({state.custom.challenges.length})
            </h2>
            <Link to="/create" className="btn btn--secondary btn--sm">
              <Icon name="plus" size={14} /> New Challenge
            </Link>
          </div>
          <ul className="preview-grid">
            {state.custom.challenges.map((cc) => (
              <li key={cc.id} className="card card--quiet">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <div>
                    <span className="badge badge--available" style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {cc.trackId.toUpperCase()} · {cc.difficulty}
                    </span>
                    <h3 className="card__title">{cc.title}</h3>
                    <p className="muted small">{cc.objective}</p>
                    <p className="muted small">{cc.requirements.length} requirement{cc.requirements.length === 1 ? '' : 's'}</p>
                  </div>
                </div>
                <div className="btn-row" style={{ marginTop: '12px' }}>
                  <Link to={`/practice/custom:${cc.id}`} className="btn btn--secondary btn--sm">
                    Practice Challenge
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Planned Tracks */}
      {filteredPlanned.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '32px' }}>Coming later</h2>
          <ul className="preview-grid">
            {filteredPlanned.map((t) => (
              <li key={t.id} className="card card--quiet preview-card" aria-label={`${t.name}: preview, not available yet`}>
                <div className="tech-glyph" aria-hidden="true">{t.glyph}</div>
                <div>
                  <h3 className="card__title">
                    {t.name} <span className="badge badge--preview">Preview</span>
                    {t.availability === 'decision-gated' ? (
                      <span className="badge badge--subtle" style={{ marginLeft: '6px' }}>Decision pending</span>
                    ) : (
                      <span className="badge badge--subtle" style={{ marginLeft: '6px' }}>Planned</span>
                    )}
                  </h3>
                  <p className="muted">{t.description}</p>
                  <p className="muted small">Not available yet — no lessons or checks exist for this track.</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* No results empty state */}
      {filteredAvailable.length === 0 && filteredPlanned.length === 0 && matchingItems.length === 0 && (
        <EmptyState variant="tracks" icon="compass" title="No matching tracks or topics">
          <p>No results matched your filters. Try clearing filters or searching for different keywords.</p>
          <button type="button" className="btn btn--secondary" onClick={clearFilters} style={{ marginTop: '12px' }}>
            Clear all filters
          </button>
        </EmptyState>
      )}
    </div>
  )
}
