export interface AngularSnippet {
  id: string
  title: string
  category: string
  code: string
  description: string
}

export const ANGULAR_SNIPPETS: AngularSnippet[] = [
  {
    id: 'ng-snip-standalone',
    title: 'Standalone Component Skeleton',
    category: 'components',
    code: `import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',
  standalone: true,
  template: \`<h1>Hello, {{ name }}!</h1>\`,
  styles: [\`h1 { color: #dd0031; }\`]
})
export class HelloComponent {
  name = 'Angular';
}`,
    description: 'Minimal standalone Angular component with inline template and scoped styles.',
  },
  {
    id: 'ng-snip-control-flow',
    title: '@if and @for Control Flow',
    category: 'templates',
    code: `@if (items.length > 0) {
  <ul>
    @for (item of items; track item.id) {
      <li>{{ item.label }}</li>
    }
  </ul>
} @else {
  <p>No items found.</p>
}`,
    description: 'Modern declarative template control flow using built-in @if and @for with tracking.',
  },
  {
    id: 'ng-snip-service',
    title: 'Singleton Injectable Service',
    category: 'services',
    code: `import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private count = 0;

  getCount(): number {
    return this.count;
  }

  increment(): void {
    this.count++;
  }
}`,
    description: 'Application-wide singleton service with root dependency injection provider.',
  },
  {
    id: 'ng-snip-routes',
    title: 'Application Route Table',
    category: 'routing',
    code: `import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { AboutComponent } from './about.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: '**', redirectTo: 'home' }
];`,
    description: 'Standard client-side route table configuration for single-page applications.',
  },
]
