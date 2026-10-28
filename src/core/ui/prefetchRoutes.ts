/**
 * Prefetches lazy-loaded route chunks on idle (Stage 17 §11)
 * so offline navigation is seamless and resilient.
 */
export function prefetchRoutesOnIdle(): void {
  if (typeof window === 'undefined') return

  const schedule = (cb: () => void) => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cb, { timeout: 2000 })
    } else {
      setTimeout(cb, 500)
    }
  }

  schedule(() => {
    // Prefetch core routes for offline availability
    void import('../../pages/Settings')
    void import('../../pages/Progress')
    void import('../../pages/Review')
    void import('../../pages/Explore')
    void import('../../pages/Track')
    void import('../../pages/Mastery')
    void import('../../pages/Lesson')
    void import('../../pages/Quiz')
    void import('../../pages/Practice')
    void import('../notes/NotesPage')
    void import('../notes/BookmarksPage')
  })
}
