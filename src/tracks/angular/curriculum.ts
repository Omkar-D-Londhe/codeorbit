import type { Topic, TopicGroup } from '../../data/types'

export const ANGULAR_TECH_ID = 'angular'

export const angularGroups: TopicGroup[] = [
  { id: 'angular-foundations', title: 'Foundations & Components' },
  { id: 'angular-templates', title: 'Templates & Data Binding' },
  { id: 'angular-architecture', title: 'Directives & Services' },
  { id: 'angular-routing', title: 'Application Routing' },
]

export const angularTopics: Topic[] = [
  {
    id: 'ng-components',
    technologyId: ANGULAR_TECH_ID,
    title: 'Angular Components & Standalone Architecture',
    shortTitle: 'Components',
    groupId: 'angular-foundations',
    description: 'Component architecture, @Component decorator, standalone components, template encapsulation, and component lifecycle.',
    prerequisiteIds: [],
    tags: ['angular', 'components', 'standalone', 'lifecycle'],
  },
  {
    id: 'ng-templates',
    technologyId: ANGULAR_TECH_ID,
    title: 'Templates, Interpolation & Template Statements',
    shortTitle: 'Templates',
    groupId: 'angular-templates',
    description: 'HTML template syntax, double-curly interpolation {{ value }}, template expressions, and safe navigation operators.',
    prerequisiteIds: ['ng-components'],
    tags: ['angular', 'templates', 'interpolation', 'syntax'],
  },
  {
    id: 'ng-data-binding',
    technologyId: ANGULAR_TECH_ID,
    title: 'Property, Event & Two-Way Binding',
    shortTitle: 'Data Binding',
    groupId: 'angular-templates',
    description: 'Property binding [property]="expr", event binding (event)="handler()", and two-way binding [(ngModel)] syntax.',
    prerequisiteIds: ['ng-templates'],
    tags: ['angular', 'binding', 'events', 'properties'],
  },
  {
    id: 'ng-directives',
    technologyId: ANGULAR_TECH_ID,
    title: 'Structural & Attribute Directives',
    shortTitle: 'Directives',
    groupId: 'angular-architecture',
    description: 'Manipulating DOM structure and styling using built-in directives: @if/@for control flow, ngClass, and ngStyle.',
    prerequisiteIds: ['ng-data-binding'],
    tags: ['angular', 'directives', 'control-flow', 'ngClass'],
  },
  {
    id: 'ng-services',
    technologyId: ANGULAR_TECH_ID,
    title: 'Services & Dependency Injection',
    shortTitle: 'Services & DI',
    groupId: 'angular-architecture',
    description: 'Separating business logic into @Injectable services, hierarchical injectors, providedIn root, and constructor injection.',
    prerequisiteIds: ['ng-components'],
    tags: ['angular', 'services', 'di', 'dependency-injection'],
  },
  {
    id: 'ng-routing',
    technologyId: ANGULAR_TECH_ID,
    title: 'Single-Page Routing & Navigation',
    shortTitle: 'Routing',
    groupId: 'angular-routing',
    description: 'Declaring routes, RouterOutlet placeholder, RouterLink navigation directives, route parameters, and navigation guards.',
    prerequisiteIds: ['ng-directives', 'ng-services'],
    tags: ['angular', 'routing', 'navigation', 'spa'],
  },
]
