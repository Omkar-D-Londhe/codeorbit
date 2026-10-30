import { HTML_TECH_ID } from '../../data/curriculum.ts'

export type ConceptArea =
  | typeof HTML_TECH_ID
  | 'css'
  | 'javascript'
  | 'bootstrap'
  | 'angular'
  | 'testing'
  | 'accessibility'

export interface ConceptPlatformUse {
  feature: string
  route?: string
  sourceFiles: string[]
  selectors?: string[]
}

export interface ConceptTeachIn {
  trackId: string
  topicId: string
  challengeId?: string
}

export interface ConceptEntry {
  id: string // e.g. 'FC-01'
  title: string
  summary: string
  area: ConceptArea
  platformUse?: ConceptPlatformUse
  teachIn: ConceptTeachIn[]
  evidenceTests: string[] // vitest file names
  courseStatus: 'pending-review' | 'verified' | 'not-required'
  assessmentRef?: string
}

export const CONCEPT_AREAS: Array<{ id: ConceptArea; label: string }> = [
  { id: HTML_TECH_ID, label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'bootstrap', label: 'Bootstrap' },
  { id: 'angular', label: 'Angular' },
  { id: 'testing', label: 'Testing' },
  { id: 'accessibility', label: 'Accessibility' },
]

export const concepts: ConceptEntry[] = [
  {
    id: 'FC-01',
    title: 'Document structure & landmarks',
    summary: 'HTML5 document skeleton including doctype, html, head, title, body and landmark regions.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Single-page shell structure with header, main content, and landmarks',
      route: '/explore',
      sourceFiles: ['index.html', 'src/components/Shell.tsx'],
      selectors: ['.page', '.page-header'],
    },
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'html-structure', challengeId: 'ch-html-structure' }],
    evidenceTests: ['src/test/curriculum.test.ts', 'src/test/validators.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-02',
    title: 'Headings, paragraphs & text formatting',
    summary: 'Semantic text hierarchy with h1-h6 headings, paragraphs, and inline text tags.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Page heading hierarchy and typography across views',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx', 'src/pages/Explore.tsx'],
      selectors: ['h1', 'p'],
    },
    teachIn: [
      { trackId: HTML_TECH_ID, topicId: 'headings-paragraphs', challengeId: 'ch-headings-paragraphs' },
      { trackId: HTML_TECH_ID, topicId: 'text-semantics', challengeId: 'ch-text-semantics' },
      { trackId: HTML_TECH_ID, topicId: 'text-semantics', challengeId: 'ch-html-formatting' },
    ],
    evidenceTests: ['src/test/curriculum.test.ts', 'src/test/validators.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-03',
    title: 'Lists & navigation sequences',
    summary: 'Unordered and ordered lists for site navigation, command items, and topic steps.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Shell navigation list and command palette list items',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx'],
      selectors: ['nav ul', 'nav li'],
    },
    teachIn: [
      { trackId: HTML_TECH_ID, topicId: 'lists', challengeId: 'ch-lists' },
      { trackId: HTML_TECH_ID, topicId: 'lists', challengeId: 'ch-html-nested-lists' },
    ],
    evidenceTests: ['src/test/curriculum.test.ts', 'src/test/validators.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-04',
    title: 'Images, SVG emblems & text alternatives',
    summary: 'SVG illustrations, emblem icons, and responsive graphic elements with text alternatives.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'SVG navigation icons, status emblems, and visual assets',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx'],
      selectors: ['svg'],
    },
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'images', challengeId: 'ch-images' }],
    evidenceTests: ['src/test/curriculum.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-05',
    title: 'Hyperlinks, skip links & anchor navigation',
    summary: 'Accessible skip links, internal routes, and fragment bookmarks.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Accessible skip to content link and routing anchors',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx'],
      selectors: ['.skip-link'],
    },
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'links', challengeId: 'ch-links' }],
    evidenceTests: ['src/test/curriculum.test.ts', 'src/test/app.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-06',
    title: 'Data tables with captions & headers',
    summary: 'Tabular data with captions, thead, tbody, and scoped column/row headers.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Challenge attempt heat matrix and time tracking tabular records',
      route: '/progress',
      sourceFiles: ['src/pages/Progress.tsx'],
      selectors: ['table.data-table'],
    },
    teachIn: [
      { trackId: HTML_TECH_ID, topicId: 'tables', challengeId: 'ch-tables' },
      { trackId: HTML_TECH_ID, topicId: 'tables', challengeId: 'ch-html-table-spans' },
    ],
    evidenceTests: ['src/test/insights/attemptHeat.test.ts', 'src/test/validators.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-07',
    title: 'Form controls & input validation',
    summary: 'Accessible input controls (text, radio, checkbox, range, file) with native validation.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Settings preferences and custom challenge authoring forms',
      route: '/settings',
      sourceFiles: ['src/pages/Settings.tsx'],
      selectors: ['input'],
    },
    teachIn: [
      { trackId: HTML_TECH_ID, topicId: 'forms', challengeId: 'ch-forms' },
      { trackId: HTML_TECH_ID, topicId: 'forms', challengeId: 'ch-html-advanced-forms' },
    ],
    evidenceTests: ['src/test/validators.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-08',
    title: 'Audio & video multimedia elements',
    summary: 'Native HTML5 audio and video elements with fallback content and subtitles.',
    area: HTML_TECH_ID,
    platformUse: undefined,
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'media-elements', challengeId: 'ch-media-elements' }],
    evidenceTests: ['src/test/voiceRead.test.tsx', 'src/test/curriculum.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-09',
    title: 'Semantic page regions & landmarks',
    summary: 'Semantic sectioning with header, nav, main, footer, section, and article.',
    area: HTML_TECH_ID,
    platformUse: {
      feature: 'Application shell landmarks establishing primary navigational regions',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx'],
      selectors: ['nav', 'header'],
    },
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'semantic-layout', challengeId: 'ch-semantic-layout' }],
    evidenceTests: ['src/test/curriculum.test.ts', 'src/test/app.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-10',
    title: 'CSS selectors, cascading & states',
    summary: 'Element, class, pseudo-class (:hover, :focus-visible) selectors and cascade rules.',
    area: 'css',
    platformUse: {
      feature: 'Design token typography and interactive button hover/focus states',
      route: '/explore',
      sourceFiles: ['src/styles/components.css'],
      selectors: ['button', 'a'],
    },
    teachIn: [
      { trackId: 'css', topicId: 'selectors' },
      { trackId: 'css', topicId: 'cascade-specificity' },
    ],
    evidenceTests: ['src/test/contrast.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-11',
    title: 'Box model, borders & custom properties',
    summary: 'Content, padding, border, margin box model and CSS custom properties (variables).',
    area: 'css',
    platformUse: {
      feature: 'Spacing system, card containers, and CSS custom property theme tokens',
      route: '/explore',
      sourceFiles: ['src/styles/tokens.css'],
      selectors: ['.tech-feature', '.card--feature'],
    },
    teachIn: [
      { trackId: 'css', topicId: 'box-model' },
      { trackId: 'css', topicId: 'colour-typography' },
    ],
    evidenceTests: ['src/test/contrast.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-12',
    title: 'Float layout & clear mechanics',
    summary: 'Legacy multi-column layouts and text wrapping using float and clear.',
    area: 'css',
    platformUse: undefined,
    teachIn: [{ trackId: 'css', topicId: 'float-and-clear' }],
    evidenceTests: ['src/test/curriculum.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-13',
    title: 'Flexbox one-dimensional layout',
    summary: 'Flex container axes, alignment, distribution, and wrapping for responsive bars.',
    area: 'css',
    platformUse: {
      feature: 'Shell header, navigation bar, and toolbar cluster arrangements',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx'],
      selectors: ['.explore-filter-bar', 'nav'],
    },
    teachIn: [{ trackId: 'css', topicId: 'flexbox' }],
    evidenceTests: ['src/test/uiComponents.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-14',
    title: 'CSS Grid two-dimensional layout',
    summary: 'Grid container tracks, areas, auto-fit repeaters, and multi-axis layouts.',
    area: 'css',
    platformUse: {
      feature: 'Progress badge gallery and analytics card grid arrangements',
      route: '/progress',
      sourceFiles: ['src/core/gamification/BadgeGallery.tsx', 'src/pages/Progress.tsx'],
      selectors: ['.personal-bests-section', '.analytics-suite'],
    },
    teachIn: [{ trackId: 'css', topicId: 'grid' }],
    evidenceTests: ['src/test/insights/dashboard.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-15',
    title: 'Positioning & stacking contexts',
    summary: 'Static, relative, absolute, fixed, and sticky positioning with z-index stacking.',
    area: 'css',
    platformUse: {
      feature: 'Fixed skip link overlay and sticky toolbars',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx', 'src/styles/base.css'],
      selectors: ['.sidebar-search-btn', '.skip-link'],
    },
    teachIn: [{ trackId: 'css', topicId: 'positioning' }],
    evidenceTests: ['src/test/starfield.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-16',
    title: 'Responsive design & media queries',
    summary: 'Adaptive layouts using CSS media queries and mobile-first responsive breakpoints.',
    area: 'css',
    platformUse: {
      feature: 'Responsive shell layout adapting between desktop sidebar and mobile navigation',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx', 'src/styles/components.css'],
      selectors: ['.page', '.shell'],
    },
    teachIn: [{ trackId: 'css', topicId: 'responsive-design' }],
    evidenceTests: ['src/test/splitter.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-17',
    title: 'Transitions, keyframe animations & reduced motion',
    summary: 'CSS transitions, keyframe animations, and prefers-reduced-motion media query.',
    area: 'css',
    platformUse: {
      feature: 'Navigation interactive hover transitions and motion preference gating',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx', 'src/styles/components.css'],
      selectors: ['.nav__link'],
    },
    teachIn: [{ trackId: 'css', topicId: 'transitions-animations' }],
    evidenceTests: ['src/test/useMotionAllowed.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-18',
    title: 'DOM events & interaction listeners',
    summary: 'Listening and reacting to click, mouseover, keydown, and input events.',
    area: 'javascript',
    platformUse: {
      feature: 'Global keyboard shortcuts, roving tabindex, and button interaction handlers',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx'],
      selectors: ['button'],
    },
    teachIn: [{ trackId: 'javascript', topicId: 'events' }],
    evidenceTests: ['src/test/search/palette.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-19',
    title: 'Dynamic DOM rendering & component trees',
    summary: 'Programmatic DOM generation, reactive state projection, and dynamic views.',
    area: 'javascript',
    platformUse: {
      feature: 'Reactive view rendering and topic card projection in Explore view',
      route: '/explore',
      sourceFiles: ['src/pages/Explore.tsx'],
      selectors: ['.tech-feature', '.explore-filter-bar'],
    },
    teachIn: [{ trackId: 'javascript', topicId: 'dom' }],
    evidenceTests: ['src/test/preview.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-20',
    title: 'Input validation & feedback mechanisms',
    summary: 'Client-side input constraint checks, validation logic, and accessible error notices.',
    area: 'javascript',
    platformUse: {
      feature: 'Input validation helpers and settings preference sanitization',
      route: '/settings',
      sourceFiles: ['src/lib/validators.ts', 'src/pages/Settings.tsx'],
      selectors: ['input'],
    },
    teachIn: [{ trackId: 'javascript', topicId: 'validation' }],
    evidenceTests: ['src/test/validators.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-21',
    title: 'Structured data: arrays, objects & state',
    summary: 'Complex data structures, immutable record updates, and state reducer patterns.',
    area: 'javascript',
    platformUse: {
      feature: 'Central immutable state reducer and structured learner state stores',
      route: '/explore',
      sourceFiles: ['src/state/types.ts', 'src/state/reducer.ts'],
      selectors: ['.tech-feature .meta-row'],
    },
    teachIn: [
      { trackId: 'javascript', topicId: 'data-structures-basics' },
      { trackId: 'python', topicId: 'py-data-structures' },
      { trackId: 'java', topicId: 'java-arrays-collections' },
      { trackId: 'cpp', topicId: 'cpp-recursion-stl' },
    ],
    evidenceTests: ['src/test/storage.test.ts', 'src/test/pythonTrack.test.ts', 'src/test/javaTrack.test.ts', 'src/test/cppTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-22',
    title: 'Functions, composition & pure utilities',
    summary: 'Pure functions, algorithm modularity, and reusable mathematical utility helpers.',
    area: 'javascript',
    platformUse: {
      feature: 'Spaced repetition scheduling algorithm and mastery calculation utilities',
      route: '/explore',
      sourceFiles: ['src/core/learning/spaced.ts'],
      selectors: ['.explore-filter-bar'],
    },
    teachIn: [
      { trackId: 'javascript', topicId: 'functions' },
      { trackId: 'python', topicId: 'py-functions' },
      { trackId: 'java', topicId: 'java-methods' },
      { trackId: 'cpp', topicId: 'cpp-functions-references' },
    ],
    evidenceTests: ['src/test/spaced.test.ts', 'src/test/pythonTrack.test.ts', 'src/test/javaTrack.test.ts', 'src/test/cppTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-23',
    title: 'Control flow, conditionals & gating logic',
    summary: 'Branching logic, guard conditions, and adaptive recommendation rules.',
    area: 'javascript',
    platformUse: {
      feature: 'Recommendation engine conditional heuristics and progress gating',
      route: '/explore',
      sourceFiles: ['src/core/insights/recommendations.ts'],
      selectors: ['.tech-feature .badge', '.tech-feature .eyebrow'],
    },
    teachIn: [
      { trackId: 'javascript', topicId: 'control-flow' },
      { trackId: 'python', topicId: 'py-control-flow' },
      { trackId: 'java', topicId: 'java-control-flow' },
      { trackId: 'cpp', topicId: 'cpp-control-flow' },
    ],
    evidenceTests: ['src/test/insights/recommendations.test.ts', 'src/test/pythonTrack.test.ts', 'src/test/javaTrack.test.ts', 'src/test/cppTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-24',
    title: 'Carousel & stepper navigation patterns',
    summary: 'Paginated stepping controls with previous/next triggers and dot indicators.',
    area: 'javascript',
    platformUse: {
      feature: 'Constellation topic stepper with dynamic dot pager and index counter',
      route: '/learn/html',
      sourceFiles: ['src/core/orbit/constellation/TopicStepper.tsx', 'src/pages/Track.tsx'],
      selectors: ['.constellation-stepper'],
    },
    teachIn: [{ trackId: 'javascript', topicId: 'gallery' }],
    evidenceTests: ['src/test/constellation/topicCounter.test.tsx'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-25',
    title: 'Browser persistence & Web Storage API',
    summary: 'Local storage serialization, schema migrations, and quota recovery.',
    area: 'javascript',
    platformUse: {
      feature: 'Versioned localStorage persistence layer with automatic migration',
      route: '/settings',
      sourceFiles: ['src/lib/storage.ts', 'src/pages/Settings.tsx'],
      selectors: ['.storage-card'],
    },
    teachIn: [{ trackId: 'javascript', topicId: 'web-storage' }],
    evidenceTests: ['src/test/storage.test.ts', 'src/test/migrations.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-26',
    title: 'Bootstrap responsive navbar',
    summary: 'Bootstrap responsive header with branding, toggler button, and collapsible links.',
    area: 'bootstrap',
    platformUse: undefined,
    teachIn: [{ trackId: 'bootstrap', topicId: 'navbar' }],
    evidenceTests: ['src/test/bootstrapTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-27',
    title: 'Authentication form patterns',
    summary: 'Login and registration UI layouts with floating labels and feedback states.',
    area: 'bootstrap',
    platformUse: undefined,
    teachIn: [{ trackId: 'bootstrap', topicId: 'auth-forms' }],
    evidenceTests: ['src/test/bootstrapTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-28',
    title: 'Bootstrap grid system & utilities',
    summary: '12-column grid, responsive container breakpoints, and utility classes.',
    area: 'bootstrap',
    platformUse: undefined,
    teachIn: [{ trackId: 'bootstrap', topicId: 'grid-system' }],
    evidenceTests: ['src/test/bootstrapTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-29',
    title: 'Angular components, templates & services',
    summary: 'Component-based framework architecture with TypeScript, templates, and dependency injection.',
    area: 'angular',
    platformUse: undefined,
    teachIn: [
      { trackId: 'angular', topicId: 'ng-components' },
      { trackId: 'angular', topicId: 'ng-templates' },
      { trackId: 'angular', topicId: 'ng-data-binding' },
      { trackId: 'angular', topicId: 'ng-directives' },
      { trackId: 'angular', topicId: 'ng-services' },
      { trackId: 'angular', topicId: 'ng-routing' },
    ],
    evidenceTests: ['src/test/angularTrack.test.ts', 'src/test/angularHonesty.test.tsx'],
    courseStatus: 'pending-review',
    assessmentRef: 'no course evidence found',
  },
  {
    id: 'FC-30',
    title: 'Front-end testing & assertion suites',
    summary: 'Automated test suites, unit testing, assertion rules, and requirement grading.',
    area: 'testing',
    platformUse: {
      feature: 'Challenge rule grading engine and automated assertion verifiers',
      route: '/explore',
      sourceFiles: ['src/lib/validators.ts'],
      selectors: ['.tech-feature .meta-row'],
    },
    teachIn: [
      { trackId: 'javascript', topicId: 'testing-basics' },
      { trackId: 'python', topicId: 'py-testing-basics' },
    ],
    evidenceTests: ['src/test/regression.smoke.test.tsx', 'src/test/validators.test.ts', 'src/test/pythonTrack.test.ts'],
    courseStatus: 'pending-review',
  },
  {
    id: 'FC-31',
    title: 'Local development environment & HTTP serving',
    summary: 'Local HTTP server configuration and static site delivery.',
    area: 'testing',
    platformUse: undefined,
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'html-structure' }],
    evidenceTests: ['src/test/devRoute.test.tsx'],
    courseStatus: 'not-required',
  },
  {
    id: 'FC-32',
    title: 'Keyboard interaction & accessibility (WCAG)',
    summary: 'Keyboard focus management, ARIA landmarks, contrast compliance, and reduced-motion support.',
    area: 'accessibility',
    platformUse: {
      feature: 'Skip to main content link, roving tabindex, visible focus indicators, and WCAG compliance',
      route: '/explore',
      sourceFiles: ['src/components/Shell.tsx', 'src/styles/base.css'],
      selectors: ['.skip-link', 'nav'],
    },
    teachIn: [{ trackId: HTML_TECH_ID, topicId: 'accessibility' }],
    evidenceTests: ['src/test/a11y.matrix.test.tsx'],
    courseStatus: 'pending-review',
  },
]

export function getConcepts(): ConceptEntry[] {
  return concepts
}

export function getConcept(id: string): ConceptEntry | undefined {
  return concepts.find((c) => c.id === id)
}

export function getConceptsByArea(area: ConceptArea): ConceptEntry[] {
  return concepts.filter((c) => c.area === area)
}
