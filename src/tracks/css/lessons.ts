import type { Lesson } from '../../data/types'

export const cssLessons: Lesson[] = [
  {
    topicId: 'selectors',
    objective: 'Target HTML elements with precision using type, class, ID, and combinator selectors.',
    takeaways: [
      'Type selectors target elements by tag name (e.g., p, h1, button).',
      'Class selectors (.card) target elements sharing a semantic class attribute and can be reused.',
      'ID selectors (#header) target single unique elements on a page; classes are preferred for reusable styling.',
      'Combinators describe relationships: descendant (space), child (>), adjacent sibling (+), and general sibling (~).',
    ],
    terms: {
      selector: {
        term: 'Selector',
        definition: 'The part of a CSS rule set that specifies which HTML nodes in the document tree to style.',
      },
      combinator: {
        term: 'Combinator',
        definition: 'A character that explains the relationship between the selectors on either side of it (e.g. child > or descendant space).',
      },
    },
    a11yNotes: [
      'Avoid styling interactive elements purely by arbitrary class names; preserve semantic native elements like <button> and <a>.',
    ],
    estimatedMinutes: 12,
    sections: [
      {
        heading: 'Rule Anatomy and Basic Selectors',
        body: [
          'A CSS rule consists of a selector followed by a declaration block enclosed in curly braces.',
          'Type selectors target all occurrences of an element, while class selectors begin with a dot (.) to target elements carrying that class.',
        ],
        code: {
          label: 'Basic selectors',
          code: '/* Type selector */\nh1 {\n  color: #1e293b;\n}\n\n/* Class selector */\n.highlight {\n  background-color: #fef08a;\n}',
        },
        callout: {
          kind: 'why',
          text: 'Classes provide a flexible, repeatable way to apply styles across elements without tightly coupling styles to HTML tag names.',
        },
      },
      {
        heading: 'Combinators and Element Relationships',
        body: [
          'Descendant combinators (space) match any matching child at any depth within the ancestor.',
          'Child combinators (>) match only direct children, preventing styles from accidentally leaking into nested containers.',
        ],
        code: {
          label: 'Combinators',
          code: '/* Direct child only */\nnav > ul {\n  list-style: none;\n  padding: 0;\n}\n\n/* Any descendant */\narticle p {\n  line-height: 1.6;\n}',
        },
        callout: {
          kind: 'mistake',
          text: 'Overusing deep descendant selectors like div ul li a increases specificity unnecessarily and makes stylesheets brittle.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-selectors',
        title: 'Selector Targeting',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    .card {
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 16px;
      font-family: sans-serif;
    }
    .card > h2 {
      margin-top: 0;
      color: #1d4ed8;
    }
    .tag {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Interactive Card</h2>
    <p>Targeted with class and child selectors.</p>
    <span class="tag">CSS Selector</span>
  </div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'cascade-specificity',
    objective: 'Determine which CSS rules win by understanding the cascade, specificity scoring, and inheritance.',
    takeaways: [
      'The Cascade resolves conflicts using origin, importance (!important), specificity, and source order.',
      'Specificity is measured as a tuple: (Inline styles, ID selectors, Classes/attributes/pseudo-classes, Elements/pseudo-elements).',
      'When two selectors have equal specificity, the rule defined later in the stylesheet wins (source order).',
      'Inheritable properties (like color and font-family) pass down from parent to child unless overridden.',
    ],
    terms: {
      cascade: {
        term: 'The Cascade',
        definition: 'The algorithm browsers use to resolve conflicting property declarations across different stylesheets and rules.',
      },
      specificity: {
        term: 'Specificity',
        definition: 'A weighting system calculated from the components of a selector that determines which matching rule takes precedence.',
      },
    },
    a11yNotes: [
      'Relying on !important makes user stylesheet overrides and accessibility zoom themes difficult to apply.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'Calculating Specificity',
        body: [
          'Browsers compute specificity mathematically: IDs contribute (1, 0, 0), classes and pseudo-classes contribute (0, 1, 0), and tag names contribute (0, 0, 1).',
          'A selector with higher specificity always overrides one with lower specificity, regardless of order in the file.',
        ],
        code: {
          label: 'Specificity comparison',
          code: '/* Specificity: 0, 0, 1 */\np {\n  color: black;\n}\n\n/* Specificity: 0, 1, 0 — Wins over p */\n.intro {\n  color: blue;\n}\n\n/* Specificity: 1, 0, 0 — Wins over .intro */\n#main-banner {\n  color: purple;\n}',
        },
        callout: {
          kind: 'why',
          text: 'Keeping specificity low and flat (preferring single class selectors) prevents difficult-to-debug selector specificity wars.',
        },
      },
      {
        heading: 'Inheritance and Source Order',
        body: [
          'Text properties like font-family, color, and line-height inherit naturally down the DOM tree.',
          'Box properties such as padding, margin, border, and width do NOT inherit.',
        ],
        code: {
          label: 'Inheritance',
          code: 'body {\n  font-family: system-ui, sans-serif;\n  color: #334155;\n}\n\n/* Inherits font-family and color automatically */\nmain p {\n  margin-bottom: 1rem;\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-cascade',
        title: 'Cascade and Specificity in Action',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    p { color: #64748b; font-family: sans-serif; }
    .featured { color: #0284c7; font-weight: bold; }
    #hero-text { color: #7c3aed; }
  </style>
</head>
<body>
  <p>Standard paragraph: styled by element selector.</p>
  <p class="featured">Featured paragraph: class selector beats element.</p>
  <p id="hero-text" class="featured">Hero paragraph: ID selector beats class selector.</p>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'pseudo-classes',
    objective: 'Style interactive user states and structural positions using CSS pseudo-classes.',
    takeaways: [
      'Interactive pseudo-classes reflect user actions: :hover for pointer hover, :focus-visible for keyboard focus, :active for clicks.',
      ':focus-visible displays focus rings only when navigated via keyboard, preventing intrusive rings on mouse clicks.',
      'Structural pseudo-classes like :first-child, :last-child, and :nth-child(n) target elements based on their position among siblings.',
      'Never remove outline or focus indicators without providing an equally prominent accessible alternative.',
    ],
    terms: {
      pseudoClass: {
        term: 'Pseudo-class',
        definition: 'A keyword added to a selector (e.g. :hover) that specifies a special state of the selected element.',
      },
      focusVisible: {
        term: ':focus-visible',
        definition: 'A pseudo-class that matches an element when it has focus and the user agent determines focus indicators should be visible (such as via keyboard).',
      },
    },
    a11yNotes: [
      'Focus styles are vital for keyboard users. Removing outlines with outline: none without a replacement fails WCAG 2.4.7.',
    ],
    estimatedMinutes: 12,
    sections: [
      {
        heading: 'Interactive States: Hover and Focus',
        body: [
          'Buttons and links must communicate their interactive state clearly.',
          'Always pair :hover states with accessible :focus-visible indicators so keyboard users have parity with mouse users.',
        ],
        code: {
          label: 'Interactive states',
          code: '.button {\n  background: #2563eb;\n  color: #ffffff;\n  padding: 8px 16px;\n  border-radius: 6px;\n}\n\n.button:hover {\n  background: #1d4ed8;\n}\n\n.button:focus-visible {\n  outline: 2px solid #2563eb;\n  outline-offset: 2px;\n}',
        },
        callout: {
          kind: 'mistake',
          text: 'Using outline: none without replacing it with a distinct focus ring makes navigation impossible for keyboard-only users.',
        },
      },
      {
        heading: 'Structural Pseudo-classes',
        body: [
          'Structural pseudo-classes let you style elements according to their index among siblings without adding class names.',
          ':nth-child(even) and :nth-child(odd) are commonly used for zebra-striping tables or lists.',
        ],
        code: {
          label: 'Structural selectors',
          code: 'li:first-child {\n  border-top: none;\n}\n\nli:nth-child(odd) {\n  background-color: #f8fafc;\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-states',
        title: 'Interactive Button States',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .interactive-btn {
      background: #0284c7;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .interactive-btn:hover {
      background: #0369a1;
    }
    .interactive-btn:focus-visible {
      outline: 3px solid #38bdf8;
      outline-offset: 2px;
    }
    .interactive-btn:active {
      transform: translateY(1px);
    }
  </style>
</head>
<body>
  <button class="interactive-btn">Hover &amp; Focus Me</button>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'box-model',
    objective: 'Control dimensions, spacing, and borders with the CSS Box Model and box-sizing: border-box.',
    takeaways: [
      'Every rendered element is a rectangular box made of content, padding, border, and margin.',
      'In the default content-box model, padding and border are added ON TOP of specified width and height.',
      'box-sizing: border-box includes padding and border inside the declared width and height, simplifying layouts.',
      'Margins collapse vertically between adjacent block elements, adopting the largest margin rather than adding them.',
    ],
    terms: {
      boxModel: {
        term: 'Box Model',
        definition: 'The fundamental layout model in CSS comprising the content area, padding, border, and margin of every element.',
      },
      boxSizing: {
        term: 'box-sizing',
        definition: 'A CSS property controlling whether width and height include padding and borders (border-box) or only content (content-box).',
      },
    },
    a11yNotes: [
      'Adequate padding around interactive targets ensures minimum touch target size (at least 24x24px, ideally 44x44px).',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'The Four Layers of the Box Model',
        body: [
          'Content: where text and images appear.',
          'Padding: transparent clearing around the content, inside the border.',
          'Border: a line wrapping the padding and content.',
          'Margin: transparent clearing outside the border, spacing elements apart.',
        ],
        code: {
          label: 'Box model properties',
          code: '.box {\n  width: 200px;\n  padding: 16px;\n  border: 2px solid #94a3b8;\n  margin: 24px auto;\n  box-sizing: border-box;\n}',
        },
        callout: {
          kind: 'why',
          text: 'Using *, *::before, *::after { box-sizing: border-box; } globally is a modern web development standard that prevents unexpected layout overflows.',
        },
      },
      {
        heading: 'Margin Collapsing',
        body: [
          'When two vertical margins touch, they collapse into a single margin equal to the larger of the two.',
          'Horizontal margins never collapse.',
        ],
        code: {
          label: 'Margin behavior',
          code: 'h1 { margin-bottom: 24px; }\np { margin-top: 16px; }\n/* The actual gap between h1 and p is 24px, not 40px */',
        },
      },
    ],
    demos: [
      {
        id: 'demo-box-model',
        title: 'Box Model Dimensions',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .box {
      width: 240px;
      padding: 20px;
      border: 4px solid #3b82f6;
      margin: 16px 0;
      background: #eff6ff;
      box-sizing: border-box;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="box">
    <strong>box-sizing: border-box</strong>
    <p>Total rendered width is exactly 240px, with padding and border contained inside.</p>
  </div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'colour-typography',
    objective: 'Design readable, accessible typography and harmonize color palettes using modern CSS.',
    takeaways: [
      'Choose font stacks with system fallbacks (system-ui, -apple-system, sans-serif) for high performance.',
      'Maintain adequate line-height (at least 1.5 for body text) to ensure readability and WCAG compliance.',
      'Ensure a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text against the background.',
      'Use rem units for font sizes so text scales appropriately when learners adjust their browser font preferences.',
    ],
    terms: {
      contrastRatio: {
        term: 'Contrast Ratio',
        definition: 'The difference in luminance between foreground text and background color, crucial for accessibility.',
      },
      remUnit: {
        term: 'rem unit',
        definition: 'A relative unit based on the font-size of the root element (<html>), allowing consistent proportional scaling.',
      },
    },
    a11yNotes: [
      'Low contrast text causes severe strain and is unreadable for low-vision users. Verify contrast with tools.',
    ],
    estimatedMinutes: 14,
    sections: [
      {
        heading: 'Typography and Scale',
        body: [
          'Effective web typography establishes a clear hierarchy through font weight, size, and line height.',
          'Avoid setting body font sizes in fixed pixels (px); use rem or percentage units to honor browser font settings.',
        ],
        code: {
          label: 'Typography setup',
          code: 'body {\n  font-family: system-ui, -apple-system, sans-serif;\n  font-size: 1rem;\n  line-height: 1.6;\n  color: #1e293b;\n}\n\nh1 {\n  font-size: 2rem;\n  font-weight: 700;\n  line-height: 1.25;\n}',
        },
        callout: {
          kind: 'why',
          text: 'Using unitless line-height (e.g. line-height: 1.5) ensures child elements scale their line spacing proportionally to their own font size.',
        },
      },
      {
        heading: 'Color Notation and Contrast',
        body: [
          'Modern CSS supports hex codes (#3b82f6), rgb()/rgba(), and hsl()/hsla() functions.',
          'Always verify that your text color achieves at least 4.5:1 contrast against its background.',
        ],
        code: {
          label: 'Accessible colors',
          code: '.accessible-banner {\n  background-color: #0f172a;\n  color: #f8fafc; /* High contrast: 15.6:1 ratio */\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-typography',
        title: 'Typography Hierarchy and Contrast',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      padding: 24px;
      max-width: 500px;
    }
    h1 {
      font-size: 1.75rem;
      color: #0f172a;
      margin-bottom: 0.5rem;
      line-height: 1.2;
    }
    .muted {
      color: #64748b;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <h1>Readable Typography</h1>
  <p class="muted">Published on October 29, 2026</p>
  <p>Body copy with generous line-height and strong contrast reads comfortably on any display.</p>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'float-and-clear',
    objective: 'Understand legacy float wrapping, clear mechanics, and the historical context of web layout.',
    takeaways: [
      'The float property was originally designed for wrapping text around editorial images.',
      'Floated elements are taken out of normal document flow, causing parent containers to collapse unless cleared.',
      'The clearfix hack or overflow: hidden/auto was used to force parents to enclose floated children.',
      'Modern development uses Flexbox and Grid for page layout; floats should only be used for inline text wrapping.',
    ],
    terms: {
      float: {
        term: 'Float',
        definition: 'A CSS property placing an element on the left or right side of its container, allowing text to wrap around it.',
      },
      clear: {
        term: 'Clear',
        definition: 'A CSS property specifying whether an element can be next to floating elements or must move below them.',
      },
    },
    a11yNotes: [
      'Do not use float for structural layout, as it can cause unexpected reading and focus order mismatches.',
    ],
    estimatedMinutes: 10,
    sections: [
      {
        heading: 'Float Wrapping and Container Collapse',
        body: [
          'Floating an element pulls it to the left or right and allows following text to wrap around its opposite edge.',
          'Because floated items are removed from standard flow, their parent container has zero height if it contains only floated children.',
        ],
        code: {
          label: 'Float wrapping',
          code: '.article-image {\n  float: left;\n  margin-right: 16px;\n  margin-bottom: 8px;\n}',
        },
      },
      {
        heading: 'Clearing and The Clearfix Pattern',
        body: [
          'The clear property (clear: both) prevents elements from sitting beside earlier floats.',
          'The classic clearfix pseudo-element hack forces parent containers to self-clear.',
        ],
        code: {
          label: 'Clearfix pattern',
          code: '.clearfix::after {\n  content: "";\n  display: table;\n  clear: both;\n}',
        },
        callout: {
          kind: 'why',
          text: 'While Flexbox and Grid have superseded floats for multi-column grids, understanding floats is essential for maintaining legacy codebases and wrapping editorial text.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-float',
        title: 'Editorial Float Text Wrapping',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.5; padding: 20px; }
    .badge-float {
      float: left;
      width: 70px;
      height: 70px;
      background: #f59e0b;
      color: white;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 16px 8px 0;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="badge-float">Float</div>
  <p>This text flows around the floated box. Floats were created specifically for this magazine-style editorial wrapping behavior before Flexbox and Grid existed.</p>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'flexbox',
    objective: 'Build flexible one-dimensional layouts with display: flex, alignment, distribution, and flex items.',
    takeaways: [
      'display: flex turns an element into a flex container and its direct children into flex items.',
      'The main axis is determined by flex-direction (row by default; column switches it vertically).',
      'justify-content aligns items along the main axis (e.g., flex-start, center, space-between).',
      'align-items controls cross-axis alignment (e.g., stretch, center, flex-start).',
      'The gap property creates consistent spacing between flex items without tricky margin hacks.',
    ],
    terms: {
      flexContainer: {
        term: 'Flex Container',
        definition: 'The parent element declared with display: flex that establishes a new flex formatting context.',
      },
      mainAxis: {
        term: 'Main Axis',
        definition: 'The primary direction in which flex items are laid out, defined by the flex-direction property.',
      },
    },
    a11yNotes: [
      'Avoid using flex-direction: row-reverse or flex item order properties in ways that break logical visual-to-DOM reading order.',
    ],
    estimatedMinutes: 16,
    sections: [
      {
        heading: 'Flex Container and Alignment',
        body: [
          'Setting display: flex activates the flex formatting context.',
          'Use justify-content to distribute items along the main axis and align-items to center or align them on the cross axis.',
        ],
        code: {
          label: 'Flex navbar',
          code: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 16px;\n}',
        },
        callout: {
          kind: 'why',
          text: 'display: flex eliminates the need for float hacks, table displays, or inline-block whitespace workarounds for horizontal layouts.',
        },
      },
      {
        heading: 'Flex Items: Grow, Shrink, and Basis',
        body: [
          'flex-grow allows an item to expand and fill available free space.',
          'flex-shrink specifies how items compress when space is constrained.',
          'flex: 1 is a shorthand for flex: 1 1 0%, creating evenly sized columns.',
        ],
        code: {
          label: 'Flex item expansion',
          code: '.search-input {\n  flex-grow: 1;\n}\n.action-btn {\n  flex-shrink: 0;\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-flexbox',
        title: 'Flexbox Alignment Playground',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .flex-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
    }
    .flex-item {
      background: #3b82f6;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="flex-row">
    <div class="flex-item">Item 1</div>
    <div class="flex-item">Item 2</div>
    <div class="flex-item">Item 3</div>
  </div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'grid',
    objective: 'Create robust two-dimensional layouts with CSS Grid, template tracks, gap, and fractional units.',
    takeaways: [
      'display: grid establishes a two-dimensional grid container controlling both rows and columns simultaneously.',
      'grid-template-columns defines column tracks using pixels, percentages, fr units, or repeat().',
      'The fr (fractional) unit represents a fraction of the available free space in the grid container.',
      'repeat(auto-fit, minmax(250px, 1fr)) creates fully responsive cards without requiring media queries.',
    ],
    terms: {
      gridTrack: {
        term: 'Grid Track',
        definition: 'The space between two adjacent grid lines, forming either a column or a row.',
      },
      frUnit: {
        term: 'fr unit',
        definition: 'A flexible length unit representing a proportion of free space in a CSS grid container.',
      },
    },
    a11yNotes: [
      'Do not rearrange grid items with grid-column or grid-row in a manner that contradicts the logical keyboard Tab order.',
    ],
    estimatedMinutes: 18,
    sections: [
      {
        heading: 'Defining Tracks and Fractional Units',
        body: [
          'Unlike Flexbox which handles one dimension at a time, CSS Grid aligns content along rows and columns at once.',
          'The fr unit distributes remaining container space proportionally across tracks.',
        ],
        code: {
          label: 'Grid definition',
          code: '.grid-container {\n  display: grid;\n  grid-template-columns: 1fr 2fr 1fr;\n  gap: 20px;\n}',
        },
        callout: {
          kind: 'why',
          text: 'CSS Grid solves complex dashboard, magazine, and application layouts cleanly with declarative column and row tracks.',
        },
      },
      {
        heading: 'Responsive Auto-fit Patterns',
        body: [
          'Combining repeat(), auto-fit, and minmax() yields an adaptable card layout that reflows automatically to any viewport width.',
        ],
        code: {
          label: 'Responsive auto-fit grid',
          code: '.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));\n  gap: 16px;\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-grid',
        title: 'Two-Dimensional Grid Layout',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .grid-demo {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .grid-cell {
      background: #e0e7ff;
      border: 2px solid #6366f1;
      border-radius: 8px;
      padding: 24px;
      text-align: center;
      font-weight: bold;
      color: #3730a3;
    }
  </style>
</head>
<body>
  <div class="grid-demo">
    <div class="grid-cell">Cell 1</div>
    <div class="grid-cell">Cell 2</div>
    <div class="grid-cell">Cell 3</div>
  </div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'positioning',
    objective: 'Position elements with relative, absolute, fixed, and sticky schemes, managing z-index stacking.',
    takeaways: [
      'position: static is the default normal document flow.',
      'position: relative offsets an element relative to its normal position without disturbing neighboring flow.',
      'position: absolute removes an element from flow and positions it relative to its closest positioned ancestor.',
      'position: fixed anchors an element relative to the viewport, keeping it in place during scroll.',
      'position: sticky toggles between relative and fixed depending on scroll position.',
      'z-index only takes effect on positioned elements (not static) and depends on stacking contexts.',
    ],
    terms: {
      stackingContext: {
        term: 'Stacking Context',
        definition: 'A three-dimensional conceptualization of HTML elements along an imaginary z-axis relative to the user.',
      },
      stickyPosition: {
        term: 'position: sticky',
        definition: 'A hybrid positioning scheme where an element scrolls normally until reaching an offset threshold, then sticks in place.',
      },
    },
    a11yNotes: [
      'Fixed navigation headers and floating action buttons must not obscure focus rings or content when zoomed in.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'Relative and Absolute Positioning',
        body: [
          'A common design pattern is giving a container position: relative so its child with position: absolute positions relative to the container rather than the entire page.',
          'Use top, right, bottom, and left to specify offset coordinates.',
        ],
        code: {
          label: 'Card badge overlay',
          code: '.card {\n  position: relative;\n  padding: 20px;\n}\n\n.badge {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n}',
        },
        callout: {
          kind: 'mistake',
          text: 'Forgetting position: relative on the parent container causes absolutely positioned children to position relative to <html>, jumping across the screen.',
        },
      },
      {
        heading: 'Fixed, Sticky, and z-index',
        body: [
          'Sticky elements stay within their parent container while remaining pinned to the viewport during scroll.',
          'z-index controls rendering order on the z-axis; elements with higher numbers stack on top.',
        ],
        code: {
          label: 'Sticky navigation',
          code: 'header.site-header {\n  position: sticky;\n  top: 0;\n  z-index: 100;\n  background: #ffffff;\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-positioning',
        title: 'Badge Positioning Overlay',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .card {
      position: relative;
      width: 260px;
      padding: 24px;
      background: white;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 8px;
      border-radius: 9999px;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">NEW</span>
    <h3>Pro Plan</h3>
    <p>Positioned absolutely relative to the card container.</p>
  </div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'responsive-design',
    objective: 'Design adaptive, mobile-first interfaces using media queries, viewport units, and fluid constraints.',
    takeaways: [
      'Mobile-first design styles base rules for small screens, using min-width media queries to add layout complexity for wider viewports.',
      'Always include the viewport meta tag (<meta name="viewport" content="width=device-width, initial-scale=1.0">) in HTML.',
      'Common breakpoints: 640px (tablets/large phones), 768px (tablets), 1024px (desktops), 1280px (wide displays).',
      'Use fluid max-width constraints (max-width: 100%) on images and media to prevent horizontal overflow.',
    ],
    terms: {
      mediaQuery: {
        term: 'Media Query',
        definition: 'A CSS technique used to apply styles conditionally based on device characteristics like viewport width or user preferences.',
      },
      mobileFirst: {
        term: 'Mobile First',
        definition: 'An architectural approach where styles are written primarily for mobile devices, then progressively enhanced with min-width queries.',
      },
    },
    a11yNotes: [
      'Ensure pages remain readable without horizontal scrolling at 320px width and at 400% zoom (WCAG 1.4.10 Reflow).',
    ],
    estimatedMinutes: 16,
    sections: [
      {
        heading: 'Mobile-First Philosophy and Breakpoints',
        body: [
          'Writing mobile styles first reduces code complexity: mobile devices receive lightweight, single-column default styles.',
          'Larger displays layer on multi-column layouts via @media (min-width: ...).',
        ],
        code: {
          label: 'Mobile-first media query',
          code: '/* Mobile default: single column */\n.container {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n/* Tablet and desktop enhancement */\n@media (min-width: 768px) {\n  .container {\n    flex-direction: row;\n  }\n}',
        },
        callout: {
          kind: 'why',
          text: 'Mobile-first min-width queries naturally cascade upward, avoiding the messy overrides associated with max-width desktop-first styling.',
        },
      },
      {
        heading: 'Responsive Media and Fluid Layouts',
        body: [
          'Images should never have fixed pixel widths that exceed the screen.',
          'Use max-width: 100% and height: auto to ensure images scale down proportionally.',
        ],
        code: {
          label: 'Responsive images',
          code: 'img, video {\n  max-width: 100%;\n  height: auto;\n  display: block;\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-responsive',
        title: 'Adaptive Flex Layout',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 20px; }
    .responsive-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .col {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      padding: 16px;
      border-radius: 6px;
      text-align: center;
    }
    @media (min-width: 500px) {
      .responsive-box {
        flex-direction: row;
      }
      .col {
        flex: 1;
      }
    }
  </style>
</head>
<body>
  <div class="responsive-box">
    <div class="col">Column A</div>
    <div class="col">Column B</div>
  </div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'transitions-animations',
    objective: 'Implement fluid CSS transitions, keyframe animations, and respect prefers-reduced-motion preferences.',
    takeaways: [
      'CSS transitions smoothly interpolate property changes over a specified duration.',
      'Animate transform and opacity for optimal 60fps performance; avoid animating layout properties like width or margin.',
      'Keyframe animations (@keyframes) define multi-stage animation sequences with precise control.',
      'Always provide a prefers-reduced-motion media query that disables or minimizes motion for vestibular-sensitive learners.',
    ],
    terms: {
      transition: {
        term: 'Transition',
        definition: 'A CSS feature enabling smooth changes of CSS property values over a given duration.',
      },
      reducedMotion: {
        term: 'prefers-reduced-motion',
        definition: 'A media feature that detects if the user has requested the system to minimize the amount of animation or motion.',
      },
    },
    a11yNotes: [
      'Flashing or large unexpected movement can trigger seizures or vestibular disorders. WCAG 2.3.3 requires respecting reduced motion.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'CSS Transitions and Performance',
        body: [
          'A transition needs at least a transition-property and transition-duration.',
          'GPU-accelerated properties (transform and opacity) run on the compositor thread without triggering expensive browser reflows or repaints.',
        ],
        code: {
          label: 'Performant transition',
          code: '.interactive-card {\n  transition: transform 0.2s ease, box-shadow 0.2s ease;\n}\n\n.interactive-card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);\n}',
        },
        callout: {
          kind: 'why',
          text: 'Animating transform: scale() or translateY() avoids re-running the layout engine, keeping interactions buttery smooth at 60fps.',
        },
      },
      {
        heading: 'Respecting Reduced Motion',
        body: [
          'Learners who experience motion sickness or vestibular disorders configure their OS to reduce motion.',
          'Always disable or minimize transitions within an @media (prefers-reduced-motion: reduce) block.',
        ],
        code: {
          label: 'Accessible motion guard',
          code: '@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}',
        },
      },
    ],
    demos: [
      {
        id: 'demo-transitions',
        title: 'Smooth Hover Transition with Motion Guard',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; padding: 30px; }
    .card {
      width: 200px;
      padding: 20px;
      background: #e0f2fe;
      border: 2px solid #0284c7;
      border-radius: 8px;
      text-align: center;
      transition: transform 0.25s ease, background 0.25s ease;
      cursor: pointer;
    }
    .card:hover {
      transform: scale(1.05);
      background: #bae6fd;
    }
    @media (prefers-reduced-motion: reduce) {
      .card {
        transition: none;
      }
      .card:hover {
        transform: none;
      }
    }
  </style>
</head>
<body>
  <div class="card">Hover me for smooth scaling</div>
</body>
</html>`,
          },
        ],
      },
    ],
  },
]
