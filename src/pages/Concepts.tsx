import { useState, useMemo } from 'react'
import { concepts, CONCEPT_AREAS } from '../core/concepts/concepts'
import { HTML_TECH_ID } from '../data/curriculum.ts'
import { ConceptCard } from '../core/concepts/ConceptCard'
import { useDocumentTitle } from '../lib/hooks'
import { Icon } from '../components/Icon'
import '../core/concepts/conceptAtlas.css'

export default function Concepts() {
  useDocumentTitle('Concept Atlas')

  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredConcepts = useMemo(() => {
    return concepts.filter((concept) => {
      if (selectedArea !== 'all' && concept.area !== selectedArea) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesId = concept.id.toLowerCase().includes(q)
        const matchesTitle = concept.title.toLowerCase().includes(q)
        const matchesSummary = concept.summary.toLowerCase().includes(q)
        const matchesArea = String(concept.area).toLowerCase().includes(q)
        if (!matchesId && !matchesTitle && !matchesSummary && !matchesArea) {
          return false
        }
      }
      return true
    })
  }, [selectedArea, searchQuery])

  // Stats calculation
  const totalCount = concepts.length
  const appliedCount = concepts.filter((c) => !!c.platformUse).length
  const plannedCount = concepts.filter((c) => {
    const primary = c.teachIn[0]
    return primary && primary.trackId !== HTML_TECH_ID
  }).length

  return (
    <div className="concept-atlas page" data-testid="concept-atlas-page">
      <header className="concept-atlas__header">
        <h1 className="concept-atlas__title">Frontend Concept Atlas</h1>
        <p className="concept-atlas__subtitle">
          Every core frontend concept mapped to how CodeOrbit actually uses it, where it is
          taught, its live challenge exercises, and its automated tests. No invented claims.
        </p>
        <div className="concept-atlas__stats">
          <span className="concept-stat-badge">
            <strong>{totalCount}</strong> Total Concepts
          </span>
          <span className="concept-stat-badge">
            <strong>{appliedCount}</strong> Applied in Platform
          </span>
          <span className="concept-stat-badge">
            <strong>{totalCount - appliedCount}</strong> Teaching-only
          </span>
          <span className="concept-stat-badge">
            <strong>{plannedCount}</strong> Planned
          </span>
          <span className="concept-stat-badge">
            Showing <strong>{filteredConcepts.length}</strong>
          </span>
        </div>
      </header>

      <section className="concept-atlas__toolbar" aria-label="Concept Atlas filters">
        <div className="concept-atlas__search">
          <span className="concept-atlas__search-icon" aria-hidden="true">
            <Icon name="search" size={18} />
          </span>
          <input
            type="search"
            className="concept-atlas__search-input"
            placeholder="Search concepts (e.g. Flexbox, FC-13, form, tables)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search concepts by name, ID or description"
          />
        </div>

        <div className="concept-atlas__filters" role="group" aria-label="Filter by topic area">
          <button
            type="button"
            className={`concept-filter-pill${selectedArea === 'all' ? ' is-active' : ''}`}
            onClick={() => setSelectedArea('all')}
            aria-pressed={selectedArea === 'all'}
          >
            All Areas ({totalCount})
          </button>

          {CONCEPT_AREAS.map((area) => {
            const count = concepts.filter((c) => c.area === area.id).length
            const active = selectedArea === area.id
            return (
              <button
                key={area.id}
                type="button"
                className={`concept-filter-pill${active ? ' is-active' : ''}`}
                onClick={() => setSelectedArea(area.id)}
                aria-pressed={active}
                data-testid={`filter-area-${area.id}`}
              >
                {area.label} ({count})
              </button>
            )
          })}
        </div>
      </section>

      {filteredConcepts.length === 0 ? (
        <div className="empty" data-testid="concepts-empty-state">
          <h3>No matching frontend concepts found</h3>
          <p>Try adjusting your search query or switching to another area filter.</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              setSelectedArea('all')
              setSearchQuery('')
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <section
          className="concept-grid"
          aria-label="Frontend concepts grid"
          data-testid="concept-cards-grid"
        >
          {filteredConcepts.map((concept) => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </section>
      )}
    </div>
  )
}
