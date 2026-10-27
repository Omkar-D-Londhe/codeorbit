import type { Technology, Topic, TopicGroup } from './types'

export const HTML_TECH_ID = 'html'

export const groups: TopicGroup[] = [
  { id: 'foundations', title: 'HTML Foundations' },
  { id: 'text', title: 'Text and Content' },
  { id: 'links', title: 'Links and Navigation' },
  { id: 'media', title: 'Images and Media' },
  { id: 'tables', title: 'Tables' },
  { id: 'forms', title: 'Forms and Inputs' },
  { id: 'semantics', title: 'Semantics and Accessibility' },
  { id: 'together', title: 'Putting It Together' },
]

/** Canonical curriculum order. IDs are stable; titles may change. */
export const topics: Topic[] = [
  { id: 'html-structure', technologyId: 'html', title: 'Document structure', shortTitle: 'Structure', groupId: 'foundations',
    description: 'The doctype, html, head and body: the skeleton every page needs before anything else.', prerequisiteIds: [], tags: ['foundations', 'structure'] },
  { id: 'elements-attributes', technologyId: 'html', title: 'Elements and attributes', shortTitle: 'Elements', groupId: 'foundations',
    description: 'How tags, content and attributes combine to describe a piece of a page.', prerequisiteIds: ['html-structure'], tags: ['foundations', 'syntax'] },
  { id: 'headings-paragraphs', technologyId: 'html', title: 'Headings and paragraphs', shortTitle: 'Headings', groupId: 'foundations',
    description: 'Give text an outline with h1–h6 and group sentences into paragraphs.', prerequisiteIds: ['html-structure'], tags: ['foundations', 'typography'] },
  { id: 'text-semantics', technologyId: 'html', title: 'Text formatting and quotations', shortTitle: 'Text', groupId: 'text',
    description: 'Mark emphasis, keyboard input, quotations and citations by meaning, not by looks.', prerequisiteIds: ['headings-paragraphs'], tags: ['text', 'semantics'] },
  { id: 'lists', technologyId: 'html', title: 'Lists', shortTitle: 'Lists', groupId: 'text',
    description: 'Unordered and ordered lists for sets of items and sequences of steps.', prerequisiteIds: ['headings-paragraphs'], tags: ['text', 'lists'] },
  { id: 'links', technologyId: 'html', title: 'Links and navigation', shortTitle: 'Links', groupId: 'links',
    description: 'Anchors, href values, in-page bookmarks and opening links safely.', prerequisiteIds: ['elements-attributes'], tags: ['navigation', 'links'] },
  { id: 'images', technologyId: 'html', title: 'Images and alt text', shortTitle: 'Images', groupId: 'media',
    description: 'Embed images with meaningful alternative text, dimensions and captions.', prerequisiteIds: ['elements-attributes'], tags: ['media', 'accessibility'] },
  { id: 'tables', technologyId: 'html', title: 'Tables', shortTitle: 'Tables', groupId: 'tables',
    description: 'Present genuinely tabular data with captions, header cells and body rows.', prerequisiteIds: ['headings-paragraphs'], tags: ['data', 'tables'] },
  { id: 'forms', technologyId: 'html', title: 'Forms and inputs', shortTitle: 'Forms', groupId: 'forms',
    description: 'Collect input with labelled controls, input types and built-in validation.', prerequisiteIds: ['elements-attributes'], tags: ['forms', 'inputs', 'validation'] },
  { id: 'semantic-layout', technologyId: 'html', title: 'Semantic page layout', shortTitle: 'Semantics', groupId: 'semantics',
    description: 'header, nav, main, section, article and footer give a page meaningful regions.', prerequisiteIds: ['headings-paragraphs'], tags: ['semantics', 'layout'] },
  { id: 'accessibility', technologyId: 'html', title: 'Accessible HTML basics', shortTitle: 'Access', groupId: 'semantics',
    description: 'Language, alternative text, labels and heading order so everyone can use the page.', prerequisiteIds: ['semantic-layout', 'images'], tags: ['accessibility', 'semantics', 'a11y'] },
  { id: 'putting-together', technologyId: 'html', title: 'Putting it together', shortTitle: 'Capstone', groupId: 'together',
    description: 'Combine structure, navigation, media, lists and semantics into one small site page.', prerequisiteIds: ['semantic-layout', 'links', 'images', 'lists'], tags: ['project', 'capstone', 'layout'] },
]

export const technologies: Technology[] = [
  { id: HTML_TECH_ID, name: 'HTML', glyph: '</>', status: 'available',
    description: 'Structure and meaning for every web page. The complete CodeOrbit track: lessons, knowledge checks and practice challenges.',
    topicIds: topics.map((t) => t.id) },
  { id: 'css', name: 'CSS', glyph: '{ }', status: 'planned', topicIds: [],
    description: 'Selectors, the box model, layout with flexbox and grid.' },
  { id: 'javascript', name: 'JavaScript', glyph: 'JS', status: 'planned', topicIds: [],
    description: 'Events, the DOM, and dynamic behaviour in the browser.' },
  { id: 'bootstrap', name: 'Bootstrap', glyph: 'B', status: 'planned', topicIds: [],
    description: 'Responsive layouts and components with a utility-first framework.' },
  { id: 'angular', name: 'Angular', glyph: 'A', status: 'planned', topicIds: [],
    description: 'Component-based single-page applications.' },
]

const byId = new Map(topics.map((t) => [t.id, t]))
export const getTopic = (id: string): Topic | undefined => byId.get(id)
export const getTechnology = (id: string): Technology | undefined => technologies.find((t) => t.id === id)
export const getGroup = (id: string): TopicGroup | undefined => groups.find((g) => g.id === id)
export const topicIndex = (id: string): number => topics.findIndex((t) => t.id === id)
export const topicsFor = (technologyId: string): Topic[] => topics.filter((t) => t.technologyId === technologyId)
export const dependentsOf = (id: string): Topic[] => topics.filter((t) => t.prerequisiteIds.includes(id))

/** All real prerequisite edges as [from(prerequisite) → to(dependent)]. */
export const prerequisiteEdges: Array<{ from: string; to: string }> = topics.flatMap((t) =>
  t.prerequisiteIds.map((p) => ({ from: p, to: t.id })),
)
