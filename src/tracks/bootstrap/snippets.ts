export interface BootstrapSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
}

export const BOOTSTRAP_SNIPPETS: BootstrapSnippet[] = [
  {
    id: 'snip-bs-navbar',
    title: 'Accessible Responsive Navbar',
    description: 'Bootstrap 5 responsive header with branding, hamburger toggler button, and collapsible navigation links.',
    language: 'html',
    code: `<nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Brand</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Features</a></li>
      </ul>
    </div>
  </div>
</nav>`,
  },
  {
    id: 'snip-bs-card-grid',
    title: 'Responsive 3-Column Card Grid',
    description: '12-column grid layout adapting from 1 column on mobile to 3 columns on desktops.',
    language: 'html',
    code: `<div class="container my-4">
  <div class="row g-4">
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Card Title</h5>
          <p class="card-text">Content description for column 1.</p>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Card Title</h5>
          <p class="card-text">Content description for column 2.</p>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-12 col-lg-4">
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">Card Title</h5>
          <p class="card-text">Content description for column 3.</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: 'snip-bs-login-form',
    title: 'Login Form with Validation States',
    description: 'Card-enclosed authentication form presentation featuring .is-invalid and .invalid-feedback.',
    language: 'html',
    code: `<div class="card p-4 shadow-sm" style="max-width: 24rem;">
  <h4 class="text-center mb-3">Sign In</h4>
  <form>
    <div class="mb-3">
      <label for="loginEmail" class="form-label">Email address</label>
      <input type="email" class="form-control is-invalid" id="loginEmail" value="bad@">
      <div class="invalid-feedback">Please enter a valid email address.</div>
    </div>
    <div class="mb-3">
      <label for="loginPass" class="form-label">Password</label>
      <input type="password" class="form-control" id="loginPass">
    </div>
    <button type="button" class="btn btn-primary w-100">Sign In</button>
  </form>
</div>`,
  },
  {
    id: 'snip-bs-alert-dismiss',
    title: 'Contextual Alert Banner',
    description: 'Polite announcement alert using role="alert" and Bootstrap theme colors.',
    language: 'html',
    code: `<div class="alert alert-success d-flex align-items-center" role="alert">
  <div>
    <strong>Success!</strong> Your changes have been saved successfully.
  </div>
</div>`,
  },
  {
    id: 'snip-bs-pricing-table',
    title: 'Responsive Pricing Table',
    description: 'Tiered pricing cards using flexbox utilities and responsive grid columns.',
    language: 'html',
    code: `<div class="container my-5">
  <div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
    <div class="col">
      <div class="card mb-4 rounded-3 shadow-sm">
        <div class="card-header py-3"><h4 class="my-0 fw-normal">Free</h4></div>
        <div class="card-body">
          <h1 class="card-title pricing-card-title">$0<small class="text-muted fw-light">/mo</small></h1>
          <button type="button" class="w-100 btn btn-lg btn-outline-primary">Sign up for free</button>
        </div>
      </div>
    </div>
    <div class="col">
      <div class="card mb-4 rounded-3 shadow-sm border-primary">
        <div class="card-header py-3 text-bg-primary border-primary"><h4 class="my-0 fw-normal">Pro</h4></div>
        <div class="card-body">
          <h1 class="card-title pricing-card-title">$15<small class="text-muted fw-light">/mo</small></h1>
          <button type="button" class="w-100 btn btn-lg btn-primary">Get started</button>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
]
