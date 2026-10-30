import type { Challenge } from '../../data/types'

export const bootstrapChallenges: Challenge[] = [
  {
    id: 'bs-ch-grid-system',
    topicId: 'grid-system',
    title: 'Construct a Responsive 3-Column Grid',
    difficulty: 'beginner',
    prompt:
      'Build a responsive 12-column card grid using Bootstrap. Place a .row inside a .container, and add three columns that each span 12 units on mobile, 6 units on medium viewports (md), and 4 units on large viewports (lg).',
    objective: 'Create a responsive 3-column layout using Bootstrap container, row, and column breakpoint classes.',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Grid Challenge</title>
</head>
<body>
  <!-- Build your responsive grid inside a container here -->
  <div>
    <p>Replace this with a .container, .row, and responsive .col-* elements.</p>
  </div>
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-grid-container',
        description: 'Provide a .container element wrapping the grid layout',
        explanation: 'A .container centers content horizontally and applies proper responsive max-widths and gutters.',
        rule: { kind: 'selector', selector: '.container', min: 1 },
      },
      {
        id: 'bs-req-grid-row-col',
        description: 'Structure a .row containing at least 3 column elements',
        explanation: 'The Bootstrap grid requires columns (.col or .col-*) to be direct children of a .row.',
        rule: { kind: 'gridStructure', expectedCols: 3 },
      },
      {
        id: 'bs-req-grid-breakpoints',
        description: 'Apply responsive column classes (col-12, col-md-6, and col-lg-4)',
        explanation: 'Combining col-12, col-md-6, and col-lg-4 ensures the grid stacks on mobile, splits into 2 on tablet, and spreads into 3 on desktop.',
        rule: { kind: 'hasClass', selector: '.row > div', className: 'col-lg-4' },
      },
    ],
    hints: [
      'Start by creating an outer <div class="container"> followed by a <div class="row"> inside it.',
      'Inside the row, create three <div> elements, each having classes "col-12 col-md-6 col-lg-4".',
      'Add cards or content boxes with padding (e.g. class="p-3 border bg-light") inside each column so they are clearly visible.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Grid Challenge</title>
</head>
<body>
  <div class="container my-4">
    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="p-3 border rounded bg-light text-center">Feature A</div>
      </div>
      <div class="col-12 col-md-6 col-lg-4">
        <div class="p-3 border rounded bg-light text-center">Feature B</div>
      </div>
      <div class="col-12 col-md-12 col-lg-4">
        <div class="p-3 border rounded bg-light text-center">Feature C</div>
      </div>
    </div>
  </div>
</body>
</html>`,
    solutionExplanation: [
      'The outer <div class="container"> provides consistent margins and gutters.',
      'The <div class="row"> acts as the flexbox wrapper counteracting outer padding.',
      'Each column uses "col-12 col-md-6 col-lg-4" to achieve smooth multi-device responsiveness.',
    ],
  },
  {
    topicId: 'containers-layout',
    id: 'bs-ch-containers-layout',
    title: 'Configure Fluid and Responsive Containers',
    difficulty: 'beginner',
    prompt:
      'Create a layout that demonstrates both fluid full-width headers and centered content. Include a full-width .container-fluid hero section and a standard .container content section with a .row and columns.',
    objective: 'Combine .container-fluid for full-width sections and .container for bounded content grids.',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Containers Layout</title>
</head>
<body>
  <!-- Add a .container-fluid header and a .container section -->
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-fluid-container',
        description: 'Include a full-width .container-fluid section',
        explanation: '.container-fluid ensures headers or hero banners stretch edge-to-edge.',
        rule: { kind: 'selector', selector: '.container-fluid', min: 1 },
      },
      {
        id: 'bs-req-fixed-container',
        description: 'Include a standard .container section with a .row',
        explanation: 'Standard .container bounds reading content to responsive max-width thresholds.',
        rule: { kind: 'gridStructure', expectedCols: 1 },
      },
    ],
    hints: [
      'Create a <header class="container-fluid bg-dark text-white p-4"> for the full-width banner.',
      'Below the header, add a <main class="container my-4"> with a <div class="row"> and column content.',
      'Ensure the .row has at least one column with class "col-12" or "col".',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Containers Layout</title>
</head>
<body>
  <header class="container-fluid bg-primary text-white py-4 px-3 mb-4">
    <h1 class="h3">CodeOrbit Learning Lab</h1>
    <p class="mb-0">Full-width fluid header banner.</p>
  </header>
  <main class="container">
    <div class="row">
      <div class="col-12">
        <p class="lead">Bounded container content with structured max-widths.</p>
      </div>
    </div>
  </main>
</body>
</html>`,
    solutionExplanation: [
      '.container-fluid provides edge-to-edge styling for the header.',
      '.container bounds the main reading column to ergonomic line lengths at desktop widths.',
    ],
  },
  {
    topicId: 'utilities',
    id: 'bs-ch-utilities',
    title: 'Style Badges and Spacing with Utilities',
    difficulty: 'beginner',
    prompt:
      'Build a status summary widget styled entirely with Bootstrap utility classes. Use margin and padding utilities (e.g. p-3, mb-3), background color utilities (bg-light), text utilities (text-primary, text-muted), and badge components (.badge).',
    objective: 'Apply atomic Bootstrap spacing, typography, and color utilities without custom CSS.',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Utilities Challenge</title>
</head>
<body>
  <!-- Style this card using utility classes and badges -->
  <div>
    <h3>Project Status</h3>
    <p>Frontend Track</p>
    <span>Complete</span>
  </div>
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-util-padding',
        description: 'Apply padding and margin utilities (e.g. p-3, p-4, mb-2, mb-3)',
        explanation: 'Spacing utilities ensure consistent visual breathing room.',
        rule: { kind: 'hasClass', selector: 'div', className: 'p-4' },
      },
      {
        id: 'bs-req-util-badge',
        description: 'Use a Bootstrap .badge with contextual background (e.g. bg-success)',
        explanation: '.badge paired with bg-success clearly highlights completion status.',
        rule: { kind: 'selector', selector: '.badge', min: 1 },
      },
      {
        id: 'bs-req-util-text-color',
        description: 'Apply text color utilities (e.g. text-primary or text-muted)',
        explanation: 'Color utilities apply standard theme palette tokens to headings and metadata.',
        rule: { kind: 'hasClass', selector: 'p', className: 'text-muted' },
      },
    ],
    hints: [
      'Wrap your content in a <div class="p-4 bg-light border rounded mb-3"> container.',
      'Add class="text-muted" to the paragraph describing the track.',
      'Add class="badge bg-success" to the completion status span.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Utilities Challenge</title>
</head>
<body>
  <div class="container my-4">
    <div class="p-4 bg-light border rounded shadow-sm">
      <h3 class="text-primary mb-2">Project Status</h3>
      <p class="text-muted mb-3">Frontend Engineering Track</p>
      <div>
        <span class="badge bg-success p-2">Completed</span>
      </div>
    </div>
  </div>
</body>
</html>`,
    solutionExplanation: [
      'Padding utility p-4 and shadow-sm provide clean elevation.',
      'text-primary and text-muted establish clear typographic hierarchy.',
      'The badge component utilizes bg-success to signify completion.',
    ],
  },
  {
    topicId: 'components',
    id: 'bs-ch-components',
    title: 'Assemble Cards, Buttons & Alerts',
    difficulty: 'intermediate',
    prompt:
      'Build a learning module preview card. Include an alert banner (.alert.alert-info) at the top with role="alert", followed by a .card component containing a .card-body, .card-title, .card-text, and a .btn.btn-primary action button.',
    objective: 'Compose Bootstrap core components into a cohesive, accessible learning card pattern.',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Components Challenge</title>
</head>
<body>
  <!-- Build alert and card components here -->
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-comp-alert',
        description: 'Provide an .alert element with role="alert"',
        explanation: 'Alerts provide accessible status messages announced by screen readers.',
        rule: { kind: 'selector', selector: '.alert[role="alert"]', min: 1 },
      },
      {
        id: 'bs-req-comp-card',
        description: 'Provide a .card component containing .card-body and .card-title',
        explanation: 'Cards organize discrete pieces of content into structured visual blocks.',
        rule: { kind: 'selector', selector: '.card .card-body .card-title', min: 1 },
      },
      {
        id: 'bs-req-comp-btn',
        description: 'Include an action button with .btn and .btn-primary classes',
        explanation: 'Bootstrap buttons require the base .btn class and a color variant class like .btn-primary.',
        rule: { kind: 'selector', selector: 'button.btn.btn-primary, a.btn.btn-primary', min: 1 },
      },
    ],
    hints: [
      'Add <div class="alert alert-info" role="alert">New module available!</div> first.',
      'Next, create <div class="card"><div class="card-body">...</div></div>.',
      'Inside .card-body, add <h5 class="card-title">Bootstrap Foundations</h5>, a <p class="card-text">, and a <button type="button" class="btn btn-primary">Start Lab</button>.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Components Challenge</title>
</head>
<body>
  <div class="container my-4" style="max-width: 24rem;">
    <div class="alert alert-info mb-3" role="alert">
      New lesson available for review!
    </div>
    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title">Bootstrap Foundations</h5>
        <p class="card-text">Master layout grids, utilities, and accessible UI components.</p>
        <button type="button" class="btn btn-primary">Start Practice</button>
      </div>
    </div>
  </div>
</body>
</html>`,
    solutionExplanation: [
      'The alert provides contextual feedback with an accessible role="alert".',
      'The card cleanly encapsulates title, description, and primary CTA button.',
    ],
  },
  {
    topicId: 'navbar',
    id: 'bs-ch-navbar',
    title: 'Construct an Accessible Responsive Navbar',
    difficulty: 'intermediate',
    prompt:
      'Construct a complete, accessible Bootstrap responsive navigation header. Implement a <nav class="navbar navbar-expand-lg"> with a .navbar-brand, a .navbar-toggler button with data-bs-toggle="collapse", aria-controls="navbarContent", and aria-expanded="false", and a collapsible container with classes "collapse navbar-collapse" containing .navbar-nav with .nav-link items.',
    objective: 'Implement the full Bootstrap 5 responsive navbar markup contract (FC-26).',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Responsive Navbar Challenge</title>
</head>
<body>
  <!-- Build the responsive navbar here -->
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-navbar-contract',
        description: 'Implement full navbar structure (.navbar, .navbar-toggler, .collapse.navbar-collapse, .navbar-nav)',
        explanation: 'Ensures the markup matches the Bootstrap 5 responsive navigation contract for mobile toggling and accessibility.',
        rule: { kind: 'navbarStructure' },
      },
      {
        id: 'bs-req-navbar-brand',
        description: 'Include a .navbar-brand logo or title link',
        explanation: '.navbar-brand provides standard branding and header identification.',
        rule: { kind: 'selector', selector: '.navbar .navbar-brand', min: 1 },
      },
      {
        id: 'bs-req-navbar-links',
        description: 'Provide at least two .nav-link navigation items inside .navbar-nav',
        explanation: 'Navigation links give users access to primary site sections.',
        rule: { kind: 'selector', selector: '.navbar .navbar-nav .nav-link', min: 2 },
      },
    ],
    hints: [
      'Start with a <nav class="navbar navbar-expand-lg navbar-dark bg-dark"> containing a <div class="container-fluid">.',
      'Add a .navbar-toggler button with data-bs-toggle="collapse", aria-controls="navbarContent", and aria-expanded="false".',
      'Create the collapsible <div class="collapse navbar-collapse" id="navbarContent"> containing <ul class="navbar-nav"><li class="nav-item"><a class="nav-link" href="#">Home</a></li></ul>.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Responsive Navbar Challenge</title>
</head>
<body>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">CodeOrbit</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarContent"
        aria-controls="navbarContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link active" aria-current="page" href="#">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Tracks</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Practice</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</body>
</html>`,
    solutionExplanation: [
      'The toggler includes data-bs-toggle="collapse" and aria-controls="navbarContent", pointing directly to the collapsible menu wrapper.',
      'aria-expanded="false" properly informs screen readers that the menu starts collapsed on small viewports.',
      '.collapse.navbar-collapse wraps the .navbar-nav list items and links.',
    ],
  },
  {
    topicId: 'forms-controls',
    id: 'bs-ch-forms-controls',
    title: 'Design an Accessible Bootstrap Form',
    difficulty: 'beginner',
    prompt:
      'Build a contact or preferences form using Bootstrap form controls. Include at least two text inputs with .form-control, associated labels with .form-label and for attributes, and a select dropdown with .form-select.',
    objective: 'Implement accessible form fields with proper Bootstrap classes and label associations.',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Form Controls Challenge</title>
</head>
<body>
  <form class="p-3">
    <!-- Build labelled form controls here -->
  </form>
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-form-controls-valid',
        description: 'Provide form controls (.form-control or .form-select) with associated labels',
        explanation: 'Every form control must have a clearly associated label for accessibility.',
        rule: { kind: 'formControls' },
      },
      {
        id: 'bs-req-form-select',
        description: 'Include a select element styled with .form-select',
        explanation: '.form-select provides consistent custom styling for select elements.',
        rule: { kind: 'selector', selector: 'select.form-select', min: 1 },
      },
    ],
    hints: [
      'Create a <div class="mb-3"><label for="user" class="form-label">Username</label><input type="text" class="form-control" id="user"></div>.',
      'Add another field for email using <input type="email" class="form-control" id="email"> with a matching label.',
      'Add a dropdown using <select class="form-select" id="role"><option value="student">Student</option></select> with a matching label.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Form Controls Challenge</title>
</head>
<body>
  <div class="container my-4" style="max-width: 26rem;">
    <form class="p-4 border rounded bg-white shadow-sm">
      <div class="mb-3">
        <label for="userName" class="form-label">Full Name</label>
        <input type="text" class="form-control" id="userName" placeholder="Alex Morgan">
      </div>
      <div class="mb-3">
        <label for="userEmail" class="form-label">Email address</label>
        <input type="email" class="form-control" id="userEmail" placeholder="alex@example.com">
      </div>
      <div class="mb-3">
        <label for="trackLevel" class="form-label">Experience Level</label>
        <select class="form-select" id="trackLevel">
          <option selected value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary w-100">Save Preferences</button>
    </form>
  </div>
</body>
</html>`,
    solutionExplanation: [
      'Each form input and select element is styled with .form-control or .form-select.',
      'Labels use class="form-label" and attribute for="id" matching input IDs for accessibility.',
    ],
  },
  {
    topicId: 'auth-forms',
    id: 'bs-ch-auth-forms',
    title: 'Build Login Form with Validation States',
    difficulty: 'intermediate',
    notice: 'Presentation only: nothing is sent or stored.',
    prompt:
      'Design a login interface showcasing client-side validation states. Provide an email input marked with .is-invalid and an accompanying .invalid-feedback container explaining the error, as well as a password input. Remember: this is strictly a presentation lab; no real account is created or credentials sent.',
    objective: 'Implement an authentication login UI with Bootstrap error validation feedback (FC-27).',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authentication Form Challenge</title>
</head>
<body>
  <div class="container my-4">
    <!-- Build login form with .is-invalid and .invalid-feedback here -->
  </div>
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-auth-validation',
        description: 'Provide an input marked with .is-invalid and an .invalid-feedback container',
        explanation: 'Visual validation states and feedback messages guide users to correct input errors.',
        rule: { kind: 'validationFeedback' },
      },
      {
        id: 'bs-req-auth-controls',
        description: 'Ensure inputs have associated labels and .form-control classes',
        explanation: 'Form controls must be fully accessible and associated with labels.',
        rule: { kind: 'formControls' },
      },
      {
        id: 'bs-req-auth-btn',
        description: 'Include a submit or login button with .btn.btn-primary',
        explanation: 'Provides a clear primary action button for form submission.',
        rule: { kind: 'selector', selector: 'button.btn.btn-primary, input[type="submit"].btn.btn-primary', min: 1 },
      },
    ],
    hints: [
      'Wrap your form in a card or bounded container for clean presentation.',
      'Create an email field with <input type="email" class="form-control is-invalid" id="loginEmail"> and an adjacent <div class="invalid-feedback">.',
      'Add a password field and a primary button: <button type="button" class="btn btn-primary w-100">Sign In</button>.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Authentication Form Challenge</title>
</head>
<body>
  <div class="container my-4 d-flex justify-content-center">
    <div class="card p-4 shadow-sm" style="width: 100%; max-width: 24rem;">
      <h3 class="card-title text-center mb-3">Sign In</h3>
      <form>
        <div class="mb-3">
          <label for="loginEmail" class="form-label">Email address</label>
          <input type="email" class="form-control is-invalid" id="loginEmail" value="user@domain">
          <div class="invalid-feedback">Please enter a valid, complete email domain.</div>
        </div>
        <div class="mb-3">
          <label for="loginPass" class="form-label">Password</label>
          <input type="password" class="form-control" id="loginPass" placeholder="••••••••">
        </div>
        <button type="button" class="btn btn-primary w-100">Sign In</button>
      </form>
    </div>
  </div>
</body>
</html>`,
    solutionExplanation: [
      'The email input is styled with .form-control and .is-invalid to demonstrate validation styling.',
      'The .invalid-feedback block appears automatically when adjacent to an .is-invalid control.',
      'The exercise explicitly indicates presentation only, satisfying educational transparency requirements.',
    ],
  },
  {
    topicId: 'responsive-patterns',
    id: 'bs-ch-responsive-patterns',
    title: 'Assemble a Responsive Product Dashboard',
    difficulty: 'advanced',
    prompt:
      'Assemble a complete responsive dashboard interface combining multiple Bootstrap patterns: an accessible responsive navbar (.navbar) at the top, a container grid (.container > .row) displaying responsive product cards (.card), and an announcement alert (.alert.alert-success).',
    objective: 'Integrate navbar, grid layout, and card components into a unified responsive application pattern.',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Responsive Dashboard</title>
</head>
<body>
  <!-- Integrate navbar, alert, and card grid here -->
</body>
</html>`,
    requirements: [
      {
        id: 'bs-req-pat-navbar',
        description: 'Provide an accessible responsive navbar with toggler and navigation links',
        explanation: 'Enforces top-level site navigation structure matching the Bootstrap navbar contract.',
        rule: { kind: 'navbarStructure' },
      },
      {
        id: 'bs-req-pat-grid',
        description: 'Provide a responsive card grid with at least 2 column cards',
        explanation: 'Organizes content into a multi-column responsive grid layout.',
        rule: { kind: 'gridStructure', expectedCols: 2 },
      },
      {
        id: 'bs-req-pat-alert',
        description: 'Include an alert banner with role="alert"',
        explanation: 'Communicates status updates to learners and assistive technologies.',
        rule: { kind: 'selector', selector: '.alert[role="alert"]', min: 1 },
      },
    ],
    hints: [
      'Build the navbar first using <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">.',
      'Inside the main container, place an <div class="alert alert-success" role="alert">Catalog updated!</div>.',
      'Follow the alert with a <div class="row g-3"> containing two <div class="col-md-6"><div class="card">...</div></div> cards.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Responsive Dashboard</title>
</head>
<body>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark mb-4">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">OrbitShop</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#shopNav" aria-controls="shopNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="shopNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link active" href="#">Store</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Orders</a></li>
        </ul>
      </div>
    </div>
  </nav>

  <main class="container">
    <div class="alert alert-success mb-4" role="alert">
      Welcome to the responsive store dashboard!
    </div>
    <div class="row g-4">
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">Frontend Starter Kit</h5>
            <p class="card-text">Comprehensive toolkit with pre-configured tools and presets.</p>
            <button type="button" class="btn btn-outline-primary">View Kit</button>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">Design Tokens Pack</h5>
            <p class="card-text">Harmonized palettes, spacing scales, and accessible typographic tokens.</p>
            <button type="button" class="btn btn-outline-primary">View Tokens</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</body>
</html>`,
    solutionExplanation: [
      'The responsive navbar expands horizontally on tablets/desktops and collapses into a toggler on mobile screens.',
      'The grid cleanly organizes product cards into 2 columns on medium screens and 1 column on mobile.',
      'The alert provides polite accessible feedback.',
    ],
  },
]
