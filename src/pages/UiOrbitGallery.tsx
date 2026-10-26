import { useState } from 'react'
import { topics as htmlTopics, groups as htmlGroups, getTechnology } from '../data/curriculum'
import { defaultTrackId } from '../core/content/registry'
import { ConstellationOrbit } from '../core/orbit/constellation/ConstellationOrbit'
import type { TopicProgress } from '../lib/progress'

export default function UiOrbitGallery() {
  const [activeFixture, setActiveFixture] = useState<'mixed' | 'all-available' | 'all-complete'>('mixed')

  const trackId = defaultTrackId() || ''
  const tech = getTechnology(trackId)!

  // Injected fixture progress covering all 4 states + mastered
  // html-structure: mastered (3/3)
  // elements-attributes: completed (3/3)
  // headings-paragraphs: in-progress (1/3)
  // text-semantics: in-progress (2/3)
  // lists: available
  // links: available
  // images: locked (advisory)
  // tables: locked
  // forms: locked
  // semantic-layout: locked
  // accessibility: locked
  // putting-together: locked
  const fixtureProgress: Record<string, TopicProgress> = {
    'html-structure': {
      status: 'mastered',
      lessonDone: true,
      quizPassed: true,
      quizPerfect: true,
      practiceDone: true,
      usedSolution: false,
      touched: true,
      parts: 3,
      partsTotal: 3,
    },
    'elements-attributes': {
      status: 'completed',
      lessonDone: true,
      quizPassed: true,
      quizPerfect: false,
      practiceDone: true,
      usedSolution: false,
      touched: true,
      parts: 3,
      partsTotal: 3,
    },
    'headings-paragraphs': {
      status: 'in-progress',
      lessonDone: true,
      quizPassed: false,
      quizPerfect: false,
      practiceDone: false,
      usedSolution: false,
      touched: true,
      parts: 1,
      partsTotal: 3,
    },
    'text-semantics': {
      status: 'in-progress',
      lessonDone: true,
      quizPassed: true,
      quizPerfect: false,
      practiceDone: false,
      usedSolution: false,
      touched: true,
      parts: 2,
      partsTotal: 3,
    },
  }

  return (
    <div className="page page--wide" style={{ padding: '24px 0' }}>
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--surface-raised, #242235)',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>
            Constellation Orbit UI Fixture (Dev-Only: /__ui/orbit)
          </h1>
          <p className="small muted" style={{ margin: 0 }}>
            Mocked progress fixtures (never written to storage). Covers all 4 states (Mastered, Completed, In-Progress, Available, Locked).
          </p>
        </div>

        <div className="segmented-control">
          <button
            type="button"
            className={`btn btn--sm ${activeFixture === 'mixed' ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => setActiveFixture('mixed')}
          >
            Mixed States (All 4)
          </button>
        </div>
      </div>

      <ConstellationOrbit
        technologyId={tech.id}
        technologyName={tech.name}
        technologyGlyph={tech.glyph}
        technologyDescription={tech.description}
        topics={htmlTopics}
        groups={htmlGroups}
        injectedProgress={activeFixture === 'mixed' ? fixtureProgress : undefined}
      />
    </div>
  )
}
