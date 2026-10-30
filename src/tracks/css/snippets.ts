/**
 * CSS Snippet Library (Stage 22).
 * Pre-authored accessible and reusable CSS patterns for insertion into the editor.
 */

export interface Snippet {
  id: string
  title: string
  description: string
  code: string
}

export const CSS_SNIPPETS: Snippet[] = [
  {
    id: 'snip-css-border-box',
    title: 'Global border-box Reset',
    description: 'Ensures padding and border are contained within declared dimensions for all elements.',
    code: `*,
*::before,
*::after {
  box-sizing: border-box;
}`,
  },
  {
    id: 'snip-css-flex-center',
    title: 'Flexbox Perfect Centering',
    description: 'Centers items horizontally and vertically along both flex axes.',
    code: `.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
  },
  {
    id: 'snip-css-auto-grid',
    title: 'Responsive Auto-fit Grid',
    description: 'Adaptable multi-column card layout that reflows automatically without media queries.',
    code: `.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}`,
  },
  {
    id: 'snip-css-reduced-motion',
    title: 'Reduced Motion Guard',
    description: 'Disables transitions and animations for learners with motion sensitivity or vestibular disorders.',
    code: `@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`,
  },
  {
    id: 'snip-css-visually-hidden',
    title: 'Visually Hidden Screen-Reader Only',
    description: 'Hides content visually while keeping it fully announced by screen readers.',
    code: `.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}`,
  },
]
