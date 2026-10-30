import type { Challenge } from '../../data/types'

export const angularChallenges: Challenge[] = [
  // Topic 1: ng-components (2 challenges)
  {
    id: 'ng-ch-standalone-component',
    topicId: 'ng-components',
    title: 'Create a Standalone User Card Component',
    difficulty: 'beginner',
    prompt:
      'Author a modern Angular standalone component named UserCardComponent. It must use the @Component decorator with selector "app-user-card", set standalone: true, and render a card container with an h2 heading.',
    objective:
      'Define a standalone component using Angular v17+ standalone architecture.',
    starterCode: `import { Component } from '@angular/core';

// TODO: Define @Component decorator with selector and standalone: true
export class UserCardComponent {
  name = 'Alex River';
}
`,
    solutionCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: \`
    <div class="user-card card">
      <h2>{{ name }}</h2>
      <p>Software Engineer</p>
    </div>
  \`,
})
export class UserCardComponent {
  name = 'Alex River';
}
`,
    solutionExplanation: [
      'Applies the @Component decorator with selector "app-user-card".',
      'Enables standalone: true for modern module-free execution.',
      'Defines an inline template with an h2 heading and class "user-card".',
    ],
    hints: [
      'Standalone components in Angular do not belong to an NgModule; specify standalone: true directly in the decorator.',
      'Add @Component({ selector: "app-user-card", standalone: true, template: ... }) above the class.',
      'Ensure the template string includes an <h2> heading with {{ name }} and the "user-card" class.',
    ],
    requirements: [
      {
        id: 'ng-req-decorator',
        description: 'Component decorator is declared',
        explanation: 'Must apply the @Component decorator',
        rule: { kind: 'declaresComponent', selector: 'app-user-card', standalone: true },
      },
      {
        id: 'ng-req-card-markup',
        description: 'Template renders user-card container and heading',
        explanation: 'Template must contain class "user-card" and <h2>',
        rule: { kind: 'angularSourceMatches', pattern: 'class="user-card' },
      },
    ],
  },
  {
    id: 'ng-ch-signals-counter',
    topicId: 'ng-components',
    title: 'Reactive Counter with Angular Signals',
    difficulty: 'beginner',
    prompt:
      'Build a CounterComponent using Angular Signals. Declare a signal "count" initialized to 0, an increment() method updating the signal, and a button triggering increment() on click.',
    objective:
      'Manage reactive component state using Angular Signals (signal, update).',
    starterCode: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="counter">
      <span>Count: 0</span>
      <button>Increment</button>
    </div>
  \`,
})
export class CounterComponent {
  // TODO: Declare reactive signal count and increment method
}
`,
    solutionCode: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="counter">
      <span>Count: {{ count() }}</span>
      <button (click)="increment()">Increment</button>
    </div>
  \`,
})
export class CounterComponent {
  count = signal(0);

  increment() {
    this.count.update((c) => c + 1);
  }
}
`,
    solutionExplanation: [
      'Declares reactive count state using signal(0).',
      'Invokes the signal getter count() in the template interpolation.',
      'Binds the button click event to (click)="increment()".',
    ],
    hints: [
      'Angular Signals provide fine-grained reactivity. Values are read by calling the signal as a function.',
      'Initialize count with count = signal(0); and update it with this.count.update(c => c + 1).',
      'Use (click)="increment()" to wire up the event handler and {{ count() }} to display the value.',
    ],
    requirements: [
      {
        id: 'ng-req-signal',
        description: 'Declares count signal',
        explanation: 'Must declare count = signal(0)',
        rule: { kind: 'usesSignal', signalName: 'count' },
      },
      {
        id: 'ng-req-click-event',
        description: 'Binds button click event',
        explanation: 'Template must bind (click)="increment()"',
        rule: { kind: 'usesBinding', bindingType: 'event' },
      },
    ],
  },

  // Topic 2: ng-templates (2 challenges)
  {
    id: 'ng-ch-interpolation',
    topicId: 'ng-templates',
    title: 'Dynamic Profile Interpolation',
    difficulty: 'beginner',
    prompt:
      'Use Angular double-curly interpolation {{ }} to render the user\'s name, title, and an expression computing remainingCredits (totalCredits - usedCredits).',
    objective:
      'Render text and evaluate template expressions using interpolation.',
    starterCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  template: \`
    <div class="profile">
      <h3>Static Name</h3>
      <p>Credits: 0</p>
    </div>
  \`,
})
export class ProfileStatsComponent {
  name = 'Taylor Swift';
  totalCredits = 100;
  usedCredits = 35;
}
`,
    solutionCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  template: \`
    <div class="profile">
      <h3>{{ name }}</h3>
      <p>Remaining Credits: {{ totalCredits - usedCredits }}</p>
    </div>
  \`,
})
export class ProfileStatsComponent {
  name = 'Taylor Swift';
  totalCredits = 100;
  usedCredits = 35;
}
`,
    solutionExplanation: [
      'Interpolates {{ name }} inside the <h3> tag.',
      'Evaluates arithmetic subtraction expression {{ totalCredits - usedCredits }} directly in template.',
    ],
    hints: [
      'Double curly braces {{ }} allow embedding TypeScript expressions directly inside HTML templates.',
      'Replace "Static Name" with {{ name }} to bind the property dynamically.',
      'Write {{ totalCredits - usedCredits }} to evaluate arithmetic subtraction in template interpolation.',
    ],
    requirements: [
      {
        id: 'ng-req-name-interp',
        description: 'Interpolates component name property',
        explanation: 'Template must interpolate {{ name }}',
        rule: { kind: 'angularSourceMatches', pattern: '{{ name }}' },
      },
      {
        id: 'ng-req-calc-interp',
        description: 'Calculates remaining credits via template expression',
        explanation: 'Template must interpolate totalCredits - usedCredits',
        rule: { kind: 'angularSourceMatches', pattern: 'totalCredits - usedCredits' },
      },
    ],
  },
  {
    id: 'ng-ch-pipes',
    topicId: 'ng-templates',
    title: 'Transform Data with Currency & Date Pipes',
    difficulty: 'intermediate',
    prompt:
      'Import CommonModule and apply the CurrencyPipe and DatePipe to transform invoiceAmount into USD currency and dueDate into "mediumDate" format.',
    objective:
      'Apply built-in Angular template pipes for formatting data.',
    starterCode: `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="invoice">
      <span>Amount: {{ amount }}</span>
      <span>Due: {{ dueDate }}</span>
    </div>
  \`,
})
export class InvoiceComponent {
  amount = 1499.5;
  dueDate = new Date(2026, 9, 30);
}
`,
    solutionCode: `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule],
  template: \`
    <div class="invoice">
      <span>Amount: {{ amount | currency:'USD' }}</span>
      <span>Due: {{ dueDate | date:'mediumDate' }}</span>
    </div>
  \`,
})
export class InvoiceComponent {
  amount = 1499.5;
  dueDate = new Date(2026, 9, 30);
}
`,
    solutionExplanation: [
      'Uses CurrencyPipe via {{ amount | currency:\'USD\' }}.',
      'Uses DatePipe via {{ dueDate | date:\'mediumDate\' }}.',
    ],
    hints: [
      'Angular pipes transform display values in templates using the pipe operator |.',
      'Import CommonModule in the component imports array to make built-in pipes available.',
      'Format currency with | currency:\'USD\' and date with | date:\'mediumDate\'.',
    ],
    requirements: [
      {
        id: 'ng-req-currency-pipe',
        description: 'Transforms amount with currency pipe',
        explanation: 'Template must use currency pipe',
        rule: { kind: 'angularSourceMatches', pattern: 'amount | currency' },
      },
      {
        id: 'ng-req-date-pipe',
        description: 'Transforms dueDate with date pipe',
        explanation: 'Template must use date pipe',
        rule: { kind: 'angularSourceMatches', pattern: 'dueDate | date' },
      },
    ],
  },

  // Topic 3: ng-data-binding (2 challenges)
  {
    id: 'ng-ch-property-binding',
    topicId: 'ng-data-binding',
    title: 'Dynamic Property Binding for Images and Buttons',
    difficulty: 'beginner',
    prompt:
      'Bind the <img> element\'s [src] and [alt] properties to avatarUrl and username. Bind the <button> element\'s [disabled] property to isSubmitting.',
    objective:
      'Use [property]="expression" syntax to bind element properties to component state.',
    starterCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: \`
    <div class="avatar-card">
      <img src="placeholder.png" alt="User">
      <button disabled>Submit</button>
    </div>
  \`,
})
export class AvatarComponent {
  avatarUrl = 'https://assets.codeorbit.dev/avatar.png';
  username = 'Jordan Lee';
  isSubmitting = true;
}
`,
    solutionCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: \`
    <div class="avatar-card">
      <img [src]="avatarUrl" [alt]="username">
      <button [disabled]="isSubmitting">Submit</button>
    </div>
  \`,
})
export class AvatarComponent {
  avatarUrl = 'https://assets.codeorbit.dev/avatar.png';
  username = 'Jordan Lee';
  isSubmitting = true;
}
`,
    solutionExplanation: [
      'Uses property binding [src]="avatarUrl" and [alt]="username" on the image.',
      'Uses property binding [disabled]="isSubmitting" on the button.',
    ],
    hints: [
      'Property binding passes values from the component class to target DOM element properties.',
      'Wrap attribute names with square brackets: [src]="avatarUrl".',
      'Bind the disabled state with [disabled]="isSubmitting".',
    ],
    requirements: [
      {
        id: 'ng-req-src-binding',
        description: 'Binds [src] to avatarUrl',
        explanation: 'Must bind [src]="avatarUrl"',
        rule: { kind: 'angularSourceMatches', pattern: '[src]="avatarUrl"' },
      },
      {
        id: 'ng-req-disabled-binding',
        description: 'Binds [disabled] to isSubmitting',
        explanation: 'Must bind [disabled]="isSubmitting"',
        rule: { kind: 'angularSourceMatches', pattern: '[disabled]="isSubmitting"' },
      },
    ],
  },
  {
    id: 'ng-ch-two-way-binding',
    topicId: 'ng-data-binding',
    title: 'Two-Way Data Binding with ngModel',
    difficulty: 'intermediate',
    prompt:
      'Import FormsModule and implement two-way data binding on the <input> element using [(ngModel)]="searchQuery". Render the active query below the input.',
    objective:
      'Implement two-way data synchronization using banana-in-a-box [()] syntax.',
    starterCode: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <div class="search-box">
      <input type="text" placeholder="Search lessons...">
      <p>Searching for: </p>
    </div>
  \`,
})
export class SearchBoxComponent {
  searchQuery = 'Angular Directives';
}
`,
    solutionCode: `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [FormsModule],
  template: \`
    <div class="search-box">
      <input type="text" [(ngModel)]="searchQuery" placeholder="Search lessons...">
      <p>Searching for: {{ searchQuery }}</p>
    </div>
  \`,
})
export class SearchBoxComponent {
  searchQuery = 'Angular Directives';
}
`,
    solutionExplanation: [
      'Applies two-way binding [(ngModel)]="searchQuery" to the text input.',
      'Interpolates {{ searchQuery }} to display live updates.',
    ],
    hints: [
      'Two-way data binding synchronizes state between the component model and form input controls.',
      'Import FormsModule to enable ngModel directive support in standalone components.',
      'Use banana-in-a-box syntax [(ngModel)]="searchQuery" on the input element.',
    ],
    requirements: [
      {
        id: 'ng-req-two-way',
        description: 'Binds input with [(ngModel)]',
        explanation: 'Must use [(ngModel)]="searchQuery"',
        rule: { kind: 'usesBinding', bindingType: 'two-way' },
      },
      {
        id: 'ng-req-interp-query',
        description: 'Displays searchQuery via interpolation',
        explanation: 'Template must interpolate {{ searchQuery }}',
        rule: { kind: 'angularSourceMatches', pattern: '{{ searchQuery }}' },
      },
    ],
  },

  // Topic 4: ng-directives (2 challenges)
  {
    id: 'ng-ch-control-flow-if',
    topicId: 'ng-directives',
    title: 'Modern Conditional Rendering with @if and @else',
    difficulty: 'beginner',
    prompt:
      'Use modern Angular control flow syntax @if (isLoggedIn) to render the user welcome banner, and @else to render the login button prompt.',
    objective:
      'Implement conditional UI branches using modern Angular built-in @if / @else syntax.',
    starterCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  template: \`
    <div class="auth-bar">
      <!-- TODO: Add @if / @else control flow -->
      <p>Status unknown</p>
    </div>
  \`,
})
export class AuthStatusComponent {
  isLoggedIn = true;
  username = 'DevOrbit';
}
`,
    solutionCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-status',
  standalone: true,
  template: \`
    <div class="auth-bar">
      @if (isLoggedIn) {
        <p class="welcome">Welcome back, {{ username }}!</p>
      } @else {
        <button class="btn-login">Sign in</button>
      }
    </div>
  \`,
})
export class AuthStatusComponent {
  isLoggedIn = true;
  username = 'DevOrbit';
}
`,
    solutionExplanation: [
      'Uses modern Angular @if (isLoggedIn) block without legacy *ngIf.',
      'Adds paired @else block rendering the login action.',
    ],
    hints: [
      'Modern Angular control flow replaces structural directives like *ngIf with cleaner built-in blocks.',
      'Write @if (isLoggedIn) { ... } followed by @else { ... } in the template.',
      'Render the welcome paragraph in the @if block and the sign-in button in the @else block.',
    ],
    requirements: [
      {
        id: 'ng-req-control-if',
        description: 'Uses modern @if control flow directive',
        explanation: 'Template must use @if (isLoggedIn)',
        rule: { kind: 'usesControlFlow', directive: '@if' },
      },
      {
        id: 'ng-req-else-branch',
        description: 'Provides paired @else fallback branch',
        explanation: 'Template must include @else branch',
        rule: { kind: 'angularSourceMatches', pattern: '@else' },
      },
    ],
  },
  {
    id: 'ng-ch-control-flow-for',
    topicId: 'ng-directives',
    title: 'Rendering Lists with Modern @for and Track',
    difficulty: 'beginner',
    prompt:
      'Use modern @for loop syntax to iterate through the lessons array, tracking each item by its id: @for (lesson of lessons; track lesson.id). Render an <li> with lesson.title for each item.',
    objective:
      'Render repeating DOM structures efficiently using modern @for and mandatory track expression.',
    starterCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  template: \`
    <ul class="lesson-list">
      <!-- TODO: Render items using @for (lesson of lessons; track lesson.id) -->
    </ul>
  \`,
})
export class LessonListComponent {
  lessons = [
    { id: '1', title: 'Components & Signals' },
    { id: '2', title: 'Templates & Directives' },
    { id: '3', title: 'Dependency Injection' },
  ];
}
`,
    solutionCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-lesson-list',
  standalone: true,
  template: \`
    <ul class="lesson-list">
      @for (lesson of lessons; track lesson.id) {
        <li class="lesson-item">{{ lesson.title }}</li>
      }
    </ul>
  \`,
})
export class LessonListComponent {
  lessons = [
    { id: '1', title: 'Components & Signals' },
    { id: '2', title: 'Templates & Directives' },
    { id: '3', title: 'Dependency Injection' },
  ];
}
`,
    solutionExplanation: [
      'Uses modern @for (lesson of lessons; track lesson.id) syntax.',
      'Interpolates {{ lesson.title }} inside the repeated <li> tags.',
    ],
    hints: [
      'Modern Angular @for loops provide optimized DOM recycling through a required track expression.',
      'The modern syntax is @for (item of items; track item.id) { ... }.',
      'Render an <li> tag inside the loop block and interpolate {{ lesson.title }}.',
    ],
    requirements: [
      {
        id: 'ng-req-control-for',
        description: 'Uses modern @for control flow with track expression',
        explanation: 'Must declare @for with track',
        rule: { kind: 'usesControlFlow', directive: '@for' },
      },
      {
        id: 'ng-req-for-interp',
        description: 'Renders lesson.title in repeated element',
        explanation: 'Template must interpolate {{ lesson.title }}',
        rule: { kind: 'angularSourceMatches', pattern: '{{ lesson.title }}' },
      },
    ],
  },

  // Topic 5: ng-services (2 challenges)
  {
    id: 'ng-ch-injectable-service',
    topicId: 'ng-services',
    title: 'Create an Injectable Notification Service',
    difficulty: 'intermediate',
    prompt:
      'Create an Angular service NotificationService decorated with @Injectable({ providedIn: \'root\' }). Declare an array notifications and a method notify(message: string) that pushes into it.',
    objective:
      'Author a singleton service using @Injectable and the root hierarchical injector.',
    starterCode: `// TODO: Import Injectable from @angular/core and decorate the class
export class NotificationService {
  notifications: string[] = [];

  notify(message: string) {
    this.notifications.push(message);
  }
}
`,
    solutionCode: `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  notifications: string[] = [];

  notify(message: string) {
    this.notifications.push(message);
  }
}
`,
    solutionExplanation: [
      'Imports and applies @Injectable decorator.',
      'Configures providedIn: \'root\' for application-wide tree-shakeable singleton access.',
    ],
    hints: [
      'Services encapsulate reusable business logic and data access across multiple components.',
      'Decorate NotificationService with @Injectable({ providedIn: \'root\' }).',
      'Implement notify(message: string) { this.notifications.push(message); } in the service body.',
    ],
    requirements: [
      {
        id: 'ng-req-injectable',
        description: 'Decorates class with @Injectable',
        explanation: 'Class must have @Injectable({ providedIn: "root" })',
        rule: { kind: 'declaresInjectable', providedIn: 'root' },
      },
      {
        id: 'ng-req-notify-method',
        description: 'Implements notify method',
        explanation: 'Service must implement notify method',
        rule: { kind: 'angularSourceMatches', pattern: 'notify(message: string)' },
      },
    ],
  },
  {
    id: 'ng-ch-dependency-injection',
    topicId: 'ng-services',
    title: 'Inject and Use Service with inject() Function',
    difficulty: 'intermediate',
    prompt:
      'In UserListComponent, inject UserService using Angular modern inject(UserService) function. Call userService.getUsers() in the component.',
    objective:
      'Inject dependencies using Angular modern inject() function in component field initializers.',
    starterCode: `import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  template: \`<div>Users: {{ users.length }}</div>\`,
})
export class UserListComponent {
  // TODO: Inject UserService using inject(UserService)
  users: string[] = [];
}
`,
    solutionCode: `import { Component, inject } from '@angular/core';
import { UserService } from './user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  template: \`<div>Users: {{ users.length }}</div>\`,
})
export class UserListComponent {
  private userService = inject(UserService);
  users = this.userService.getUsers();
}
`,
    solutionExplanation: [
      'Imports the modern inject function from @angular/core.',
      'Injects UserService as a field initializer without constructor boilerplate.',
    ],
    hints: [
      'Angular allows injecting dependencies using the inject() function instead of constructor injection.',
      'Import inject from @angular/core and UserService from its local module file.',
      'Declare private userService = inject(UserService); and initialize users with this.userService.getUsers().',
    ],
    requirements: [
      {
        id: 'ng-req-inject-fn',
        description: 'Uses modern inject() function',
        explanation: 'Must inject service using inject(UserService)',
        rule: { kind: 'angularSourceMatches', pattern: 'inject(UserService)' },
      },
      {
        id: 'ng-req-call-service',
        description: 'Calls getUsers() on injected service',
        explanation: 'Must call this.userService.getUsers()',
        rule: { kind: 'angularSourceMatches', pattern: 'getUsers()' },
      },
    ],
  },

  // Topic 6: ng-routing (2 challenges)
  {
    id: 'ng-ch-router-links',
    topicId: 'ng-routing',
    title: 'Configure Navigation Bar with routerLink',
    difficulty: 'beginner',
    prompt:
      'In NavigationBarComponent, import RouterLink and RouterLinkActive from @angular/router. Add routerLink="/" to the Home link and routerLink="/explore" with routerLinkActive="active" to the Explore link.',
    objective:
      'Wire single-page routing navigation using RouterLink and RouterLinkActive directives.',
    starterCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: \`
    <nav class="nav">
      <a href="/">Home</a>
      <a href="/explore">Explore</a>
    </nav>
  \`,
})
export class NavigationBarComponent {}
`,
    solutionCode: `import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: \`
    <nav class="nav">
      <a routerLink="/" routerLinkActive="active">Home</a>
      <a routerLink="/explore" routerLinkActive="active">Explore</a>
    </nav>
  \`,
})
export class NavigationBarComponent {}
`,
    solutionExplanation: [
      'Imports RouterLink and RouterLinkActive directives in standalone imports array.',
      'Replaces href with routerLink to prevent full-page browser reloads.',
    ],
    hints: [
      'Angular Router enables single-page navigation without full browser document reloads.',
      'Import RouterLink and RouterLinkActive in the component imports array.',
      'Use routerLink="/" for the Home link and routerLink="/explore" with routerLinkActive="active" for Explore.',
    ],
    requirements: [
      {
        id: 'ng-req-routerlink',
        description: 'Uses routerLink directives on anchor elements',
        explanation: 'Template must use routerLink directive',
        rule: { kind: 'usesRouterLink' },
      },
      {
        id: 'ng-req-routerlinkactive',
        description: 'Applies routerLinkActive directive for active styling',
        explanation: 'Template must use routerLinkActive="active"',
        rule: { kind: 'angularSourceMatches', pattern: 'routerLinkActive="active"' },
      },
    ],
  },
  {
    id: 'ng-ch-route-params',
    topicId: 'ng-routing',
    title: 'Extract Route Parameters with ActivatedRoute',
    difficulty: 'intermediate',
    prompt:
      'In CourseDetailComponent, inject ActivatedRoute and extract the "id" route parameter using route.snapshot.paramMap.get(\'id\').',
    objective:
      'Retrieve dynamic route path parameters using ActivatedRoute snapshot.',
    starterCode: `import { Component } from '@angular/core';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  template: \`<h2>Course: {{ courseId }}</h2>\`,
})
export class CourseDetailComponent {
  courseId: string | null = null;
  // TODO: Inject ActivatedRoute and read route parameter 'id'
}
`,
    solutionCode: `import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  template: \`<h2>Course: {{ courseId }}</h2>\`,
})
export class CourseDetailComponent {
  private route = inject(ActivatedRoute);
  courseId = this.route.snapshot.paramMap.get('id');
}
`,
    solutionExplanation: [
      'Injects ActivatedRoute via inject(ActivatedRoute).',
      'Reads course ID synchronously using route.snapshot.paramMap.get(\'id\').',
    ],
    hints: [
      'ActivatedRoute provides information about a route associated with a component that is loaded in an outlet.',
      'Inject ActivatedRoute using the inject(ActivatedRoute) function in a private field.',
      'Retrieve the parameter synchronously with this.route.snapshot.paramMap.get(\'id\').',
    ],
    requirements: [
      {
        id: 'ng-req-activated-route',
        description: 'Injects ActivatedRoute',
        explanation: 'Must inject ActivatedRoute',
        rule: { kind: 'angularSourceMatches', pattern: 'inject(ActivatedRoute)' },
      },
      {
        id: 'ng-req-param-map',
        description: 'Reads parameter from paramMap',
        explanation: 'Must call paramMap.get(\'id\')',
        rule: { kind: 'angularSourceMatches', pattern: "paramMap.get('id')" },
      },
    ],
  },
]
