import type { ConceptEntry } from '../../core/concepts/concepts'

export const angularConcepts: ConceptEntry[] = [
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
]
