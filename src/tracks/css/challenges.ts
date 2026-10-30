import type { Challenge } from '../../data/types'

export const cssChallenges: Challenge[] = [
  {
    id: 'ch-css-selectors',
    topicId: 'selectors',
    title: 'Precision Styling with Selectors',
    difficulty: 'beginner',
    prompt: 'Style the card and its title using class selectors while maintaining low specificity.',
    objective: 'Apply padding to .card, set title color on .card-title, and avoid using ID selectors.',
    starterCode: `/* Style the card and title below */
.card {
}

.card-title {
}
`,
    solutionCode: `.card {
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.card-title {
  color: #1e293b;
  font-size: 1.25rem;
}
`,
    solutionExplanation: [
      'The .card selector applies internal padding of 16px to create breathing room.',
      'The .card-title selector sets the headline color to high-contrast #1e293b.',
      'Using classes rather than IDs keeps specificity flat and easy to maintain.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Card Preview</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <h2 class="card-title">Card Headline</h2>
    <p>Card body text styled cleanly with CSS classes.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `/* Style the card and title below */
.card {
}

.card-title {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Card Preview</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="card">
    <h2 class="card-title">Card Headline</h2>
    <p>Card body text styled cleanly with CSS classes.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.card {
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
}

.card-title {
  color: #1e293b;
  font-size: 1.25rem;
}
`,
      },
    ],
    requirements: [
      {
        id: 'card-padding',
        description: 'Declare padding: 16px on .card',
        explanation: 'The .card selector must set padding to 16px.',
        rule: { kind: 'ruleExists', selector: '.card', property: 'padding', value: '16px' },
      },
      {
        id: 'title-color',
        description: 'Set color: #1e293b on .card-title',
        explanation: 'The .card-title selector must declare color as #1e293b.',
        rule: { kind: 'ruleExists', selector: '.card-title', property: 'color', value: '#1e293b' },
      },
      {
        id: 'title-specificity',
        description: 'Keep selector specificity low (classes only)',
        explanation: 'Do not use ID selectors or inline styles for .card-title.',
        rule: { kind: 'specificityBelow', selector: '.card-title', max: [0, 1, 0] },
      },
    ],
    hints: [
      'Select the container using the class selector .card { padding: 16px; }',
      'Target the headline using .card-title { color: #1e293b; }',
      'Avoid adding IDs or parent element qualifiers like div.card h2 to keep specificity minimal.',
    ],
  },
  {
    id: 'ch-css-cascade-specificity',
    topicId: 'cascade-specificity',
    title: 'Controlling Cascade and Priority',
    difficulty: 'beginner',
    prompt: 'Style the alert message box using clean class rules that follow the cascade correctly.',
    objective: 'Declare border-radius on .alert and set the alert-warning background color.',
    starterCode: `/* Manage the alert cascade */
.alert {
}

.alert-warning {
}
`,
    solutionCode: `.alert {
  border-radius: 8px;
  padding: 12px 16px;
}

.alert-warning {
  background-color: #fef3c7;
  color: #92400e;
}
`,
    solutionExplanation: [
      'Base styles like border-radius belong on the general .alert class.',
      'Variant styles like background-color are added by the modifier .alert-warning class.',
      'Keeping both selectors at (0, 1, 0) specificity allows easy compositional overrides.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alert Box</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="alert alert-warning">
    <strong>Caution:</strong> System updates are scheduled tonight.
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `/* Manage the alert cascade */
.alert {
}

.alert-warning {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Alert Box</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="alert alert-warning">
    <strong>Caution:</strong> System updates are scheduled tonight.
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.alert {
  border-radius: 8px;
  padding: 12px 16px;
}

.alert-warning {
  background-color: #fef3c7;
  color: #92400e;
}
`,
      },
    ],
    requirements: [
      {
        id: 'alert-radius',
        description: 'Declare border-radius: 8px on .alert',
        explanation: 'Base styling for .alert must include border-radius: 8px.',
        rule: { kind: 'ruleExists', selector: '.alert', property: 'border-radius', value: '8px' },
      },
      {
        id: 'warning-bg',
        description: 'Set background-color: #fef3c7 on .alert-warning',
        explanation: '.alert-warning modifier must declare background-color: #fef3c7.',
        rule: { kind: 'ruleExists', selector: '.alert-warning', property: 'background-color', value: '#fef3c7' },
      },
      {
        id: 'warning-specificity',
        description: 'Keep specificity below or equal to [0, 1, 0]',
        explanation: 'Use single class selector for .alert-warning without ID qualifiers.',
        rule: { kind: 'specificityBelow', selector: '.alert-warning', max: [0, 1, 0] },
      },
    ],
    hints: [
      'Put common styles in the base .alert rule: border-radius: 8px;',
      'Add variant styles in .alert-warning: background-color: #fef3c7;',
      'Rely on class combination in HTML (.alert.alert-warning) rather than high specificity.',
    ],
  },
  {
    id: 'ch-css-pseudo-classes',
    topicId: 'pseudo-classes',
    title: 'Accessible Interactive Button States',
    difficulty: 'beginner',
    prompt: 'Style the interactive button with clear :hover feedback and keyboard :focus-visible outlines.',
    objective: 'Provide a hover background and a distinct focus ring without using outline: none.',
    starterCode: `.primary-btn {
  background-color: #2563eb;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
}
`,
    solutionCode: `.primary-btn {
  background-color: #2563eb;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
}

.primary-btn:hover {
  background-color: #1d4ed8;
}

.primary-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
`,
    solutionExplanation: [
      ':hover darkens the button background to provide immediate visual feedback for mouse interactions.',
      ':focus-visible supplies a crisp outline for keyboard users navigating via Tab.',
      'Using :focus-visible avoids intrusive focus rings on mouse click while preserving accessibility.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Button States</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <button class="primary-btn">Interactive Button</button>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.primary-btn {
  background-color: #2563eb;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Button States</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <button class="primary-btn">Interactive Button</button>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.primary-btn {
  background-color: #2563eb;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
}

.primary-btn:hover {
  background-color: #1d4ed8;
}

.primary-btn:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
`,
      },
    ],
    requirements: [
      {
        id: 'btn-hover',
        description: 'Declare background-color: #1d4ed8 on .primary-btn:hover',
        explanation: 'The hover state must darken the button with background-color: #1d4ed8.',
        rule: { kind: 'ruleExists', selector: '.primary-btn:hover', property: 'background-color', value: '#1d4ed8' },
      },
      {
        id: 'btn-focus',
        description: 'Declare outline: 2px solid #2563eb on .primary-btn:focus-visible',
        explanation: 'Keyboard users need a prominent outline on :focus-visible.',
        rule: { kind: 'ruleExists', selector: '.primary-btn:focus-visible', property: 'outline', value: '2px solid #2563eb' },
      },
    ],
    hints: [
      'Add a rule for .primary-btn:hover setting background-color: #1d4ed8;',
      'Add .primary-btn:focus-visible with outline: 2px solid #2563eb;',
      'Notice how :focus-visible keeps keyboard navigation accessible.',
    ],
  },
  {
    id: 'ch-css-box-model',
    topicId: 'box-model',
    title: 'Box Model and border-box Sizing',
    difficulty: 'beginner',
    prompt: 'Implement predictable sizing using box-sizing: border-box with declared padding and margin.',
    objective: 'Apply border-box sizing and format the content box spacing.',
    starterCode: `/* Set up border-box and box spacing */
* {
}

.content-box {
}
`,
    solutionCode: `* {
  box-sizing: border-box;
}

.content-box {
  padding: 24px;
  margin: 16px;
  border: 2px solid #cbd5e1;
  background-color: #f1f5f9;
}
`,
    solutionExplanation: [
      'box-sizing: border-box ensures padding and borders are calculated inside declared widths.',
      'padding: 24px creates consistent breathing space inside the box.',
      'margin: 16px separates the box from surrounding sibling content.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Box Model</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="content-box">
    <h3>Sized Container</h3>
    <p>Padding and border are contained within declared dimensions.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `/* Set up border-box and box spacing */
* {
}

.content-box {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Box Model</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="content-box">
    <h3>Sized Container</h3>
    <p>Padding and border are contained within declared dimensions.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `* {
  box-sizing: border-box;
}

.content-box {
  padding: 24px;
  margin: 16px;
  border: 2px solid #cbd5e1;
  background-color: #f1f5f9;
}
`,
      },
    ],
    requirements: [
      {
        id: 'box-sizing-rule',
        description: 'Declare box-sizing: border-box',
        explanation: 'Declare box-sizing: border-box to ensure borders and padding do not expand container widths.',
        rule: { kind: 'declares', property: 'box-sizing', pattern: 'border-box' },
      },
      {
        id: 'box-padding',
        description: 'Set padding: 24px on .content-box',
        explanation: '.content-box must declare padding of 24px.',
        rule: { kind: 'ruleExists', selector: '.content-box', property: 'padding', value: '24px' },
      },
      {
        id: 'box-margin',
        description: 'Set margin: 16px on .content-box',
        explanation: '.content-box must declare margin of 16px.',
        rule: { kind: 'ruleExists', selector: '.content-box', property: 'margin', value: '16px' },
      },
    ],
    hints: [
      'Apply box-sizing: border-box to the universal selector * { ... }',
      'In .content-box, specify padding: 24px;',
      'Add margin: 16px; to space the box from surrounding elements.',
    ],
  },
  {
    id: 'ch-css-colour-typography',
    topicId: 'colour-typography',
    title: 'Accessible Color & Typography Hierarchy',
    difficulty: 'beginner',
    prompt: 'Configure a clean typography stack on body and set high-contrast colors on the prose block.',
    objective: 'Establish sans-serif font family, 1.6 line height, and #1e293b text color.',
    starterCode: `body {
}

.prose {
}
`,
    solutionCode: `body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

.prose {
  color: #1e293b;
  max-width: 65ch;
}
`,
    solutionExplanation: [
      'A system font stack ensures crisp native rendering and fast load times.',
      'line-height: 1.6 satisfies WCAG guidelines for comfortable reading.',
      'color: #1e293b provides a strong contrast ratio exceeding 4.5:1 against light backgrounds.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Typography & Contrast</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <article class="prose">
    <h1>Typography Hierarchy</h1>
    <p>Readability depends on clean typefaces, adequate line spacing, and strong luminance contrast.</p>
  </article>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `body {
}

.prose {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Typography & Contrast</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <article class="prose">
    <h1>Typography Hierarchy</h1>
    <p>Readability depends on clean typefaces, adequate line spacing, and strong luminance contrast.</p>
  </article>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `body {
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

.prose {
  color: #1e293b;
  max-width: 65ch;
}
`,
      },
    ],
    requirements: [
      {
        id: 'body-font',
        description: 'Set font-family with sans-serif fallback on body',
        explanation: 'body must declare a font-family containing sans-serif.',
        rule: { kind: 'ruleExists', selector: 'body', property: 'font-family', value: /sans-serif/i },
      },
      {
        id: 'body-line-height',
        description: 'Set line-height: 1.6 on body',
        explanation: 'body must specify line-height: 1.6 for comfortable reading.',
        rule: { kind: 'ruleExists', selector: 'body', property: 'line-height', value: '1.6' },
      },
      {
        id: 'prose-color',
        description: 'Set color: #1e293b on .prose',
        explanation: '.prose must declare high-contrast color #1e293b.',
        rule: { kind: 'ruleExists', selector: '.prose', property: 'color', value: '#1e293b' },
      },
    ],
    hints: [
      'In body, declare font-family: system-ui, sans-serif; and line-height: 1.6;',
      'In .prose, declare color: #1e293b;',
      'Unitless line-height scales accurately when headers adjust their font size.',
    ],
  },
  {
    id: 'ch-css-float-and-clear',
    topicId: 'float-and-clear',
    title: 'Editorial Float & Clear Mechanics',
    difficulty: 'intermediate',
    prompt: 'Float the editorial illustration and implement a clearfix to prevent parent container collapse.',
    objective: 'Float .editorial-img to the left and declare clear: both on the clearfix helper.',
    starterCode: `.editorial-img {
}

.clearfix::after {
}
`,
    solutionCode: `.editorial-img {
  float: left;
  margin-right: 16px;
  margin-bottom: 8px;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
`,
    solutionExplanation: [
      'float: left pulls the editorial image to the left and allows text to flow along its right side.',
      'clear: both inside the ::after pseudo-element forces the parent container to enclose floated items.',
      'Understanding floats clarifies why modern Flexbox and Grid were developed for page layouts.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Float Layout</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="article-box clearfix">
    <div class="editorial-img" style="width: 80px; height: 80px; background: #fbbf24;"></div>
    <p>Text wraps smoothly around this editorial visual element.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.editorial-img {
}

.clearfix::after {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Float Layout</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="article-box clearfix">
    <div class="editorial-img" style="width: 80px; height: 80px; background: #fbbf24;"></div>
    <p>Text wraps smoothly around this editorial visual element.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.editorial-img {
  float: left;
  margin-right: 16px;
  margin-bottom: 8px;
}

.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
`,
      },
    ],
    requirements: [
      {
        id: 'img-float',
        description: 'Declare float: left on .editorial-img',
        explanation: '.editorial-img must declare float: left to allow text wrapping.',
        rule: { kind: 'ruleExists', selector: '.editorial-img', property: 'float', value: 'left' },
      },
      {
        id: 'clearfix-declares',
        description: 'Declare clear: both to self-clear the container',
        explanation: 'The stylesheet must declare clear: both to clear floats.',
        rule: { kind: 'declares', property: 'clear', pattern: 'both' },
      },
    ],
    hints: [
      'In .editorial-img, declare float: left;',
      'For the clearfix helper, declare content: ""; display: table; clear: both; on .clearfix::after',
      'The clearfix ensures the parent container expands to encompass the floated image.',
    ],
  },
  {
    id: 'ch-css-flexbox',
    topicId: 'flexbox',
    title: 'Responsive Navigation Bar with Flexbox',
    difficulty: 'intermediate',
    prompt: 'Lay out the site navigation header using Flexbox with space-between distribution and cross-axis centering.',
    objective: 'Apply display: flex, justify-content: space-between, and align-items: center on .navbar.',
    starterCode: `.navbar {
}

.nav-links {
}
`,
    solutionCode: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background-color: #ffffff;
}

.nav-links {
  display: flex;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}
`,
    solutionExplanation: [
      'display: flex creates a flex formatting context for the navigation bar.',
      'justify-content: space-between distributes the brand logo and nav links to opposite ends.',
      'align-items: center aligns items vertically on the cross axis.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flexbox Navbar</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="navbar">
    <div class="logo">CodeOrbit</div>
    <ul class="nav-links">
      <li><a href="#home">Home</a></li>
      <li><a href="#learn">Learn</a></li>
      <li><a href="#profile">Profile</a></li>
    </ul>
  </header>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.navbar {
}

.nav-links {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flexbox Navbar</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="navbar">
    <div class="logo">CodeOrbit</div>
    <ul class="nav-links">
      <li><a href="#home">Home</a></li>
      <li><a href="#learn">Learn</a></li>
      <li><a href="#profile">Profile</a></li>
    </ul>
  </header>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background-color: #ffffff;
}

.nav-links {
  display: flex;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
}
`,
      },
    ],
    requirements: [
      {
        id: 'navbar-display-flex',
        description: 'Use display: flex layout',
        explanation: 'The stylesheet must declare display: flex.',
        rule: { kind: 'usesDisplay', value: 'flex' },
      },
      {
        id: 'navbar-justify',
        description: 'Set justify-content: space-between on .navbar',
        explanation: '.navbar must spread its items apart with justify-content: space-between.',
        rule: { kind: 'ruleExists', selector: '.navbar', property: 'justify-content', value: 'space-between' },
      },
      {
        id: 'navbar-align',
        description: 'Set align-items: center on .navbar',
        explanation: '.navbar must vertically center items with align-items: center.',
        rule: { kind: 'ruleExists', selector: '.navbar', property: 'align-items', value: 'center' },
      },
    ],
    hints: [
      'In .navbar, declare display: flex;',
      'Add justify-content: space-between; to push the logo and navigation links to opposite ends.',
      'Add align-items: center; so the logo and links align vertically.',
    ],
  },
  {
    id: 'ch-css-grid',
    topicId: 'grid',
    title: 'Two-Dimensional Dashboard Card Grid',
    difficulty: 'intermediate',
    prompt: 'Construct a responsive multi-column dashboard grid using CSS Grid and repeat() tracks.',
    objective: 'Declare display: grid, repeat column tracks, and gap on .dashboard-grid.',
    starterCode: `.dashboard-grid {
}

.card {
}
`,
    solutionCode: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
`,
    solutionExplanation: [
      'display: grid establishes a two-dimensional grid container.',
      'grid-template-columns: repeat(3, 1fr) creates three equal-width fraction tracks.',
      'gap: 16px provides consistent gutters without outer margin complications.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard Grid</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="dashboard-grid">
    <div class="card"><h3>Analytics</h3><p>Active Users</p></div>
    <div class="card"><h3>Progress</h3><p>85% completed</p></div>
    <div class="card"><h3>Streak</h3><p>14 days active</p></div>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.dashboard-grid {
}

.card {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dashboard Grid</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="dashboard-grid">
    <div class="card"><h3>Analytics</h3><p>Active Users</p></div>
    <div class="card"><h3>Progress</h3><p>85% completed</p></div>
    <div class="card"><h3>Streak</h3><p>14 days active</p></div>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}
`,
      },
    ],
    requirements: [
      {
        id: 'grid-display',
        description: 'Use display: grid layout',
        explanation: 'The stylesheet must declare display: grid.',
        rule: { kind: 'usesDisplay', value: 'grid' },
      },
      {
        id: 'grid-columns',
        description: 'Define repeat columns with repeat(3, 1fr) on .dashboard-grid',
        explanation: '.dashboard-grid must specify grid-template-columns using repeat.',
        rule: { kind: 'ruleExists', selector: '.dashboard-grid', property: 'grid-template-columns', value: /repeat/i },
      },
      {
        id: 'grid-gap',
        description: 'Declare gap: 16px on .dashboard-grid',
        explanation: '.dashboard-grid must declare gap: 16px between cells.',
        rule: { kind: 'ruleExists', selector: '.dashboard-grid', property: 'gap', value: '16px' },
      },
    ],
    hints: [
      'In .dashboard-grid, declare display: grid;',
      'Use grid-template-columns: repeat(3, 1fr); to generate 3 equal fraction columns.',
      'Specify gap: 16px; for clean spacing between grid items.',
    ],
  },
  {
    id: 'ch-css-positioning',
    topicId: 'positioning',
    title: 'Overlay Badge with Relative & Absolute Positioning',
    difficulty: 'intermediate',
    prompt: 'Pin a promotional badge to the top-right corner of a card without disrupting the normal document flow.',
    objective: 'Set position: relative on .badge-card, and position: absolute with top: 8px on .card-badge.',
    starterCode: `.badge-card {
}

.card-badge {
}
`,
    solutionCode: `.badge-card {
  position: relative;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}
`,
    solutionExplanation: [
      'position: relative on .badge-card establishes the positioning context for its children.',
      'position: absolute removes .card-badge from flow and positions it inside the parent card.',
      'top: 8px and right: 8px anchor the badge precisely in the upper-right corner.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Badge Overlay</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="badge-card">
    <span class="card-badge">HOT</span>
    <h2>Specialist Track</h2>
    <p>Comprehensive hands-on challenges and knowledge checks.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.badge-card {
}

.card-badge {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Badge Overlay</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="badge-card">
    <span class="card-badge">HOT</span>
    <h2>Specialist Track</h2>
    <p>Comprehensive hands-on challenges and knowledge checks.</p>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.badge-card {
  position: relative;
  padding: 24px;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
}
`,
      },
    ],
    requirements: [
      {
        id: 'parent-relative',
        description: 'Set position: relative on .badge-card',
        explanation: '.badge-card must establish a positioning context with position: relative.',
        rule: { kind: 'ruleExists', selector: '.badge-card', property: 'position', value: 'relative' },
      },
      {
        id: 'badge-absolute',
        description: 'Set position: absolute on .card-badge',
        explanation: '.card-badge must be positioned absolutely.',
        rule: { kind: 'ruleExists', selector: '.card-badge', property: 'position', value: 'absolute' },
      },
      {
        id: 'badge-top',
        description: 'Set top: 8px on .card-badge',
        explanation: '.card-badge must declare top: 8px offset coordinate.',
        rule: { kind: 'ruleExists', selector: '.card-badge', property: 'top', value: '8px' },
      },
    ],
    hints: [
      'In .badge-card, set position: relative; so its children calculate offsets from it.',
      'In .card-badge, set position: absolute; top: 8px; right: 8px;',
      'Without position: relative on the parent, absolute children position against the viewport.',
    ],
  },
  {
    id: 'ch-css-responsive-design',
    topicId: 'responsive-design',
    title: 'Mobile-First Responsive Layout',
    difficulty: 'advanced',
    prompt: 'Implement a mobile-first column layout that transforms into a multi-column row on viewports 768px and wider.',
    objective: 'Set mobile column flex layout, then add an @media (min-width: 768px) query.',
    starterCode: `.responsive-row {
  display: flex;
  flex-direction: column;
}
`,
    solutionCode: `.responsive-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .responsive-row {
    flex-direction: row;
  }
}
`,
    solutionExplanation: [
      'Mobile-first styling specifies a default single-column flex-direction: column.',
      'The @media (min-width: 768px) query activates on tablets and wider displays.',
      'Inside the query, flex-direction: row lays columns out horizontally side by side.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Layout</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="responsive-row">
    <div class="col" style="background:#e0f2fe; padding:20px; flex:1;">Column 1</div>
    <div class="col" style="background:#fef3c7; padding:20px; flex:1;">Column 2</div>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.responsive-row {
  display: flex;
  flex-direction: column;
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Layout</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="responsive-row">
    <div class="col" style="background:#e0f2fe; padding:20px; flex:1;">Column 1</div>
    <div class="col" style="background:#fef3c7; padding:20px; flex:1;">Column 2</div>
  </div>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.responsive-row {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 768px) {
  .responsive-row {
    flex-direction: row;
  }
}
`,
      },
    ],
    requirements: [
      {
        id: 'row-flex',
        description: 'Declare display: flex on .responsive-row',
        explanation: '.responsive-row must be a flex container.',
        rule: { kind: 'ruleExists', selector: '.responsive-row', property: 'display', value: 'flex' },
      },
      {
        id: 'row-direction-column',
        description: 'Set default mobile flex-direction: column on .responsive-row',
        explanation: 'Default mobile orientation must be column.',
        rule: { kind: 'ruleExists', selector: '.responsive-row', property: 'flex-direction', value: 'column' },
      },
      {
        id: 'breakpoint-768',
        description: 'Add @media query with min-width: 768px',
        explanation: 'Enhance layout at tablets/desktop with an @media (min-width: 768px) rule.',
        rule: { kind: 'mediaQuery', feature: 'min-width', min: 768 },
      },
    ],
    hints: [
      'Ensure the baseline rule has .responsive-row { display: flex; flex-direction: column; }',
      'Add an @media (min-width: 768px) { ... } block.',
      'Inside the media query, switch .responsive-row { flex-direction: row; }',
    ],
  },
  {
    id: 'ch-css-transitions-animations',
    topicId: 'transitions-animations',
    title: 'Smooth Transitions and Reduced Motion Guard',
    difficulty: 'advanced',
    prompt: 'Create a smooth button transform hover effect and guard against motion for users who prefer reduced motion.',
    objective: 'Declare transition: transform on .animated-btn, scale hover effect, and a prefers-reduced-motion media query.',
    starterCode: `.animated-btn {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
}

.animated-btn:hover {
}
`,
    solutionCode: `.animated-btn {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  transition: transform 0.2s ease;
}

.animated-btn:hover {
  transform: scale(1.05);
}

@media (prefers-reduced-motion: reduce) {
  .animated-btn {
    transition: none;
  }
}
`,
    solutionExplanation: [
      'transition: transform 0.2s ease smoothly interpolates the hover scaling effect.',
      'transform: scale(1.05) is GPU accelerated and avoids expensive layout reflows.',
      '@media (prefers-reduced-motion: reduce) disables transitions for vestibular accessibility.',
    ],
    files: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smooth Transitions</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <button class="animated-btn">Hover for Action</button>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.animated-btn {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
}

.animated-btn:hover {
}
`,
      },
    ],
    solutionFiles: [
      {
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smooth Transitions</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <button class="animated-btn">Hover for Action</button>
</body>
</html>`,
        readOnly: true,
      },
      {
        name: 'styles.css',
        language: 'css',
        content: `.animated-btn {
  background-color: #4f46e5;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  transition: transform 0.2s ease;
}

.animated-btn:hover {
  transform: scale(1.05);
}

@media (prefers-reduced-motion: reduce) {
  .animated-btn {
    transition: none;
  }
}
`,
      },
    ],
    requirements: [
      {
        id: 'btn-transition',
        description: 'Declare transition on transform for .animated-btn',
        explanation: '.animated-btn must declare transition involving transform.',
        rule: { kind: 'ruleExists', selector: '.animated-btn', property: 'transition', value: /transform/i },
      },
      {
        id: 'btn-hover-scale',
        description: 'Scale the button on hover with transform: scale(...)',
        explanation: '.animated-btn:hover must declare transform with scale.',
        rule: { kind: 'ruleExists', selector: '.animated-btn:hover', property: 'transform', value: /scale/i },
      },
      {
        id: 'reduced-motion-guard',
        description: 'Include an @media (prefers-reduced-motion: reduce) query',
        explanation: 'Accessibility requires providing a prefers-reduced-motion media query to disable or limit motion.',
        rule: { kind: 'reducedMotionGuard' },
      },
    ],
    hints: [
      'In .animated-btn, declare transition: transform 0.2s ease;',
      'In .animated-btn:hover, declare transform: scale(1.05);',
      'Add an @media (prefers-reduced-motion: reduce) block with transition: none; to guard vestibular safety.',
    ],
  },
]
