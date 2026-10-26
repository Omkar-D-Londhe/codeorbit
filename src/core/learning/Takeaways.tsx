import { Icon } from '../../components/Icon'

export interface TakeawaysProps {
  takeaways?: string[]
  className?: string
}

/**
 * Key Takeaways Summary Box (4.8).
 * Quiet neutral card presenting 3-5 core takeaways without using lime/success accent.
 * Renders nothing if takeaways is absent or empty.
 */
export function Takeaways({ takeaways, className = '' }: TakeawaysProps) {
  if (!takeaways || takeaways.length === 0) return null

  return (
    <aside className={`takeaways-box ${className}`} aria-labelledby="takeaways-heading">
      <div className="takeaways-box__header">
        <Icon name="star" size={18} />
        <h2 id="takeaways-heading" className="takeaways-box__title">
          Key Takeaways
        </h2>
      </div>
      <ul className="takeaways-box__list" role="list">
        {takeaways.map((point, index) => (
          <li key={index} className="takeaways-box__item">
            {point}
          </li>
        ))}
      </ul>
    </aside>
  )
}
