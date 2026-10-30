import type { Lesson } from '../../data/types'

export const bootstrapLessons: Lesson[] = [
  {
    topicId: 'grid-system',
    objective: 'Understand the 12-column grid layout system in Bootstrap and nest columns (.col-*) within rows (.row) and containers (.container).',
    estimatedMinutes: 6,
    takeaways: [
      'The Bootstrap grid operates as a 12-column flexbox container where rows must be placed inside containers.',
      'Columns (.col-*) must be immediate children of .row elements to maintain gutter spacing.',
      'Breakpoint classes (e.g. col-12 col-md-6 col-lg-4) define responsive column spans per viewport width.',
      'Unlike custom CSS Grid or Flexbox where you write media queries manually, Bootstrap encodes breakpoints into class names.',
    ],
    terms: {
      grid: {
        term: '12-Column Grid',
        definition: 'A layout system dividing horizontal space into 12 proportional units.',
      },
      gutter: {
        term: 'Gutter',
        definition: 'The padding between columns created by negative margins on .row and horizontal padding on .col.',
      },
      breakpoint: {
        term: 'Breakpoint',
        definition: 'Viewport width thresholds (sm: 576px, md: 768px, lg: 992px, xl: 1200px, xxl: 1400px).',
      },
    },
    a11yNotes: [
      'Ensure grid layouts maintain a logical reading and focus order for screen reader users and keyboard navigators. Visual column reordering with order-* classes should not disrupt content comprehension.',
    ],
    sections: [
      {
        id: 'grid-hierarchy',
        heading: 'The 12-Column Layout System',
        body: [
          "Bootstrap's grid system uses a series of containers, rows, and columns to layout and align content. It is built with flexbox and is fully responsive.",
          'Containers (.container or .container-fluid) center your site content and provide horizontal padding.',
          'Rows (.row) are wrappers for columns that counteract container padding with negative margins.',
          'Columns (.col-*) are immediate children of rows that divide the 12 available horizontal slots.',
        ],
      },
      {
        id: 'grid-breakpoints',
        heading: 'Responsive Column Spans',
        body: [
          'You can specify how many columns an element should span at different screen widths using breakpoint suffixes like sm, md, lg, xl, and xxl.',
          'On mobile (under 768px), col-12 spans the full width. On tablets (768px+), col-md-6 takes half the width. On desktops (992px+), col-lg-4 takes one-third.',
        ],
        code: {
          label: 'Responsive 3-Column Grid Markup',
          code: `<div class="container">\n  <div class="row">\n    <div class="col-12 col-md-6 col-lg-4">Card 1</div>\n    <div class="col-12 col-md-6 col-lg-4">Card 2</div>\n    <div class="col-12 col-md-12 col-lg-4">Card 3</div>\n  </div>\n</div>`,
        },
      },
      {
        id: 'grid-contrast',
        heading: 'Contrasting Bootstrap Grid with Custom CSS',
        body: [
          'In the CSS Track, you learned how to write display: grid with grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)).',
          "Bootstrap's utility approach takes a different philosophical stance: instead of writing bespoke media queries in CSS files, you declare responsive behaviors directly in HTML markup.",
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-grid',
        title: 'Responsive 3-Column Grid',
        files: [
          {
            name: 'index.html',
            content: `<div class="container my-4">\n  <div class="row g-3">\n    <div class="col-12 col-md-4">\n      <div class="p-3 border bg-light text-center">Column 1</div>\n    </div>\n    <div class="col-12 col-md-4">\n      <div class="p-3 border bg-light text-center">Column 2</div>\n    </div>\n    <div class="col-12 col-md-4">\n      <div class="p-3 border bg-light text-center">Column 3</div>\n    </div>\n  </div>\n</div>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'containers-layout',
    objective: 'Differentiate fixed-width containers (.container) from full-width (.container-fluid) and leverage responsive container modifiers.',
    estimatedMinutes: 5,
    takeaways: [
      '.container sets a fixed max-width at each responsive breakpoint and centers content automatically.',
      '.container-fluid spans 100% width across all viewport sizes.',
      'Responsive containers (like .container-md) remain 100% wide until reaching the specified breakpoint threshold.',
      'Gutters and padding ensure content never clips directly against screen edges.',
    ],
    terms: {
      container: {
        term: '.container',
        definition: 'A responsive container with a fixed max-width that updates at each breakpoint.',
      },
      containerFluid: {
        term: '.container-fluid',
        definition: 'A fluid container that always spans 100% of the viewport width.',
      },
    },
    a11yNotes: [
      'Avoid setting fixed widths on inner elements that exceed container boundaries. Overflowing content forces horizontal scrolling, which hinders low-vision learners who zoom their viewports up to 400%.',
    ],
    sections: [
      {
        id: 'container-types',
        heading: 'Container Variations',
        body: [
          'Containers are the most basic layout element in Bootstrap and are required when using the grid.',
          '.container sets discrete max-widths (540px at sm, 720px at md, 960px at lg, 1140px at xl, 1320px at xxl).',
          '.container-fluid stays 100% wide at all breakpoints.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-containers',
        title: 'Container Width Comparison',
        files: [
          {
            name: 'index.html',
            content: `<div class="container bg-primary text-white p-3 mb-3 text-center">\n  .container (Fixed max-width per breakpoint)\n</div>\n<div class="container-fluid bg-secondary text-white p-3 text-center">\n  .container-fluid (Always 100% wide)\n</div>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'utilities',
    objective: 'Apply directional margin and padding utility classes, text formatting, and display helpers.',
    estimatedMinutes: 6,
    takeaways: [
      'Spacing utilities use a 0–5 scale based on rem values ($spacer = 1rem = 16px by default).',
      'Directional letters specify target sides: t (top), b (bottom), s (start/left), e (end/right), x (horizontal), y (vertical).',
      'Semantic theme colors (primary, secondary, success, danger, warning, info, light, dark) provide consistent palettes.',
      'Display utilities like d-none d-md-block control visibility across mobile and desktop viewports.',
    ],
    terms: {
      spacingScale: {
        term: 'Spacing Scale',
        definition: '0 (0px), 1 (0.25rem), 2 (0.5rem), 3 (1rem), 4 (1.5rem), 5 (3rem), auto.',
      },
      logicalProps: {
        term: 'Logical Properties',
        definition: 's stands for start and e stands for end, supporting bidirectional (LTR and RTL) text.',
      },
    },
    a11yNotes: [
      'Never rely solely on color to communicate meaning (e.g. error or success). Always accompany color changes with clear textual cues or icons with accessible labels.',
    ],
    sections: [
      {
        id: 'spacing-system',
        heading: 'Utility-First Spacing',
        body: [
          'Bootstrap includes a wide range of shorthand responsive margin and padding utility classes.',
          'm-3 sets 1rem margin on all four sides. py-4 sets 1.5rem vertical padding. mx-auto centers block elements.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-utilities',
        title: 'Spacing & Color Utilities',
        files: [
          {
            name: 'index.html',
            content: `<div class="p-4 bg-light border rounded">\n  <h4 class="text-primary mb-2">Utility Showcase</h4>\n  <p class="text-muted mb-3">Bootstrap utilities allow rapid formatting without writing custom CSS rules.</p>\n  <div class="d-flex gap-2">\n    <span class="badge bg-success p-2">Active</span>\n    <span class="badge bg-info text-dark p-2">Info</span>\n  </div>\n</div>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'components',
    objective: 'Construct cohesive cards with .card, accessible buttons with .btn, and feedback banners with .alert.',
    estimatedMinutes: 6,
    takeaways: [
      'Cards are flexible content containers with optional headers, footers, images, and bodies.',
      'All buttons require the base .btn class plus a variant class like .btn-primary.',
      'Alerts provide contextual feedback messages with role="alert" for assistive technology announcement.',
      'Components can be combined seamlessly with grid columns and spacing utilities.',
    ],
    terms: {
      card: {
        term: '.card',
        definition: 'A bordered box with padding around its content that acts as an extensible container.',
      },
      btn: {
        term: '.btn',
        definition: 'The base class for buttons that handles font, padding, border-radius, and interactive transitions.',
      },
    },
    a11yNotes: [
      'Ensure buttons styled from <a> links include appropriate href values or role="button". Contrast ratios between button background and text must meet WCAG 2.1 AA (4.5:1 for normal text).',
    ],
    sections: [
      {
        id: 'cards-alerts',
        heading: 'Building Cards and Alerts',
        body: [
          'Cards provide a clean container pattern for presenting structured information.',
          '.card-body provides internal padding, while .card-title sets appropriate typography.',
          '.alert elements should include role="alert" so assistive technology announces status updates.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-components',
        title: 'Interactive Card & Alert',
        files: [
          {
            name: 'index.html',
            content: `<div class="container my-3">\n  <div class="alert alert-info" role="alert">\n    <strong>Notice:</strong> Explore the card component below.\n  </div>\n  <div class="card" style="max-width: 20rem;">\n    <div class="card-body">\n      <h5 class="card-title">Course Module</h5>\n      <p class="card-text">Build modern web layouts using Bootstrap 5 components.</p>\n      <button type="button" class="btn btn-primary">Start Module</button>\n    </div>\n  </div>\n</div>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'navbar',
    objective: 'Structure accessible responsive navigation headers using .navbar, .navbar-toggler, and .collapse.navbar-collapse (FC-26).',
    estimatedMinutes: 7,
    takeaways: [
      '.navbar provides navigation wrappers that expand on desktops and collapse on mobile screens.',
      'The toggler button requires data-bs-toggle="collapse", aria-controls="targetId", and aria-expanded="false".',
      'The collapsible container must have classes .collapse .navbar-collapse and match the id specified in aria-controls.',
      'Navigation links use .navbar-nav, .nav-item, and .nav-link for semantic list items and links.',
    ],
    terms: {
      navbarExpand: {
        term: '.navbar-expand-lg',
        definition: 'The navbar expands horizontally on large screens (992px+) and collapses into a hamburger toggler on smaller viewports.',
      },
      navbarBrand: {
        term: '.navbar-brand',
        definition: 'The company, product, or project name/logo linking back to the home page.',
      },
    },
    a11yNotes: [
      'The hamburger toggler MUST include an accessible label via aria-label="Toggle navigation" or an inner .visually-hidden text span so screen reader users understand the button action.',
    ],
    sections: [
      {
        id: 'navbar-contract',
        heading: 'The Responsive Navbar Markup Contract',
        body: [
          'Bootstrap navbars follow a precise markup contract connecting the toggler button to the collapsible wrapper.',
          'aria-controls and data-bs-target point directly to the ID on the collapsible wrapper.',
          'aria-expanded informs screen readers whether the menu is open or closed.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-navbar',
        title: 'Responsive Navbar Demo',
        files: [
          {
            name: 'index.html',
            content: `<nav class="navbar navbar-expand-md navbar-light bg-light border-bottom">\n  <div class="container-fluid">\n    <a class="navbar-brand fw-bold text-primary" href="#">CodeOrbit</a>\n    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navDemo" aria-controls="navDemo" aria-expanded="false" aria-label="Toggle navigation">\n      <span class="navbar-toggler-icon"></span>\n    </button>\n    <div class="collapse navbar-collapse" id="navDemo">\n      <ul class="navbar-nav ms-auto">\n        <li class="nav-item"><a class="nav-link active" href="#">Lessons</a></li>\n        <li class="nav-item"><a class="nav-link" href="#">Practice</a></li>\n        <li class="nav-item"><a class="nav-link" href="#">Review</a></li>\n      </ul>\n    </div>\n  </div>\n</nav>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'forms-controls',
    objective: 'Style textual inputs, textareas, and selects using .form-control, .form-select, and associated accessible labels.',
    estimatedMinutes: 6,
    takeaways: [
      '.form-control provides standard focus styling, padding, and border radius across all text inputs.',
      'Always associate labels with inputs using the for attribute matching the input id.',
      '.form-select provides styled custom dropdown pickers.',
      '.form-check wraps checkboxes and radio buttons to ensure consistent alignment and clickable label targets.',
    ],
    terms: {
      formControl: {
        term: '.form-control',
        definition: 'Styles text inputs, file inputs, textareas, and color inputs.',
      },
      formLabel: {
        term: '.form-label',
        definition: 'Provides proper margin and typography for form field labels.',
      },
    },
    a11yNotes: [
      'Never omit labels in favor of placeholder attributes. Placeholders disappear upon typing and lack sufficient contrast in default browser user-agent stylesheets.',
    ],
    sections: [
      {
        id: 'form-basics',
        heading: 'Standard Form Markup',
        body: [
          'Bootstrap form controls are styled with standardized classes: .form-control for inputs and .form-select for dropdowns.',
          'Labels should carry .form-label and for="inputId" matching the control id.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-forms',
        title: 'Bootstrap Form Controls',
        files: [
          {
            name: 'index.html',
            content: `<form class="p-3 border rounded bg-white" style="max-width: 24rem;">\n  <div class="mb-3">\n    <label for="fullName" class="form-label">Full Name</label>\n    <input type="text" class="form-control" id="fullName" placeholder="Jane Doe">\n  </div>\n  <div class="mb-3 form-check">\n    <input type="checkbox" class="form-check-input" id="newsletter">\n    <label class="form-check-label" for="newsletter">Send me weekly updates</label>\n  </div>\n  <button type="submit" class="btn btn-primary w-100">Submit</button>\n</form>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'auth-forms',
    objective: 'Design clean login and registration form interfaces with validation feedback states (.is-invalid, .invalid-feedback) (FC-27).',
    estimatedMinutes: 6,
    takeaways: [
      'Authentication forms in CodeOrbit are strictly presentation exercises: no accounts are created or credentials stored.',
      '.is-invalid highlights inputs with a red border and exclamation icon.',
      '.invalid-feedback displays explanatory error text below invalid controls.',
      'Floating labels (.form-floating) animate labels into the upper border when fields have content.',
    ],
    terms: {
      isInvalid: {
        term: '.is-invalid',
        definition: 'Validation class applying error styling to inputs.',
      },
      invalidFeedback: {
        term: '.invalid-feedback',
        definition: 'Block or tooltip displaying contextual validation error messages.',
      },
    },
    a11yNotes: [
      'Invalid fields should include aria-invalid="true" and aria-describedby referencing the ID of the .invalid-feedback message to ensure screen readers announce the exact reason for rejection.',
    ],
    sections: [
      {
        id: 'auth-presentation',
        heading: 'Authentication Form Presentation',
        body: [
          'Modern authentication interfaces require clear structure, input affordances, and unmistakable feedback.',
          'In CodeOrbit, all authentication exercises are purely UI presentation exercises. No network requests are made, and no credentials are sent or stored anywhere.',
          '.is-invalid combined with .invalid-feedback provides clear visual guidance.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-auth',
        title: 'Authentication Form with Validation States',
        files: [
          {
            name: 'index.html',
            content: `<div class="container my-3 d-flex justify-content-center">\n  <div class="card p-4 shadow-sm" style="width: 100%; max-width: 24rem;">\n    <h4 class="card-title text-center mb-3">Account Login</h4>\n    <div class="mb-3">\n      <label for="demoEmail" class="form-label">Email</label>\n      <input type="email" class="form-control is-invalid" id="demoEmail" value="user@domain">\n      <div class="invalid-feedback">Please provide a complete domain (e.g. .com).</div>\n    </div>\n    <div class="mb-3">\n      <label for="demoPass" class="form-label">Password</label>\n      <input type="password" class="form-control" id="demoPass" placeholder="••••••••">\n    </div>\n    <button type="button" class="btn btn-primary w-100">Log In</button>\n  </div>\n</div>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'responsive-patterns',
    objective: 'Combine navbars, container grids, and cards into comprehensive responsive application layouts.',
    estimatedMinutes: 6,
    takeaways: [
      'Complex responsive pages combine multiple Bootstrap primitives: containers, grid rows, cards, and utility alignments.',
      'Flexbox utility classes replace custom CSS flex rules for micro-layouts.',
      'Testing breakpoint behavior across device frames confirms smooth grid transitions.',
      'Keep markup modular by separating global navigation, hero/alert banners, and content grids.',
    ],
    terms: {
      cardGrid: {
        term: 'Card Grid',
        definition: 'A row of columns where each column contains an identical card component for catalogs or dashboards.',
      },
      flexUtilities: {
        term: 'Flex Utilities',
        definition: 'Classes like d-flex, flex-column, justify-content-between controlling flexbox properties inline.',
      },
    },
    a11yNotes: [
      'Verify that touch targets on buttons and navigation items are at least 44×44 CSS pixels on mobile viewports to prevent mis-taps.',
    ],
    sections: [
      {
        id: 'dashboard-patterns',
        heading: 'Assembling Responsive Dashboards',
        body: [
          'A complete responsive dashboard pattern brings all Bootstrap building blocks together: responsive navbar, alert banner, and 12-column card grid.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-bs-patterns',
        title: 'Mini Dashboard Layout',
        files: [
          {
            name: 'index.html',
            content: `<div class="container my-4">\n  <div class="d-flex justify-content-between align-items-center mb-3">\n    <h3 class="mb-0">Overview</h3>\n    <button class="btn btn-sm btn-outline-primary">Refresh</button>\n  </div>\n  <div class="row g-3">\n    <div class="col-md-6 col-lg-4">\n      <div class="card p-3 shadow-sm border-0 bg-light">\n        <h6 class="text-muted">Total Learners</h6>\n        <h2 class="text-primary mb-0">1,248</h2>\n      </div>\n    </div>\n    <div class="col-md-6 col-lg-4">\n      <div class="card p-3 shadow-sm border-0 bg-light">\n        <h6 class="text-muted">Completed Labs</h6>\n        <h2 class="text-success mb-0">94%</h2>\n      </div>\n    </div>\n  </div>\n</div>`,
          },
        ],
      },
    ],
  },
]
