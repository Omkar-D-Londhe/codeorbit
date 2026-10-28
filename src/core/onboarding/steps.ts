export type TourPlacement = 'top' | 'right' | 'bottom' | 'left'

export interface TourStep {
  id: string
  selector: string
  title: string
  body: string
  placement: TourPlacement
  requires?: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'orbit',
    selector: '[data-tour="orbit"]',
    title: 'Learning Orbit',
    body: 'Explore curriculum paths, discover prerequisites, and track mastery across cosmic constellations.',
    placement: 'bottom',
  },
  {
    id: 'lesson',
    selector: '[data-tour="lesson"]',
    title: 'Interactive Lessons',
    body: 'Study bite-sized conceptual lessons with live code previews, interactive examples, and study notes.',
    placement: 'bottom',
  },
  {
    id: 'practice',
    selector: '[data-tour="practice"]',
    title: 'Practice Lab',
    body: 'Tackle coding challenges in a real in-browser editor with instant automated feedback and hints.',
    placement: 'top',
  },
  {
    id: 'review',
    selector: '[data-tour="review"]',
    title: 'Error Notebook & Review',
    body: 'Review past mistakes, practice with spaced flashcards, and export your personal markdown notes.',
    placement: 'right',
  },
  {
    id: 'search',
    selector: '[data-tour="search"]',
    title: 'Command Palette & Shortcuts',
    body: 'Press Ctrl+K anytime to quickly jump between topics, search tools, and activate study modes.',
    placement: 'right',
  },
  {
    id: 'settings',
    selector: '[data-tour="settings"]',
    title: 'Accessibility & Settings',
    body: 'Customize font scaling, dyslexia-friendly typography, high-contrast themes, and daily study reminders.',
    placement: 'top',
  },
]
