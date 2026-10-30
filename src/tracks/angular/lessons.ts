import type { Lesson } from '../../data/types'

export const angularLessons: Lesson[] = [
  {
    topicId: 'ng-components',
    objective: 'Understand Angular component architecture, the @Component decorator metadata, standalone components, and component lifecycle.',
    takeaways: [
      'A component is the fundamental building block of an Angular application, uniting an HTML template, CSS styles, and a TypeScript class.',
      'The @Component decorator configures component metadata including selector, standalone: true, imports, template, and styles.',
      'Standalone components simplify architecture by eliminating the need for NgModule wrappers.',
      'Lifecycle hooks like ngOnInit and ngOnDestroy allow components to execute logic at critical moments in their lifecycle.',
    ],
    terms: {
      component: {
        term: 'Component',
        definition: 'A TypeScript class decorated with @Component that controls a portion of the UI defined by its template.',
      },
      standalone: {
        term: 'Standalone Component',
        definition: 'An Angular component that directly manages its dependencies via an imports array, without requiring an NgModule.',
      },
      lifecycleHook: {
        term: 'Lifecycle Hook',
        definition: 'An interface method (such as ngOnInit) called by Angular at specific moments in a component\'s lifecycle.',
      },
    },
    sections: [
      {
        id: 'ng-comp-anatomy',
        heading: 'Anatomy of an Angular Component',
        body: [
          'In modern Angular, components are declared as standalone by default. A component combines three core elements:',
          '1. Component Class: A TypeScript class that maintains application state and defines interaction methods.',
          '2. HTML Template: Declarative template markup that defines the view structure.',
          '3. Component Styles: Encapsulated CSS that styles only this component\'s view.',
        ],
        code: {
          label: 'Standalone Angular Component',
          code: `import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-greeting',
  standalone: true,
  template: \`
    <div class="greeting-card">
      <h1>Hello, {{ name }}!</h1>
      <p>Status: {{ status }}</p>
    </div>
  \`,
  styles: [\`
    .greeting-card { border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; }
  \`]
})
export class GreetingComponent implements OnInit {
  name: string = 'Learner';
  status: string = 'Active';

  ngOnInit(): void {
    console.log('GreetingComponent initialized.');
  }
}`,
        },
      },
      {
        id: 'ng-comp-lifecycle',
        heading: 'Component Lifecycle and Hooks',
        body: [
          'Angular creates, updates, and destroys components as users navigate through an application.',
          '- ngOnInit: Called once after the component\'s input properties are initialized; ideal for fetching initial data.',
          '- ngOnChanges: Called whenever data-bound input properties (@Input) change value.',
          '- ngOnDestroy: Called just before Angular destroys the component; essential for cleaning up timer subscriptions and event listeners.',
        ],
        callout: {
          kind: 'why',
          text: 'Never execute complex data fetching or HTTP requests inside the constructor. Constructors should only perform lightweight dependency injection assignment; use ngOnInit for initialization logic.',
        },
      },
    ],
  },
  {
    topicId: 'ng-templates',
    objective: 'Master Angular template syntax, double-curly interpolation expressions, and the safe navigation operator.',
    takeaways: [
      'Angular templates are standard HTML extended with Angular-specific template syntax and expressions.',
      'Interpolation uses double curly braces {{ expression }} to render text values from the component class into the DOM.',
      'Template expressions are evaluated within the context of the component instance.',
      'The safe navigation operator (?.) guards against null or undefined property access in nested objects.',
    ],
    terms: {
      interpolation: {
        term: 'Interpolation',
        definition: 'Embedding dynamic component class expressions within text content using {{ expression }}.',
      },
      safeNavigation: {
        term: 'Safe Navigation Operator (?.)',
        definition: 'An operator that prevents null pointer reference errors when traversing nested properties that may be undefined.',
      },
      templateExpression: {
        term: 'Template Expression',
        definition: 'A JavaScript-like expression evaluated by Angular within the context of the component instance.',
      },
    },
    sections: [
      {
        id: 'ng-interpolation-basics',
        heading: 'Text Interpolation and Expressions',
        body: [
          'Double curly braces {{ }} allow dynamic calculation and rendering of component values directly within your HTML elements.',
          'Angular automatically updates the rendered text whenever the component property values change.',
        ],
        code: {
          label: 'Interpolation Examples',
          code: `<!-- Simple property interpolation -->
<h2>Welcome, {{ username }}</h2>

<!-- Mathematical expression -->
<p>Total score: {{ basePoints + bonusPoints }}</p>

<!-- Calling a component pure helper method -->
<p>Account status: {{ getFormattedStatus() }}</p>`,
        },
      },
      {
        id: 'ng-safe-navigation',
        heading: 'Safe Navigation Operator (?.)',
        body: [
          'When reading properties from asynchronous or optional objects that might not yet be loaded, evaluating user.profile.name can throw a TypeError.',
          'The safe navigation operator (user?.profile?.name) stops evaluation and outputs an empty string if any intermediate property is null or undefined.',
        ],
        code: {
          label: 'Safe Navigation',
          code: `<!-- Without safe navigation, this throws if user is null -->
<p>User City: {{ user?.address?.city }}</p>`,
        },
        callout: {
          kind: 'mistake',
          text: 'Do not invoke computationally expensive or state-mutating functions inside {{ }}. Template expressions run on every change detection cycle.',
        },
      },
    ],
  },
  {
    topicId: 'ng-data-binding',
    objective: 'Understand Angular data binding mechanisms: property binding, event binding, and two-way banana-in-a-box binding.',
    takeaways: [
      'Data binding coordinates communication between a component TypeScript class and its DOM template.',
      'Property binding uses square brackets [target]="source" to pass data from component to DOM element or child component.',
      'Event binding uses parentheses (target)="handler($event)" to listen for DOM events and invoke component methods.',
      'Two-Way binding uses [()] ("banana in a box") to keep form inputs and component state synchronized automatically.',
    ],
    terms: {
      propertyBinding: {
        term: 'Property Binding',
        definition: 'One-way data binding from component property to DOM element property using [property]="expression".',
      },
      eventBinding: {
        term: 'Event Binding',
        definition: 'One-way binding from DOM event to component method handler using (event)="handler($event)".',
      },
      twoWayBinding: {
        term: 'Two-Way Binding',
        definition: 'Synchronized bidirectional data binding between UI input and component model using [(ngModel)].',
      },
    },
    sections: [
      {
        id: 'ng-property-event-binding',
        heading: 'Property and Event Binding Syntax',
        body: [
          'Angular uses distinct punctuation to make data flow directions visually explicit in templates:',
          '- [property]: Data flows from component class TO template element.',
          '- (event): Data flows from template element TO component method.',
        ],
        code: {
          label: 'Property and Event Binding',
          code: `@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <!-- Property binding: sets the disabled property -->
    <button [disabled]="count >= 10" (click)="increment()">
      Increment (+1)
    </button>

    <!-- Interpolating the current count -->
    <p>Current count: {{ count }}</p>

    <!-- Passing event payload -->
    <input (input)="onTextChange($event)" placeholder="Type here..." />
  \`
})
export class CounterComponent {
  count: number = 0;

  increment(): void {
    this.count++;
  }

  onTextChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    console.log('Input value:', target.value);
  }
}`,
        },
      },
      {
        id: 'ng-two-way-binding',
        heading: 'Two-Way Binding with [(ngModel)]',
        body: [
          'For form elements, two-way data binding combines property binding [ngModel] with event binding (ngModelChange).',
          'Remember the memory aid: "Banana in a Box" — brackets on the outside, parentheses on the inside: [(ngModel)].',
        ],
        code: {
          label: 'Two-Way Binding Syntax',
          code: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <label>User Handle:</label>
    <input [(ngModel)]="handle" placeholder="Enter username" />
    <p>Preview: @{{ handle }}</p>
  \`
})
export class ProfileEditorComponent {
  handle: string = 'code_orbit';
}`,
        },
      },
    ],
  },
  {
    topicId: 'ng-directives',
    objective: 'Explore Angular directives: modern @if and @for control flow blocks, and built-in attribute directives ngClass and ngStyle.',
    takeaways: [
      'Directives extend HTML elements with custom behavior and DOM transformations.',
      'Modern Angular introduces built-in block syntax (@if, @else, @for) replacing legacy *ngIf and *ngFor micro-syntaxes.',
      '@for requires a mandatory track expression (e.g. track item.id) for deterministic DOM reconciliation.',
      'Attribute directives like ngClass and ngStyle dynamically add or remove CSS classes and inline styles.',
    ],
    terms: {
      directive: {
        term: 'Directive',
        definition: 'A class that adds additional behavior or structural transformation to elements in the DOM.',
      },
      controlFlow: {
        term: 'Built-in Control Flow',
        definition: 'Declarative template block syntax (@if, @for, @switch) that conditionally renders or repeats DOM fragments.',
      },
      trackExpression: {
        term: 'Track Expression',
        definition: 'A mandatory unique identifier in @for loops that allows Angular to optimize DOM node reuse during updates.',
      },
    },
    sections: [
      {
        id: 'ng-control-flow-syntax',
        heading: 'Modern Built-in Control Flow (@if and @for)',
        body: [
          'Angular features native control flow blocks that offer cleaner syntax and type-narrowing directly in templates.',
          'The @if block conditionally renders template fragments. The @for block loops through iterable collections with an explicit track key.',
        ],
        code: {
          label: 'Control Flow Blocks',
          code: `@Component({
  selector: 'app-task-list',
  standalone: true,
  template: \`
    <!-- Conditional rendering -->
    @if (tasks.length === 0) {
      <p class="empty-state">No pending tasks!</p>
    } @else {
      <ul>
        <!-- Iteration with mandatory tracking expression -->
        @for (task of tasks; track task.id) {
          <li [class.completed]="task.done">
            {{ task.title }}
          </li>
        }
      </ul>
    }
  \`
})
export class TaskListComponent {
  tasks = [
    { id: 1, title: 'Learn Angular Standalone Components', done: true },
    { id: 2, title: 'Master Directives & Control Flow', done: false }
  ];
}`,
        },
      },
      {
        id: 'ng-attribute-directives',
        heading: 'Attribute Directives: ngClass and ngStyle',
        body: [
          'Attribute directives change the appearance or behavior of an existing DOM element.',
          '- [ngClass]: Dynamically toggles CSS class names based on truthy object conditions or arrays.',
          '- [ngStyle]: Dynamically computes and applies inline CSS style rules.',
        ],
        code: {
          label: 'ngClass and ngStyle Example',
          code: `<div [ngClass]="{ 'is-active': isActive, 'is-urgent': priority === 'high' }">
  Priority Card
</div>

<div [ngStyle]="{ 'color': textColor, 'font-size.px': fontSize }">
  Styled Text
</div>`,
        },
      },
    ],
  },
  {
    topicId: 'ng-services',
    objective: 'Understand Angular services, dependency injection (DI), hierarchical injectors, and singleton scope with providedIn root.',
    takeaways: [
      'Services encapsulate reusable business logic, HTTP data fetching, and state management separate from UI components.',
      'The @Injectable() decorator registers a service with Angular\'s Dependency Injection framework.',
      'Specifying providedIn: "root" registers the service with the root application injector as a tree-shakeable singleton.',
      'Components request dependencies through their constructor parameter signatures or via the inject() function.',
    ],
    terms: {
      service: {
        term: 'Service',
        definition: 'A class decorated with @Injectable containing application logic, data operations, or shared state.',
      },
      dependencyInjection: {
        term: 'Dependency Injection (DI)',
        definition: 'A design pattern where classes receive their dependencies from an external injector rather than instantiating them directly.',
      },
      providedInRoot: {
        term: 'providedIn: "root"',
        definition: 'A metadata option making a service available as an application-wide singleton that is automatically tree-shaken if unused.',
      },
    },
    sections: [
      {
        id: 'ng-service-creation',
        heading: 'Creating an Injectable Service',
        body: [
          'To create a service, annotate the class with @Injectable({ providedIn: \'root\' }).',
          'This informs Angular\'s DI container to instantiate and manage a single shared instance throughout the application.',
        ],
        code: {
          label: 'Data Service Definition',
          code: `import { Injectable } from '@angular/core';

export interface OrbitCourse {
  id: string;
  title: string;
}

@Injectable({
  providedIn: 'root' // Singleton across the entire application
})
export class CourseService {
  private courses: OrbitCourse[] = [
    { id: 'ng-101', title: 'Angular Fundamentals' },
    { id: 'ng-102', title: 'Reactive Architecture' }
  ];

  getCourses(): OrbitCourse[] {
    return [...this.courses];
  }

  addCourse(course: OrbitCourse): void {
    this.courses.push(course);
  }
}`,
        },
      },
      {
        id: 'ng-service-injection',
        heading: 'Injecting Services into Components',
        body: [
          'Components declare required services in their constructor, or use the modern inject() function introduced in recent Angular versions.',
          'Angular resolves the service from the injector hierarchy and supplies the instance automatically.',
        ],
        code: {
          label: 'Injecting into a Component',
          code: `import { Component, OnInit, inject } from '@angular/core';
import { CourseService, OrbitCourse } from './course.service';

@Component({
  selector: 'app-course-catalog',
  standalone: true,
  template: \`
    <h2>Available Courses ({{ list.length }})</h2>
    <ul>
      @for (c of list; track c.id) {
        <li>{{ c.title }}</li>
      }
    </ul>
  \`
})
export class CourseCatalogComponent implements OnInit {
  // Method A: modern inject() function
  private courseService = inject(CourseService);
  list: OrbitCourse[] = [];

  ngOnInit(): void {
    this.list = this.courseService.getCourses();
  }
}`,
        },
        callout: {
          kind: 'why',
          text: 'Dependency injection makes components loosely coupled and straightforward to test with mock service replacements.',
        },
      },
    ],
  },
  {
    topicId: 'ng-routing',
    objective: 'Learn Angular single-page routing, route configurations, RouterOutlet, RouterLink navigation, and route parameter extraction.',
    takeaways: [
      'The Angular Router enables navigation between views without reloading the browser page.',
      'Routes are configured as an array of Route objects mapping URL path strings to specific components.',
      'The <router-outlet> element serves as a placeholder directive where the active route component is dynamically rendered.',
      'The routerLink directive creates accessible, client-side navigation anchors.',
    ],
    terms: {
      routerOutlet: {
        term: 'RouterOutlet',
        definition: 'A directive (<router-outlet>) that acts as a placeholder where Angular renders matched route components.',
      },
      routerLink: {
        term: 'RouterLink',
        definition: 'A directive ([routerLink]="[\'/path\']") applied to anchor tags for client-side navigation without full page reload.',
      },
      activatedRoute: {
        term: 'ActivatedRoute',
        definition: 'An injectable service providing information about the current route URL, path parameters, and query parameters.',
      },
    },
    sections: [
      {
        id: 'ng-routes-config',
        heading: 'Configuring Application Routes',
        body: [
          'Routes map URL segments to corresponding component definitions. Routes are matched sequentially from top to bottom.',
        ],
        code: {
          label: 'Route Table Configuration',
          code: `import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CatalogComponent } from './catalog/catalog.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'catalog', component: CatalogComponent },
  { path: 'course/:courseId', component: CourseDetailComponent },
  { path: '**', component: NotFoundComponent } // Wildcard 404 route
];`,
        },
      },
      {
        id: 'ng-outlet-and-links',
        heading: 'RouterOutlet and RouterLink Directives',
        body: [
          'In the shell component, place <router-outlet> to tell Angular where to insert route views.',
          'Use [routerLink] rather than standard href attributes to prevent unwanted page refreshes.',
        ],
        code: {
          label: 'Shell Navigation Template',
          code: `@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: \`
    <nav class="navbar">
      <a [routerLink]="['/home']">Home</a>
      <a [routerLink]="['/catalog']">Courses</a>
    </nav>

    <!-- Matched route views render here -->
    <main>
      <router-outlet></router-outlet>
    </main>
  \`
})
export class AppComponent {}`,
        },
      },
    ],
  },
]
