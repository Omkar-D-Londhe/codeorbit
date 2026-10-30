import type { Lesson } from '../../data/types'

export const jsLessons: Lesson[] = [
  {
    topicId: 'variables-types',
    objective: 'Understand variable declarations with let and const, primitive versus reference types, and explicit type conversion.',
    takeaways: [
      'Prefer const by default for immutable bindings; use let only when reassignment is explicitly required.',
      'JavaScript has seven primitive types: string, number, bigint, boolean, symbol, undefined, and null.',
      'Primitives are passed by value and immutable, whereas objects and arrays are stored and passed by memory reference.',
      'Use strict equality (===) to avoid unintentional type coercion pitfalls caused by loose equality (==).',
    ],
    terms: {
      immutability: {
        term: 'Immutability',
        definition: 'The property where a value cannot be modified after its creation; primitive values are always immutable.',
      },
      coercion: {
        term: 'Type Coercion',
        definition: 'The automatic or implicit conversion of values from one data type to another during runtime evaluation.',
      },
      scope: {
        term: 'Block Scope',
        definition: 'The region of code delimited by curly braces where variables declared with let or const are accessible.',
      },
    },
    a11yNotes: [
      'Avoid relying on visual-only state changes without updating semantic ARIA attributes or notifying screen readers.',
      'Ensure error messages generated during data parsing provide clear textual descriptions rather than color alone.',
    ],
    estimatedMinutes: 12,
    sections: [
      {
        heading: 'Declaration Keywords: const and let',
        body: [
          'Modern JavaScript deprecates var in favor of const and let, which provide block-scoping semantics and avoid temporal dead zone surprises.',
          'const prevents re-binding the variable identifier, though properties of objects declared with const can still be mutated unless frozen.',
        ],
        code: {
          label: 'Variable declarations',
          code: 'const maxAttempts = 3;\nlet currentAttempts = 0;\n\ncurrentAttempts += 1;\n// maxAttempts = 4; // TypeError: Assignment to constant variable',
        },
        callout: {
          kind: 'why',
          text: 'Using const communicates intent: readers know the identifier will never be rebound to a different value throughout the scope.',
        },
      },
      {
        heading: 'Primitives vs References',
        body: [
          'Primitives (strings, numbers, booleans) are compared by their underlying value. Objects and arrays are compared by their memory reference identity.',
          'Two distinct object literals with identical properties are never strictly equal because they occupy different addresses in heap memory.',
        ],
        code: {
          label: 'Primitive vs reference equality',
          code: "const a = 'hello';\nconst b = 'hello';\nconsole.log(a === b); // true\n\nconst obj1 = { id: 1 };\nconst obj2 = { id: 1 };\nconsole.log(obj1 === obj2); // false (distinct references)",
        },
        callout: {
          kind: 'mistake',
          text: 'Do not mutate objects passed into helper functions unless the function is explicitly designed and documented as a mutator.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-variables-types',
        title: 'Variable Types & Inspection',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <h2>Type Inspection Demo</h2>
  <pre id="output"></pre>
  <script>
    const data = [42, 'Orbit', true, null, undefined, { role: 'admin' }, [1, 2]];
    const log = data.map(v => typeof v + ': ' + JSON.stringify(v)).join('\\n');
    document.getElementById('output').textContent = log;
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'control-flow',
    objective: 'Implement branching and iteration logic using if-else conditionals, switch statements, and loop structures.',
    takeaways: [
      'Use if, else if, and else branches for complex conditions and early-return patterns to flatten nesting.',
      'Ternary expressions (cond ? a : b) are concise for inline value assignment but should not be nested deeply.',
      'The switch statement is ideal for discrete multi-case dispatch; remember to break each case or return immediately.',
      'for...of loops iterate over iterable values like arrays, while for...in enumerates enumerable object property keys.',
    ],
    terms: {
      branching: {
        term: 'Branching',
        definition: 'Directing the flow of code execution along different paths depending on whether boolean expressions evaluate to true or false.',
      },
      guardClause: {
        term: 'Guard Clause',
        definition: 'A premature exit condition placed at the beginning of a function to handle edge cases or invalid input immediately.',
      },
    },
    a11yNotes: [
      'Ensure UI branching states (such as conditional warnings) are announced by screen readers using aria-live regions.',
      'When toggling conditional interactive controls, verify that keyboard focus is never dropped into a void.',
    ],
    estimatedMinutes: 14,
    sections: [
      {
        heading: 'Branching with Guard Clauses',
        body: [
          'Deeply nested if-else statements create cyclomatic complexity that is difficult to test and maintain.',
          'Inverting conditions into guard clauses with early returns simplifies the happy path into a readable, sequential block.',
        ],
        code: {
          label: 'Guard clause pattern',
          code: 'function calculateDiscount(user, cartTotal) {\n  if (!user || !user.isActive) return 0;\n  if (cartTotal <= 0) return 0;\n  if (user.isPremium) return cartTotal * 0.2;\n  return cartTotal * 0.05;\n}',
        },
        callout: {
          kind: 'why',
          text: 'Flatten your functions by returning early from boundary checks before executing primary business logic.',
        },
      },
      {
        heading: 'Iteration Patterns',
        body: [
          'Choose the right loop construct: for...of for array values, while for indeterminate loops, and functional methods (forEach, map) when composing operations.',
          'Always verify loop termination criteria to prevent infinite loops that freeze the browser rendering thread.',
        ],
        code: {
          label: 'Iterating with for...of',
          code: 'const scores = [88, 92, 79, 95];\nlet total = 0;\nfor (const score of scores) {\n  total += score;\n}\nconst average = total / scores.length;',
        },
        callout: {
          kind: 'mistake',
          text: 'Using for...in on an array iterates over indices and enumerable prototype properties as strings rather than values.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-control-flow',
        title: 'Control Flow Branching',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <h3>Status Evaluator</h3>
  <div id="result"></div>
  <script>
    function evaluateScore(score) {
      if (score >= 90) return 'Distinction';
      if (score >= 75) return 'Merit';
      if (score >= 50) return 'Pass';
      return 'Referral';
    }
    document.getElementById('result').textContent = 'Score 84: ' + evaluateScore(84);
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'functions',
    objective: 'Author modular functions, leverage arrow syntax, manage lexical scope, and construct closures for encapsulation.',
    takeaways: [
      'Function declarations are hoisted, whereas function expressions and arrow functions must be defined before invocation.',
      'Arrow functions do not bind their own this, arguments, or super; they capture this lexically from the enclosing context.',
      'Closures allow inner functions to retain access to variables in their outer lexical scope even after the outer function has returned.',
      'Pure functions produce identical output for identical inputs and have no observable side effects.',
    ],
    terms: {
      closure: {
        term: 'Closure',
        definition: 'A function bundled together with references to its surrounding lexical environment state.',
      },
      hoisting: {
        term: 'Hoisting',
        definition: 'The behavior where function declarations and variable names are processed into memory during compile phase before execution.',
      },
      lexicalScope: {
        term: 'Lexical Scope',
        definition: 'The scope model where identifier accessibility is determined strictly by the source code position where the function was declared.',
      },
    },
    a11yNotes: [
      'Event handler callbacks must handle keyboard triggers (Enter and Space) equivalently to pointer clicks on custom controls.',
      'Debounce functions should preserve focus indicators and avoid abrupt layout shifts during rapid user input.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'Arrow Functions and Lexical Context',
        body: [
          'Arrow functions provide a compact syntax for expressions and callback arguments.',
          'Because arrow functions capture this lexically from their enclosing scope, they eliminate the need for manual .bind(this) calls in callbacks.',
        ],
        code: {
          label: 'Arrow function syntax',
          code: 'const double = (x) => x * 2;\nconst sum = (a, b) => a + b;\n\n// Multi-line requires explicit return\nconst formatName = (first, last) => {\n  const cleanFirst = first.trim();\n  const cleanLast = last.trim();\n  return `${cleanLast}, ${cleanFirst}`;\n};',
        },
        callout: {
          kind: 'why',
          text: 'Arrow functions simplify callback composition and prevent insidious this rebinding bugs in event handlers and timers.',
        },
      },
      {
        heading: 'Closures and Data Encapsulation',
        body: [
          'When a function returns an inner function, that inner function retains live references to its outer scope variables.',
          'This pattern allows authoring private state and factory functions without relying on class syntax or public object properties.',
        ],
        code: {
          label: 'Closure factory',
          code: 'function createCounter(step = 1) {\n  let count = 0;\n  return {\n    increment: () => { count += step; return count; },\n    get: () => count,\n    reset: () => { count = 0; return count; }\n  };\n}\nconst counter = createCounter(5);\ncounter.increment(); // 5\ncounter.increment(); // 10',
        },
        callout: {
          kind: 'why',
          text: 'Closures provide true privacy because the encapsulated variable cannot be accessed from outside the returned API.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-functions',
        title: 'Function Closures',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <button id="btn">Click me</button>
  <span id="display">0 clicks</span>
  <script>
    function makeCounter() {
      let n = 0;
      return () => ++n;
    }
    const count = makeCounter();
    document.getElementById('btn').addEventListener('click', () => {
      document.getElementById('display').textContent = count() + ' clicks';
    });
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'arrays-objects',
    objective: 'Transform structured collections using immutable array methods, rest/spread syntax, and object destructuring.',
    takeaways: [
      'Use map for 1:1 item transformations, filter to extract matching items, and reduce to aggregate values into a single accumulator.',
      'Array methods like slice, concat, map, and filter return new arrays; avoid mutating methods like push or splice when functional purity is desired.',
      'Destructuring allows unpacking object properties and array elements into distinct local variables concisely.',
      'The spread operator (...) creates shallow copies of objects and arrays, facilitating immutable updates.',
    ],
    terms: {
      destructuring: {
        term: 'Destructuring',
        definition: 'A syntax pattern that unpacks properties from objects or elements from arrays into distinct variables.',
      },
      shallowCopy: {
        term: 'Shallow Copy',
        definition: 'A duplicate collection whose top-level references are new, but whose nested object references are still shared with the original.',
      },
    },
    a11yNotes: [
      'When rendering lists transformed with map(), ensure generated HTML contains semantic markup (ul/ol and li) rather than plain divs.',
      'Maintain stable unique identifiers when mapping list items to assist assistive technologies during updates.',
    ],
    estimatedMinutes: 16,
    sections: [
      {
        heading: 'Functional Array Transformation',
        body: [
          'Chaining map, filter, and reduce allows declarative data processing pipelines without manual loop bookkeeping.',
          'Each stage in the pipeline takes an input array and produces a new result without mutating the source dataset.',
        ],
        code: {
          label: 'Array transformation pipeline',
          code: 'const users = [\n  { id: 1, name: \'Alice\', active: true, score: 90 },\n  { id: 2, name: \'Bob\', active: false, score: 65 },\n  { id: 3, name: \'Carol\', active: true, score: 85 },\n];\n\nconst topActiveNames = users\n  .filter(u => u.active && u.score >= 80)\n  .map(u => u.name);\n// [\'Alice\', \'Carol\']',
        },
        callout: {
          kind: 'why',
          text: 'Keeping data transformations pure and immutable makes application state predictable and simplifies automated testing.',
        },
      },
      {
        heading: 'Destructuring and Spread Syntax',
        body: [
          'Destructuring provides a readable way to extract specific fields and assign default fallbacks.',
          'Object spread (...obj) enables non-destructive updates by copying existing properties and selectively overriding specific fields.',
        ],
        code: {
          label: 'Object spread and destructuring',
          code: 'const settings = { theme: \'dark\', notifications: true };\nconst updated = { ...settings, notifications: false };\n\nconst { theme, font = \'Inter\' } = updated;\nconsole.log(theme, font); // dark, Inter',
        },
        callout: {
          kind: 'mistake',
          text: 'Remember that spread (...) creates a shallow copy. Mutating nested objects inside the copy still alters the original object!',
        },
      },
    ],
    demos: [
      {
        id: 'demo-arrays-objects',
        title: 'Array Pipeline Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <ul id="list"></ul>
  <script>
    const items = [{ name: 'Apples', price: 2 }, { name: 'Bread', price: 3 }, { name: 'Cheese', price: 5 }];
    const total = items.reduce((acc, item) => acc + item.price, 0);
    const ul = document.getElementById('list');
    items.forEach(i => {
      const li = document.createElement('li');
      li.textContent = i.name + ': $' + i.price;
      ul.appendChild(li);
    });
    const summary = document.createElement('p');
    summary.textContent = 'Total: $' + total;
    document.body.appendChild(summary);
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'events',
    objective: 'Handle browser DOM events using addEventListener, manage event propagation, and implement event delegation.',
    takeaways: [
      'Attach listeners using target.addEventListener(type, listener) rather than inline HTML onclick attributes.',
      'Events propagate through three phases: capturing, target, and bubbling (bubbling is default for listeners).',
      'Use event.preventDefault() to suppress default browser actions (such as form submission or link navigation).',
      'Event delegation attaches a single listener to a parent container to handle events from many dynamic children via event.target.',
    ],
    terms: {
      delegation: {
        term: 'Event Delegation',
        definition: 'A technique where a single event listener is attached to an ancestor element to handle events triggered by child elements.',
      },
      bubbling: {
        term: 'Event Bubbling',
        definition: 'The propagation phase where an event triggers handlers on the target element and then bubbles upwards through ancestor elements.',
      },
    },
    a11yNotes: [
      'Interactive custom controls must respond to both pointer (click) and keyboard events (keydown for Space and Enter).',
      'Never prevent default Tab navigation or escape keys unless deliberately trapping focus inside a modal dialog.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'Adding Listeners and Preventing Defaults',
        body: [
          'addEventListener separates structure (HTML) from behavior (JavaScript), enabling multiple handlers per element.',
          'The event object passed to your handler provides contextual details: coordinates, key pressed, target element, and control methods.',
        ],
        code: {
          label: 'Handling click events',
          code: 'const button = document.querySelector(\'#save-btn\');\nbutton.addEventListener(\'click\', (event) => {\n  console.log(\'Button clicked at:\', event.clientX, event.clientY);\n});',
        },
        callout: {
          kind: 'why',
          text: 'addEventListener supports options like { once: true, passive: true, capture: false } for fine-grained performance control.',
        },
      },
      {
        heading: 'Event Delegation Pattern',
        body: [
          'Instead of attaching individual listeners to hundreds of list items, attach one listener to the parent container.',
          'Inside the parent handler, use event.target.closest(\'selector\') to determine which specific child element was clicked.',
        ],
        code: {
          label: 'Event delegation',
          code: 'const list = document.querySelector(\'#todo-list\');\nlist.addEventListener(\'click\', (e) => {\n  const deleteBtn = e.target.closest(\'.delete-btn\');\n  if (!deleteBtn) return;\n  const item = deleteBtn.closest(\'li\');\n  item?.remove();\n});',
        },
        callout: {
          kind: 'why',
          text: 'Event delegation saves memory and automatically works for child elements added to the DOM dynamically later.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-events',
        title: 'Event Delegation Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <div id="parent" style="padding: 12px; background: #e0f2fe;">
    <button data-action="greet">Greet</button>
    <button data-action="farewell">Farewell</button>
  </div>
  <p id="msg"></p>
  <script>
    document.getElementById('parent').addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const action = btn.dataset.action;
      document.getElementById('msg').textContent = action === 'greet' ? 'Hello learner!' : 'Goodbye!';
    });
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'dom',
    objective: 'Query, create, modify, and delete DOM elements dynamically to build reactive user interfaces.',
    takeaways: [
      'Use document.querySelector and querySelectorAll to locate elements using standard CSS selector syntax.',
      'Create new nodes with document.createElement and attach them with appendChild, append, or prepend.',
      'Update attributes and styles with element.setAttribute, element.classList.add/remove/toggle, and element.style.',
      'Prefer textContent over innerHTML when inserting user-derived strings to prevent cross-site scripting (XSS) injection.',
    ],
    terms: {
      domTree: {
        term: 'DOM Tree',
        definition: 'The hierarchical object representation of an HTML document where every element, attribute, and text snippet is an accessible node.',
      },
      xss: {
        term: 'Cross-Site Scripting (XSS)',
        definition: 'A security vulnerability where untrusted user input is injected into HTML execution contexts without proper sanitization.',
      },
    },
    a11yNotes: [
      'When adding elements to the DOM dynamically, ensure they maintain sensible tab order and are discoverable by screen readers.',
      'Update aria-expanded or aria-hidden attributes whenever toggling element visibility dynamically.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'Querying and Manipulating Elements',
        body: [
          'The modern DOM API allows querying any node using familiar CSS selectors via querySelector.',
          'Element properties like textContent and classList provide safe, fast primitives for visual state updates.',
        ],
        code: {
          label: 'Querying and updating DOM',
          code: 'const title = document.querySelector(\'h1.page-title\');\nif (title) {\n  title.textContent = \'Updated Dashboard\';\n  title.classList.add(\'is-active\');\n}',
        },
        callout: {
          kind: 'why',
          text: 'Using classList methods (add, remove, toggle) keeps presentation rules in CSS rather than hardcoding style properties in JS.',
        },
      },
      {
        heading: 'Creating and Appending Nodes',
        body: [
          'Building UI elements with document.createElement and textContent prevents security vulnerabilities caused by raw string concatenation in innerHTML.',
          'Append nodes to a DocumentFragment when building large lists to minimize layout recalculations before flushing to the page.',
        ],
        code: {
          label: 'Safe node creation',
          code: 'function createBadge(label, count) {\n  const badge = document.createElement(\'span\');\n  badge.className = \'badge\';\n  badge.textContent = `${label} (${count})`;\n  return badge;\n}',
        },
        callout: {
          kind: 'mistake',
          text: 'Never insert unsanitized user strings into element.innerHTML, as this creates serious XSS security holes.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-dom',
        title: 'Dynamic DOM List',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <button id="add-btn">Add Item</button>
  <ul id="items-list"></ul>
  <script>
    let count = 0;
    document.getElementById('add-btn').addEventListener('click', () => {
      count++;
      const li = document.createElement('li');
      li.textContent = 'Dynamic Item #' + count;
      document.getElementById('items-list').appendChild(li);
    });
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'validation',
    objective: 'Implement client-side form validation, enforce input constraints, and communicate error states accessibly.',
    takeaways: [
      'Combine native HTML5 constraint attributes (required, pattern, minlength) with JavaScript for real-time validation feedback.',
      'Listen to input and change events to validate values and provide progressive feedback without premature error nagging.',
      'Associate error message containers with input elements using aria-describedby and set aria-invalid="true" on error.',
      'Client-side validation improves user experience, but all inputs must still be validated on the backend server.',
    ],
    terms: {
      ariaDescribedBy: {
        term: 'aria-describedby',
        definition: 'An accessibility attribute linking an input element to descriptive or error text nodes so screen readers announce them on focus.',
      },
      constraintValidation: {
        term: 'Constraint Validation API',
        definition: 'The standard browser API providing validity properties (valid, valueMissing, patternMismatch) on form elements.',
      },
    },
    a11yNotes: [
      'Always associate error messages to form fields via aria-describedby and toggle aria-invalid dynamically.',
      'Do not rely solely on border color changes (such as red borders) to indicate field invalidity; provide descriptive text.',
    ],
    estimatedMinutes: 16,
    sections: [
      {
        heading: 'Input Event Validation',
        body: [
          'Validating on input allows checking characters as the user types, while blur validation checks the completed field when focus leaves.',
          'Clear error states as soon as the user corrects the mistake to give positive reinforcement.',
        ],
        code: {
          label: 'Real-time email validator',
          code: 'function validateEmail(value) {\n  const regex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n  if (!value || !value.trim()) return { valid: false, message: \'Email is required.\' };\n  if (!regex.test(value)) return { valid: false, message: \'Enter a valid email address.\' };\n  return { valid: true };\n}',
        },
        callout: {
          kind: 'why',
          text: 'Wait until the user has blurred a field or attempted to submit before showing errors, rather than yelling on the first keystroke.',
        },
      },
      {
        heading: 'Accessible Error Communication',
        body: [
          'Visual cues must be paired with programmatic accessibility attributes.',
          'Set aria-invalid="true" when an error is present, and set it to "false" when the input satisfies all requirements.',
        ],
        code: {
          label: 'Updating aria attributes',
          code: 'function setFieldError(inputEl, errorEl, message) {\n  if (message) {\n    inputEl.setAttribute(\'aria-invalid\', \'true\');\n    errorEl.textContent = message;\n    errorEl.hidden = false;\n  } else {\n    inputEl.setAttribute(\'aria-invalid\', \'false\');\n    errorEl.textContent = \'\';\n    errorEl.hidden = true;\n  }\n}',
        },
        callout: {
          kind: 'why',
          text: 'Screen readers inspect aria-invalid and announce the linked error message immediately when the user focuses the field.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-validation',
        title: 'Form Validation with ARIA',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <form id="login-form">
    <label for="username">Username (min 3 chars):</label>
    <input id="username" aria-describedby="user-err" />
    <span id="user-err" role="alert" style="color: #dc2626;" hidden></span>
    <br><br>
    <button type="submit">Submit</button>
  </form>
  <script>
    const input = document.getElementById('username');
    const err = document.getElementById('user-err');
    input.addEventListener('input', () => {
      if (input.value.length < 3) {
        input.setAttribute('aria-invalid', 'true');
        err.textContent = 'Username must be at least 3 characters.';
        err.hidden = false;
      } else {
        input.setAttribute('aria-invalid', 'false');
        err.hidden = true;
      }
    });
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'gallery',
    objective: 'Architect an interactive, accessible image carousel with index navigation, bounds checking, and keyboard controls.',
    takeaways: [
      'Model carousel state with a current index and compute bounds using modular arithmetic or clamped boundaries.',
      'Provide explicit Previous and Next buttons with clear accessible labels (aria-label="Previous slide").',
      'Listen for ArrowLeft and ArrowRight keyboard events to ensure complete keyboard accessibility.',
      'Announce slide changes to screen readers using an aria-live="polite" status region (e.g., "Slide 2 of 5").',
    ],
    terms: {
      carousel: {
        term: 'Carousel',
        definition: 'A UI pattern displaying a sequence of images or content cards with forward and backward navigation controls.',
      },
      ariaLive: {
        term: 'aria-live',
        definition: 'An ARIA attribute that causes assistive tech to speak dynamic content updates without user focus moving there.',
      },
    },
    a11yNotes: [
      'Include a live status element announcing "Slide X of Y" so non-visual users know the current position.',
      'Provide a pause button if auto-rotation is implemented, and respect the prefers-reduced-motion media query.',
    ],
    estimatedMinutes: 18,
    sections: [
      {
        heading: 'Carousel State Management',
        body: [
          'A robust gallery separates its data array from the current view index and rendering logic.',
          'Clamping indices prevents out-of-bounds array access errors when advancing past the last slide.',
        ],
        code: {
          label: 'Gallery controller pattern',
          code: 'function createCarousel(slides) {\n  let index = 0;\n  return {\n    next: () => { index = (index + 1) % slides.length; return slides[index]; },\n    prev: () => { index = (index - 1 + slides.length) % slides.length; return slides[index]; },\n    current: () => slides[index],\n    getIndex: () => index,\n  };\n}',
        },
        callout: {
          kind: 'why',
          text: 'Modular arithmetic ((index + 1) % length) creates a seamless wrapping loop without manual branching.',
        },
      },
      {
        heading: 'Keyboard and ARIA Integration',
        body: [
          'Carousels must be operable without a mouse. Adding a keydown listener for ArrowLeft and ArrowRight satisfies WCAG 2.1 keyboard criteria.',
          'Use aria-roledescription="carousel" and label each slide with role="group" and aria-roledescription="slide".',
        ],
        code: {
          label: 'Keyboard listener',
          code: 'document.addEventListener(\'keydown\', (e) => {\n  if (e.key === \'ArrowRight\') carousel.next();\n  if (e.key === \'ArrowLeft\') carousel.prev();\n});',
        },
        callout: {
          kind: 'mistake',
          text: 'Avoid autoplaying carousels without pause controls, which can be disorienting and inaccessible to users with cognitive disabilities.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-gallery',
        title: 'Minimal Carousel Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <div role="region" aria-roledescription="carousel" aria-label="Featured Works">
    <button id="prev" aria-label="Previous slide">&larr; Prev</button>
    <span id="slide-text">Slide 1: Nebula</span>
    <button id="next" aria-label="Next slide">Next &rarr;</button>
  </div>
  <script>
    const slides = ['Slide 1: Nebula', 'Slide 2: Pulsar', 'Slide 3: Galaxy'];
    let idx = 0;
    const txt = document.getElementById('slide-text');
    document.getElementById('next').addEventListener('click', () => {
      idx = (idx + 1) % slides.length;
      txt.textContent = slides[idx];
    });
    document.getElementById('prev').addEventListener('click', () => {
      idx = (idx - 1 + slides.length) % slides.length;
      txt.textContent = slides[idx];
    });
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'web-storage',
    objective: 'Persist application data in the browser with localStorage, handle JSON serialization, and gracefully catch quota errors.',
    takeaways: [
      'localStorage stores key-value string pairs synchronously across browser sessions with roughly 5MB storage capacity.',
      'sessionStorage has the same API as localStorage, but stored data is cleared as soon as the browser tab closes.',
      'Values must be serialized with JSON.stringify on save and parsed with JSON.parse upon retrieval.',
      'Always wrap storage calls in try/catch blocks to gracefully handle QuotaExceededError or disabled private-mode storage.',
    ],
    terms: {
      localStorage: {
        term: 'localStorage',
        definition: 'A web storage mechanism providing persistent key-value storage scoped to the document origin.',
      },
      serialization: {
        term: 'Serialization',
        definition: 'Converting an in-memory data structure (like an object) into a storable string format like JSON.',
      },
    },
    a11yNotes: [
      'Persist learner accessibility preferences (such as high-contrast mode or reduced motion) in localStorage across sessions.',
      'If storage fails (e.g. storage disabled in strict privacy modes), provide non-intrusive notices rather than breaking the application.',
    ],
    estimatedMinutes: 14,
    sections: [
      {
        heading: 'Reading, Writing, and JSON Handling',
        body: [
          'Because Web Storage only stores strings, structured objects and arrays must be serialized via JSON.stringify.',
          'Always validate the result of JSON.parse with a fallback default in case stored data has been corrupted or wiped.',
        ],
        code: {
          label: 'Safe storage helper',
          code: 'function saveItem(key, value) {\n  try {\n    localStorage.setItem(key, JSON.stringify(value));\n    return true;\n  } catch (err) {\n    console.warn(\'Storage write failed:\', err);\n    return false;\n  }\n}\n\nfunction loadItem(key, fallback = null) {\n  try {\n    const raw = localStorage.getItem(key);\n    return raw ? JSON.parse(raw) : fallback;\n  } catch {\n    return fallback;\n  }\n}',
        },
        callout: {
          kind: 'why',
          text: 'Wrapping storage operations in safe helper functions prevents uncaught JSON parse exceptions and storage quota crashes.',
        },
      },
      {
        heading: 'In-Memory Fallback Shims',
        body: [
          'In restricted sandboxes (like opaque iframes or privacy modes), window.localStorage may throw a SecurityError.',
          'Providing an in-memory Map fallback shim guarantees that application logic continues to function seamlessly.',
        ],
        code: {
          label: 'In-memory storage shim',
          code: 'function createStorageShim() {\n  const memory = new Map();\n  return {\n    getItem: (k) => memory.get(k) ?? null,\n    setItem: (k, v) => { memory.set(k, String(v)); },\n    removeItem: (k) => { memory.delete(k); },\n    clear: () => { memory.clear(); },\n  };\n}',
        },
        callout: {
          kind: 'why',
          text: 'Using a storage shim makes your unit tests easy to run in isolated node or worker environments without mocking DOM storage.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-web-storage',
        title: 'Storage Persistence Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <input id="note-input" placeholder="Type a note..." />
  <button id="save-note">Save</button>
  <p id="saved-display">No saved note.</p>
  <script>
    const input = document.getElementById('note-input');
    const display = document.getElementById('saved-display');
    const saved = localStorage.getItem('demo_note');
    if (saved) display.textContent = 'Saved: ' + saved;
    document.getElementById('save-note').addEventListener('click', () => {
      localStorage.setItem('demo_note', input.value);
      display.textContent = 'Saved: ' + input.value;
    });
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'testing-basics',
    objective: 'Write deterministic automated unit tests, compose assertions, and verify edge cases with visible test suites.',
    takeaways: [
      'A unit test validates that an isolated unit of code (typically a function) produces the expected output for a given input.',
      'Structure test cases using the Arrange-Act-Assert (AAA) pattern for readability and clear failure diagnostics.',
      'Use deep equality assertions (toEqual) when comparing objects and arrays, and strict equality (toBe) for primitive values.',
      'Test boundary conditions, empty collections, negative numbers, and nullish inputs to verify robust error resilience.',
    ],
    terms: {
      assertion: {
        term: 'Assertion',
        definition: 'A boolean expression declared in a test that verifies whether the actual runtime value matches the expected outcome.',
      },
      aaaPattern: {
        term: 'Arrange-Act-Assert',
        definition: 'A testing pattern dividing test code into three distinct phases: setting up test state, invoking the unit, and verifying assertions.',
      },
    },
    a11yNotes: [
      'Include automated accessibility tests (such as axe-core or contrast audits) in your automated CI verification pipelines.',
      'Test that keyboard events fire correct logical state transitions without requiring pointer interactions.',
    ],
    estimatedMinutes: 15,
    sections: [
      {
        heading: 'Anatomy of a Unit Test',
        body: [
          'A good test is isolated, repeatable, fast, and gives an unambiguous error message upon failure.',
          'Each test case should verify one specific behavior or edge condition rather than testing an entire application workflow at once.',
        ],
        code: {
          label: 'Test case structure',
          code: 'function test(name, fn) {\n  try {\n    fn();\n    console.log(\'✓ PASS:\', name);\n  } catch (err) {\n    console.error(\'✗ FAIL:\', name, err.message);\n  }\n}\n\nfunction expect(actual) {\n  return {\n    toBe: (expected) => {\n      if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`);\n    },\n  };\n}',
        },
        callout: {
          kind: 'why',
          text: 'Clear assertion messages show the exact difference between expected and actual values, speeding up debugging.',
        },
      },
      {
        heading: 'Testing Edge Cases and Boundary Conditions',
        body: [
          'Code often breaks at boundary edges: 0, -1, empty arrays [], undefined properties, or strings with whitespace.',
          'Writing parameterized test cases over an array of test inputs provides broad coverage across positive, negative, and edge scenarios.',
        ],
        code: {
          label: 'Testing boundary inputs',
          code: 'test(\'calculates average of numbers\', () => {\n  expect(average([10, 20])).toBe(15);\n  expect(average([0])).toBe(0);\n  expect(average([])).toBe(0); // edge case handling\n});',
        },
        callout: {
          kind: 'mistake',
          text: 'Do not write tests that rely on external network calls or system wall-clock time, as they cause flaky test failures.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-testing-basics',
        title: 'Simple Test Runner',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <h3>Test Suite Output</h3>
  <pre id="test-log"></pre>
  <script>
    const logs = [];
    function check(name, pass) {
      logs.push((pass ? '✓ PASS: ' : '✗ FAIL: ') + name);
    }
    check('Add positive numbers', 2 + 2 === 4);
    check('String trimming', '  hi  '.trim() === 'hi');
    check('Empty array length', [].length === 0);
    document.getElementById('test-log').textContent = logs.join('\\n');
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'data-structures-basics',
    objective: 'Implement key data structures including Map and Set to optimize lookup performance and handle unique collections.',
    takeaways: [
      'JavaScript Map stores key-value pairs with O(1) average lookup, insertion, and deletion, accepting keys of any type.',
      'JavaScript Set stores unique values with O(1) average membership tests (.has), eliminating duplicate array elements efficiently.',
      'Unlike plain objects, Map preserves insertion order, provides an accurate .size property, and avoids prototype key collisions.',
      'Converting an array with duplicates to a Set and back ([...new Set(arr)]) removes duplicates in O(n) linear time.',
    ],
    terms: {
      map: {
        term: 'Map',
        definition: 'A keyed data structure that holds key-value pairs and remembers the original insertion order of the keys.',
      },
      set: {
        term: 'Set',
        definition: 'A collection of unique values where each element may occur only once.',
      },
      lookupComplexity: {
        term: 'O(1) Time Complexity',
        definition: 'Constant time complexity where the operation duration is independent of the number of items stored in the collection.',
      },
    },
    a11yNotes: [
      'When populating complex UI trees from Map structures, ensure DOM parent-child relationships match accessibility hierarchy.',
      'Avoid high-frequency DOM repaints when updating data structures by batching rendering updates.',
    ],
    estimatedMinutes: 16,
    sections: [
      {
        heading: 'Map vs Plain Objects',
        body: [
          'While plain objects can act as simple dictionaries, Map is designed specifically for dynamic collections of keys and values.',
          'Map keys can be functions, objects, or primitive types, and Map does not contain default prototype keys like toString.',
        ],
        code: {
          label: 'Using Map for lookups',
          code: 'const userCache = new Map();\nuserCache.set(\'u-101\', { name: \'Ada\', role: \'Admin\' });\nuserCache.set(\'u-102\', { name: \'Alan\', role: \'User\' });\n\nif (userCache.has(\'u-101\')) {\n  console.log(userCache.get(\'u-101\').name); // Ada\n}\nconsole.log(userCache.size); // 2',
        },
        callout: {
          kind: 'why',
          text: 'Map lookup with .get() runs in O(1) time regardless of whether the map holds ten or ten thousand entries.',
        },
      },
      {
        heading: 'Deduplicating with Set',
        body: [
          'A Set guarantees that every element is unique. Attempting to add an existing value is a no-op.',
          'Checking membership with set.has(x) is O(1) average time, making it drastically faster than array.includes(x) (which is O(n)).',
        ],
        code: {
          label: 'Array deduplication',
          code: 'const tags = [\'react\', \'css\', \'html\', \'css\', \'react\', \'typescript\'];\nconst uniqueTags = [...new Set(tags)];\n// [\'react\', \'css\', \'html\', \'typescript\']',
        },
        callout: {
          kind: 'why',
          text: 'Replace nested array.includes() searches with a pre-populated Set to reduce quadratic O(n^2) algorithms to linear O(n).',
        },
      },
    ],
    demos: [
      {
        id: 'demo-data-structures-basics',
        title: 'Map & Set Performance Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <div id="output"></div>
  <script>
    const set = new Set([1, 2, 2, 3, 4, 4, 5]);
    const map = new Map();
    map.set('total', set.size);
    document.getElementById('output').textContent = 'Unique items count: ' + map.get('total');
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'algorithms-basics',
    objective: 'Analyze algorithmic problem solving with linear search, binary search on sorted data, and recursive functions.',
    takeaways: [
      'Linear search examines items one-by-one with O(n) time complexity; binary search divides sorted data in half with O(log n) time.',
      'Binary search requires that the input array is already sorted; running binary search on unsorted data produces incorrect results.',
      'Every recursive function requires at least one base case to terminate execution and prevent Maximum Call Stack Exceeded errors.',
      'Custom sorting in JavaScript with array.sort((a, b) => a - b) avoids lexicographical string conversion gotchas with numbers.',
    ],
    terms: {
      binarySearch: {
        term: 'Binary Search',
        definition: 'A search algorithm that repeatedly divides a sorted search interval in half to locate a target in O(log n) time.',
      },
      recursion: {
        term: 'Recursion',
        definition: 'A programming technique in which a function calls itself to solve smaller sub-problems of the overall problem.',
      },
      baseCase: {
        term: 'Base Case',
        definition: 'The termination condition in a recursive function that returns a concrete result without making further recursive calls.',
      },
    },
    a11yNotes: [
      'When displaying search results dynamically, provide live region feedback announcing the number of results found.',
      'Ensure sorting buttons indicate their active sort order (ascending/descending) using aria-sort attributes on table headers.',
    ],
    estimatedMinutes: 18,
    sections: [
      {
        heading: 'Binary Search on Sorted Arrays',
        body: [
          'Binary search tracks low and high pointers, computes the midpoint, and halves the remaining candidate space on each step.',
          'For an array of 1,000,000 items, linear search may take 1,000,000 comparisons, whereas binary search takes at most 20 comparisons.',
        ],
        code: {
          label: 'Binary search implementation',
          code: 'function binarySearch(arr, target) {\n  let low = 0;\n  let high = arr.length - 1;\n  while (low <= high) {\n    const mid = Math.floor((low + high) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) low = mid + 1;\n    else high = mid - 1;\n  }\n  return -1; // Not found\n}',
        },
        callout: {
          kind: 'why',
          text: 'O(log n) algorithms scale gracefully to massive datasets because doubling the input size only adds one additional step.',
        },
      },
      {
        heading: 'Recursion and Base Cases',
        body: [
          'Recursion breaks a problem into smaller instances of the same problem.',
          'Always identify the base case first: what is the simplest input where the answer is immediately known without further recursion?',
        ],
        code: {
          label: 'Recursive factorial',
          code: 'function factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive step\n}',
        },
        callout: {
          kind: 'mistake',
          text: 'Missing or unreachable base cases result in infinite recursion, throwing a RangeError: Maximum call stack size exceeded.',
        },
      },
    ],
    demos: [
      {
        id: 'demo-algorithms-basics',
        title: 'Binary Search Demo',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html>
<body>
  <div id="res"></div>
  <script>
    function bs(arr, x) {
      let l = 0, r = arr.length - 1;
      while (l <= r) {
        let m = Math.floor((l + r) / 2);
        if (arr[m] === x) return m;
        if (arr[m] < x) l = m + 1; else r = m - 1;
      }
      return -1;
    }
    const data = [10, 20, 30, 40, 50, 60, 70];
    document.getElementById('res').textContent = 'Index of 50 in data: ' + bs(data, 50);
  </script>
</body>
</html>`,
          },
        ],
      },
    ],
  },
]
