import { useNavigate, Link } from 'react-router-dom'
import type { ConceptEntry } from './concepts'
import { setPendingHighlight } from './highlight'
import { getTechnology } from '../../data/curriculum.ts'
import { Icon } from '../../components/Icon'

export interface ConceptCardProps {
  concept: ConceptEntry
}

export function ConceptCard({ concept }: ConceptCardProps) {
  const navigate = useNavigate()

  const primaryTeach = concept.teachIn[0]
  const tech = primaryTeach ? getTechnology(primaryTeach.trackId) : undefined
  const isTrackAvailable = tech?.status === 'available'

  // Chip status determination
  let chipType: 'applied' | 'taught' | 'planned'
  let chipLabel: string

  if (isTrackAvailable) {
    if (concept.platformUse) {
      chipType = 'applied'
      chipLabel = 'Applied here + taught'
    } else {
      chipType = 'taught'
      chipLabel = 'Taught only'
    }
  } else {
    chipType = 'planned'
    chipLabel = 'Planned'
  }

  const handleSeeInCodeOrbit = () => {
    if (!concept.platformUse) return
    const route = concept.platformUse.route || '/explore'
    const configuredSelectors = concept.platformUse.selectors ?? []
    const explicitSelector = `[data-concept-id="${concept.id.toLowerCase()}"]`
    const candidateSelectors = [explicitSelector, ...configuredSelectors]
    const selector = configuredSelectors[0] || explicitSelector

    setPendingHighlight({
      selector,
      candidateSelectors,
      label: `${concept.id}: ${concept.title}`,
      route,
    })

    navigate(route)
  }

  const learnPath = isTrackAvailable && primaryTeach?.topicId
    ? `/lesson/${primaryTeach.topicId}`
    : undefined

  const tryPath = isTrackAvailable && primaryTeach?.challengeId
    ? `/practice/${primaryTeach.challengeId}`
    : undefined

  return (
    <article
      className="concept-card"
      aria-labelledby={`concept-${concept.id}-title`}
      data-testid={`concept-card-${concept.id}`}
    >
      <div className="concept-card__header">
        <div className="concept-card__id-wrap">
          <span className="concept-card__id">{concept.id}</span>
          <span className="concept-card__area">{concept.area}</span>
        </div>
        <span
          className={`concept-card__chip concept-card__chip--${chipType}`}
          data-testid={`concept-chip-${concept.id}`}
        >
          {chipType === 'applied' && <Icon name="check" size={14} />}
          {chipType === 'taught' && <Icon name="book" size={14} />}
          {chipType === 'planned' && <Icon name="clock" size={14} />}
          <span>{chipLabel}</span>
        </span>
      </div>

      <h3 id={`concept-${concept.id}-title`} className="concept-card__title">
        {concept.title}
      </h3>

      <p className="concept-card__summary">{concept.summary}</p>

      {/* Where CodeOrbit uses it */}
      <div className="concept-card__section">
        <div className="concept-card__section-label">
          <span>Where CodeOrbit uses it</span>
          {concept.platformUse?.route && (
            <span className="concept-card__code-tag">{concept.platformUse.route}</span>
          )}
        </div>

        {concept.platformUse ? (
          <>
            <p className="concept-card__section-body">{concept.platformUse.feature}</p>
            {concept.platformUse.sourceFiles.length > 0 && (
              <div className="concept-card__sources">
                {concept.platformUse.sourceFiles.map((sf) => (
                  <code key={sf} className="concept-card__code-tag">
                    {sf}
                  </code>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="concept-card__teaching-only">
            Teaching topic — CodeOrbit itself does not need this technique
          </div>
        )}
      </div>

      {/* Evidence & Verification */}
      <div className="concept-card__section">
        <div className="concept-card__section-label">
          <span>Verification & Tests</span>
          <span className="concept-card__code-tag">{concept.courseStatus}</span>
        </div>
        <div className="concept-card__tests-list">
          {concept.evidenceTests.map((t) => (
            <code key={t} className="concept-card__code-tag">
              {t.replace(/^src\/test\//, '')}
            </code>
          ))}
        </div>
        {concept.assessmentRef && (
          <div className="concept-card__section-body">
            Ref: <strong>{concept.assessmentRef}</strong>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="concept-card__actions">
        {concept.platformUse && (
          <button
            type="button"
            className="concept-card__btn concept-card__btn--accent"
            onClick={handleSeeInCodeOrbit}
            data-testid={`see-in-codeorbit-${concept.id}`}
          >
            <Icon name="eye" size={16} />
            <span>See it in CodeOrbit</span>
          </button>
        )}

        {learnPath ? (
          <Link
            to={learnPath}
            className="concept-card__btn"
            data-testid={`learn-${concept.id}`}
          >
            <Icon name="play" size={16} />
            <span>Learn it</span>
          </Link>
        ) : (
          <button
            type="button"
            className="concept-card__btn is-disabled"
            disabled
            title="Track planned"
            data-testid={`learn-${concept.id}-disabled`}
          >
            <Icon name="play" size={16} />
            <span>Learn it</span>
          </button>
        )}

        {tryPath ? (
          <Link
            to={tryPath}
            className="concept-card__btn"
            data-testid={`try-${concept.id}`}
          >
            <Icon name="code" size={16} />
            <span>Try it</span>
          </Link>
        ) : (
          <button
            type="button"
            className="concept-card__btn is-disabled"
            disabled
            title="Exercise planned"
            data-testid={`try-${concept.id}-disabled`}
          >
            <Icon name="code" size={16} />
            <span>Try it</span>
          </button>
        )}
      </div>
    </article>
  )
}
