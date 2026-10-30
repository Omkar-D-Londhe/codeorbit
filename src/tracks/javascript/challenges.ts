import type { Challenge } from '../../data/types'

export const jsChallenges: Challenge[] = [
  {
    id: 'ch-js-variables-types',
    topicId: 'variables-types',
    title: 'Profile Formatter and Age Calculator',
    difficulty: 'beginner',
    prompt:
      'Implement formatProfile(user, currentYear). The user object has { name: string, birthYear: number, isVerified?: boolean }. Return { displayName: string, age: number, status: "Verified" | "Standard" }. If birthYear > currentYear, throw an Error with "Invalid birth year".',
    objective:
      'Extract user fields, compute age, assign status based on boolean condition, and throw an Error on invalid birth years.',
    starterCode: `function formatProfile(user, currentYear) {
  // TODO: implement formatProfile
  return null;
}
`,
    solutionCode: `function formatProfile(user, currentYear) {
  if (user.birthYear > currentYear) {
    throw new Error('Invalid birth year');
  }
  const age = currentYear - user.birthYear;
  const status = user.isVerified ? 'Verified' : 'Standard';
  return {
    displayName: user.name.trim(),
    age,
    status,
  };
}
`,
    solutionExplanation: [
      'Checks if user.birthYear exceeds currentYear and throws an error if invalid.',
      'Computes age immutably using subtraction.',
      'Uses ternary expression to assign status cleanly.',
    ],
    hints: [
      'Check if user.birthYear > currentYear first; throw new Error("Invalid birth year") if so.',
      'Use a ternary operator: user.isVerified ? "Verified" : "Standard".',
      'Return an object containing { displayName: user.name.trim(), age, status }.',
    ],
    requirements: [
      {
        id: 'req-fn-format',
        description: 'Declares formatProfile function',
        explanation: 'Declares formatProfile function',
        rule: { kind: 'declaresFunction', name: 'formatProfile' },
      },
      {
        id: 'req-tests-format',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-vt-1',
        name: 'Formats verified adult profile',
        call: "formatProfile({ name: 'Ada Lovelace', birthYear: 1990, isVerified: true }, 2026)",
        expect: { displayName: 'Ada Lovelace', age: 36, status: 'Verified' },
      },
      {
        id: 't-vt-2',
        name: 'Formats standard unverified profile',
        call: "formatProfile({ name: 'Bob Smith ', birthYear: 2000 }, 2026)",
        expect: { displayName: 'Bob Smith', age: 26, status: 'Standard' },
      },
      {
        id: 't-vt-3',
        name: 'Calculates exact age for newborns',
        call: "formatProfile({ name: 'Baby', birthYear: 2026, isVerified: false }, 2026)",
        expect: { displayName: 'Baby', age: 0, status: 'Standard' },
      },
      {
        id: 't-vt-hidden-1',
        name: 'Throws error on future birth year',
        call: "(() => { try { formatProfile({ name: 'TimeTraveler', birthYear: 2030 }, 2026); return 'no-throw'; } catch (e) { return e.message; } })()",
        expect: 'Invalid birth year',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-control-flow',
    topicId: 'control-flow',
    title: 'Grade Classifier with Guard Clauses',
    difficulty: 'beginner',
    prompt:
      'Implement classifyScore(score). Return "Invalid" if score < 0 or score > 100 or typeof score !== "number". Return "A" for 90-100, "B" for 80-89, "C" for 70-79, "D" for 60-69, and "F" for 0-59.',
    objective:
      'Validate numerical bounds using guard clauses and classify student scores into letter grades.',
    starterCode: `function classifyScore(score) {
  // TODO: implement classifyScore
  return '';
}
`,
    solutionCode: `function classifyScore(score) {
  if (typeof score !== 'number' || Number.isNaN(score) || score < 0 || score > 100) {
    return 'Invalid';
  }
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
`,
    solutionExplanation: [
      'Guard clause verifies that score is a valid finite number between 0 and 100.',
      'Sequential cascading if statements return the highest matching letter grade immediately.',
      'Any score below 60 naturally falls through to "F".',
    ],
    hints: [
      'Use typeof score !== "number" || score < 0 || score > 100 to catch invalid inputs.',
      'Check highest grade thresholds first: score >= 90 returns "A".',
      'Because earlier cases return early, you do not need nested else if branches.',
    ],
    requirements: [
      {
        id: 'req-fn-classify',
        description: 'Declares classifyScore function',
        explanation: 'Declares classifyScore function',
        rule: { kind: 'declaresFunction', name: 'classifyScore' },
      },
      {
        id: 'req-tests-classify',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-cf-1',
        name: 'Classifies high scores as A',
        call: 'classifyScore(95)',
        expect: 'A',
      },
      {
        id: 't-cf-2',
        name: 'Classifies mid-range scores',
        call: 'classifyScore(78)',
        expect: 'C',
      },
      {
        id: 't-cf-3',
        name: 'Rejects negative score',
        call: 'classifyScore(-5)',
        expect: 'Invalid',
      },
      {
        id: 't-cf-hidden-1',
        name: 'Rejects score over 100 or non-numeric types',
        call: "classifyScore('100')",
        expect: 'Invalid',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-functions',
    topicId: 'functions',
    title: 'Encapsulated Step Counter Closure',
    difficulty: 'beginner',
    prompt:
      'Implement createStepCounter(initialValue = 0, step = 1). Return an object with get(), step(), and reset() methods that manage encapsulated count state.',
    objective:
      'Create a factory function returning a closure with private numeric state and accessor methods.',
    starterCode: `function createStepCounter(initialValue = 0, step = 1) {
  // TODO: implement step counter closure
  return null;
}
`,
    solutionCode: `function createStepCounter(initialValue = 0, step = 1) {
  let count = initialValue;
  return {
    get: () => count,
    step: () => {
      count += step;
      return count;
    },
    reset: () => {
      count = initialValue;
      return count;
    },
  };
}
`,
    solutionExplanation: [
      'Declares a private local variable count initialized to initialValue.',
      'Returns an object whose methods close over count.',
      'reset() restores count back to the original initialValue.',
    ],
    hints: [
      'Declare let count = initialValue inside the factory function.',
      'step() increments count by step and returns the updated count.',
      'reset() assigns count back to initialValue and returns it.',
    ],
    requirements: [
      {
        id: 'req-fn-stepcounter',
        description: 'Declares createStepCounter function',
        explanation: 'Declares createStepCounter function',
        rule: { kind: 'declaresFunction', name: 'createStepCounter' },
      },
      {
        id: 'req-tests-stepcounter',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-fn-1',
        name: 'Initializes with default zero and increments',
        call: '(() => { const c = createStepCounter(); c.step(); return c.get(); })()',
        expect: 1,
      },
      {
        id: 't-fn-2',
        name: 'Respects custom initialValue and custom step',
        call: '(() => { const c = createStepCounter(10, 5); c.step(); c.step(); return c.get(); })()',
        expect: 20,
      },
      {
        id: 't-fn-3',
        name: 'Resets back to initial value',
        call: '(() => { const c = createStepCounter(10, 5); c.step(); c.reset(); return c.get(); })()',
        expect: 10,
      },
      {
        id: 't-fn-hidden-1',
        name: 'Maintains isolated state across multiple instances',
        call: '(() => { const a = createStepCounter(0, 1); const b = createStepCounter(100, 10); a.step(); return [a.get(), b.get()]; })()',
        expect: [1, 100],
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-arrays-objects',
    topicId: 'arrays-objects',
    title: 'Active User Aggregator',
    difficulty: 'intermediate',
    prompt:
      'Implement aggregateActiveUsers(users). Filter for active === true, sort descending by score, and map each user to "${name} (${score} pts)".',
    objective:
      'Chain filter, sort, and map methods to transform an array of user objects cleanly without side effects.',
    starterCode: `function aggregateActiveUsers(users) {
  // TODO: implement aggregateActiveUsers
  return [];
}
`,
    solutionCode: `function aggregateActiveUsers(users) {
  return users
    .filter((u) => Boolean(u.active))
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((u) => \`\${u.name} (\${u.score} pts)\`);
}
`,
    solutionExplanation: [
      'Filters the list for users where active is truthy.',
      'Sorts users in descending order of score using (a, b) => b.score - a.score.',
      'Maps each item into a formatted template literal string.',
    ],
    hints: [
      'Use users.filter(u => u.active) to extract active accounts.',
      'Use .sort((a, b) => b.score - a.score) for descending numerical sort.',
      'Use .map(u => `${u.name} (${u.score} pts)`) to generate the target strings.',
    ],
    requirements: [
      {
        id: 'req-fn-aggusers',
        description: 'Declares aggregateActiveUsers function',
        explanation: 'Declares aggregateActiveUsers function',
        rule: { kind: 'declaresFunction', name: 'aggregateActiveUsers' },
      },
      {
        id: 'req-tests-aggusers',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-ao-1',
        name: 'Filters inactive users and formats output',
        call: `aggregateActiveUsers([
          { id: 1, name: 'Alice', active: true, score: 95 },
          { id: 2, name: 'Bob', active: false, score: 99 },
          { id: 3, name: 'Charlie', active: true, score: 80 }
        ])`,
        expect: ['Alice (95 pts)', 'Charlie (80 pts)'],
      },
      {
        id: 't-ao-2',
        name: 'Correctly sorts users descending by score',
        call: `aggregateActiveUsers([
          { id: 1, name: 'Low', active: true, score: 40 },
          { id: 2, name: 'High', active: true, score: 100 }
        ])`,
        expect: ['High (100 pts)', 'Low (40 pts)'],
      },
      {
        id: 't-ao-3',
        name: 'Handles empty array gracefully',
        call: 'aggregateActiveUsers([])',
        expect: [],
      },
      {
        id: 't-ao-hidden-1',
        name: 'Returns empty array when no users are active',
        call: "aggregateActiveUsers([{ id: 1, name: 'Ghost', active: false, score: 50 }])",
        expect: [],
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-events',
    topicId: 'events',
    title: 'Interactive Click Counter and Query Hook',
    difficulty: 'beginner',
    prompt:
      'Implement createClickTracker(). It returns { click(): number, getCount(): number, reset(): void } which starts at 0, increments on click(), and resets to 0 on reset().',
    objective:
      'Manage interaction click counter state and expose query and dispatch helper methods.',
    starterCode: `function createClickTracker() {
  // TODO: implement click tracker
  return null;
}
`,
    solutionCode: `function createClickTracker() {
  let count = 0;
  return {
    click: () => {
      count += 1;
      return count;
    },
    getCount: () => count,
    reset: () => {
      count = 0;
    },
  };
}
`,
    solutionExplanation: [
      'Encapsulates a count variable starting at 0.',
      'click() increments count by 1 and returns the new count.',
      'reset() clears count back to 0.',
    ],
    hints: [
      'Keep let count = 0 inside createClickTracker.',
      'In click(), increment count and return it.',
      'In reset(), set count = 0.',
    ],
    requirements: [
      {
        id: 'req-fn-clicktracker',
        description: 'Declares createClickTracker function',
        explanation: 'Declares createClickTracker function',
        rule: { kind: 'declaresFunction', name: 'createClickTracker' },
      },
      {
        id: 'req-tests-clicktracker',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-ev-1',
        name: 'Initializes at 0 clicks',
        call: 'createClickTracker().getCount()',
        expect: 0,
      },
      {
        id: 't-ev-2',
        name: 'Increments count on click',
        call: '(() => { const t = createClickTracker(); t.click(); t.click(); return t.getCount(); })()',
        expect: 2,
      },
      {
        id: 't-ev-3',
        name: 'Resets count to 0',
        call: '(() => { const t = createClickTracker(); t.click(); t.reset(); return t.getCount(); })()',
        expect: 0,
      },
      {
        id: 't-ev-hidden-1',
        name: 'Returns updated count directly from click invocation',
        call: '(() => { const t = createClickTracker(); return t.click(); })()',
        expect: 1,
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-dom',
    topicId: 'dom',
    title: 'Dynamic Task List Item Renderer',
    difficulty: 'intermediate',
    prompt:
      'Implement renderTaskItems(tasks). For each task { id: string, title: string, completed: boolean }, produce a descriptor { tag: "li", className: string, text: string } where className is "task completed" if completed is true, or "task" if false.',
    objective:
      'Map task models to DOM node descriptors with conditional class names and safe textContent.',
    starterCode: `function renderTaskItems(tasks) {
  // TODO: implement renderTaskItems
  return [];
}
`,
    solutionCode: `function renderTaskItems(tasks) {
  return tasks.map((task) => ({
    tag: 'li',
    className: task.completed ? 'task completed' : 'task',
    text: task.title.trim(),
  }));
}
`,
    solutionExplanation: [
      'Iterates over tasks with map().',
      'Assigns conditional className based on the completed boolean flag.',
      'Trims task.title to ensure clean rendered text.',
    ],
    hints: [
      'Use tasks.map(task => ({ ... })).',
      'Set className to task.completed ? "task completed" : "task".',
      'Set text to task.title.trim().',
    ],
    requirements: [
      {
        id: 'req-fn-rendertask',
        description: 'Declares renderTaskItems function',
        explanation: 'Declares renderTaskItems function',
        rule: { kind: 'declaresFunction', name: 'renderTaskItems' },
      },
      {
        id: 'req-tests-rendertask',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-dom-1',
        name: 'Renders single incomplete task',
        call: "renderTaskItems([{ id: '1', title: 'Write tests', completed: false }])",
        expect: [{ tag: 'li', className: 'task', text: 'Write tests' }],
      },
      {
        id: 't-dom-2',
        name: 'Renders completed task with completed class',
        call: "renderTaskItems([{ id: '2', title: 'Submit PR', completed: true }])",
        expect: [{ tag: 'li', className: 'task completed', text: 'Submit PR' }],
      },
      {
        id: 't-dom-3',
        name: 'Renders empty list for empty array',
        call: 'renderTaskItems([])',
        expect: [],
      },
      {
        id: 't-dom-hidden-1',
        name: 'Renders multiple mixed status tasks',
        call: "renderTaskItems([{ id: 'a', title: 'A', completed: true }, { id: 'b', title: 'B', completed: false }])",
        expect: [
          { tag: 'li', className: 'task completed', text: 'A' },
          { tag: 'li', className: 'task', text: 'B' },
        ],
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-validation',
    topicId: 'validation',
    title: 'Registration Form Validator with Error Messages',
    difficulty: 'intermediate',
    prompt:
      'Implement validateRegistration(formData). Check that email matches /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/ and password has length >= 8 and at least one number (/\\d/). Return { valid: boolean, errors: { email?: string, password?: string } }.',
    objective:
      'Enforce format and length rules across multiple inputs and return structured validation error messages.',
    starterCode: `function validateRegistration(formData) {
  // TODO: implement validateRegistration
  return { valid: false, errors: {} };
}
`,
    solutionCode: `function validateRegistration(formData) {
  const errors = {};
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

  if (!formData || !formData.email || !emailRegex.test(formData.email.trim())) {
    errors.email = 'Valid email is required.';
  }

  const pwd = formData && formData.password ? String(formData.password) : '';
  if (pwd.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  } else if (!/\\d/.test(pwd)) {
    errors.password = 'Password must contain at least one number.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
`,
    solutionExplanation: [
      'Tests email against standard RFC-like email pattern regex.',
      'Checks password length >= 8 and verifies presence of at least one digit using /\\d/.',
      'valid is true only when the errors object has zero keys.',
    ],
    hints: [
      'Initialize an empty errors object: const errors = {}.',
      'Test email: if (!emailRegex.test(formData.email)) errors.email = "Valid email is required.";',
      'Check password: length >= 8 and /\\d/.test(password).',
    ],
    requirements: [
      {
        id: 'req-fn-validate-reg',
        description: 'Declares validateRegistration function',
        explanation: 'Declares validateRegistration function',
        rule: { kind: 'declaresFunction', name: 'validateRegistration' },
      },
      {
        id: 'req-tests-validate-reg',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-val-1',
        name: 'Accepts valid email and complex password',
        call: "validateRegistration({ email: 'ada@codeorbit.dev', password: 'SecretPassword99' })",
        expect: { valid: true, errors: {} },
      },
      {
        id: 't-val-2',
        name: 'Flags invalid email syntax',
        call: "validateRegistration({ email: 'bad-email', password: 'SecretPassword99' })",
        expect: { valid: false, errors: { email: 'Valid email is required.' } },
      },
      {
        id: 't-val-3',
        name: 'Flags password with fewer than 8 characters',
        call: "validateRegistration({ email: 'test@example.com', password: 'short1' })",
        expect: { valid: false, errors: { password: 'Password must be at least 8 characters.' } },
      },
      {
        id: 't-val-hidden-1',
        name: 'Flags password without numeric digits',
        call: "validateRegistration({ email: 'test@example.com', password: 'noNumbersInHere' })",
        expect: { valid: false, errors: { password: 'Password must contain at least one number.' } },
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-gallery',
    topicId: 'gallery',
    title: 'Image Carousel Navigation Controller',
    difficulty: 'intermediate',
    prompt:
      'Implement createCarouselController(slides). Return an object with next(), prev(), current(), getIndex(), and goTo(index). Bounds wrap around: next() wraps from last slide to first (0), prev() wraps from first to last (slides.length - 1). goTo(idx) clamps idx to 0..slides.length-1.',
    objective:
      'Implement carousel navigation logic with modular arithmetic wrapping and bounds clamping.',
    starterCode: `function createCarouselController(slides) {
  // TODO: implement carousel controller
  return null;
}
`,
    solutionCode: `function createCarouselController(slides) {
  let index = 0;
  const len = slides.length;

  return {
    current: () => slides[index],
    getIndex: () => index,
    next: () => {
      index = (index + 1) % len;
      return slides[index];
    },
    prev: () => {
      index = (index - 1 + len) % len;
      return slides[index];
    },
    goTo: (idx) => {
      index = Math.max(0, Math.min(idx, len - 1));
      return slides[index];
    },
  };
}
`,
    solutionExplanation: [
      'Tracks current index in private closure state.',
      'Uses modular arithmetic (index + 1) % len to wrap forward.',
      'Uses (index - 1 + len) % len to wrap backward safely without negative modulo.',
      'Clamps target index in goTo() using Math.max and Math.min.',
    ],
    hints: [
      'Use modular arithmetic for next: index = (index + 1) % slides.length.',
      'For prev: index = (index - 1 + slides.length) % slides.length.',
      'Clamp in goTo: Math.max(0, Math.min(idx, slides.length - 1)).',
    ],
    requirements: [
      {
        id: 'req-fn-carousel',
        description: 'Declares createCarouselController function',
        explanation: 'Declares createCarouselController function',
        rule: { kind: 'declaresFunction', name: 'createCarouselController' },
      },
      {
        id: 'req-tests-carousel',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-gal-1',
        name: 'Returns first slide initially',
        call: "createCarouselController(['slide-a', 'slide-b', 'slide-c']).current()",
        expect: 'slide-a',
      },
      {
        id: 't-gal-2',
        name: 'Navigates next and wraps around from end to beginning',
        call: "(() => { const c = createCarouselController(['A', 'B']); c.next(); c.next(); return c.current(); })()",
        expect: 'A',
      },
      {
        id: 't-gal-3',
        name: 'Navigates prev wrapping from beginning to end',
        call: "(() => { const c = createCarouselController(['A', 'B', 'C']); c.prev(); return c.current(); })()",
        expect: 'C',
      },
      {
        id: 't-gal-hidden-1',
        name: 'Clamps out-of-bounds index in goTo',
        call: "(() => { const c = createCarouselController(['A', 'B', 'C']); c.goTo(99); return c.getIndex(); })()",
        expect: 2,
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-web-storage',
    topicId: 'web-storage',
    title: 'Memory Fallback Storage Adapter',
    difficulty: 'intermediate',
    prompt:
      'Implement createStorageAdapter(). Return an object with get(key, fallback), set(key, value), remove(key), and clear(). Values should be JSON-serialized on set and parsed on get. If key is missing, return fallback.',
    objective:
      'Author an in-memory key-value storage adapter with JSON serialization and fallback handling.',
    starterCode: `function createStorageAdapter() {
  // TODO: implement storage adapter
  return null;
}
`,
    solutionCode: `function createStorageAdapter() {
  const store = new Map();
  return {
    get: (key, fallback = null) => {
      if (!store.has(key)) return fallback;
      try {
        return JSON.parse(store.get(key));
      } catch {
        return fallback;
      }
    },
    set: (key, value) => {
      store.set(key, JSON.stringify(value));
    },
    remove: (key) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}
`,
    solutionExplanation: [
      'Encapsulates an in-memory Map store.',
      'set() converts incoming values to strings via JSON.stringify.',
      'get() parses JSON strings back into objects or returns fallback if missing.',
      'remove() and clear() manage cache eviction.',
    ],
    hints: [
      'Use a const store = new Map() inside createStorageAdapter.',
      'In set(key, value), call store.set(key, JSON.stringify(value)).',
      'In get(key, fallback), check store.has(key) and parse JSON.parse(store.get(key)).',
    ],
    requirements: [
      {
        id: 'req-fn-storageadapter',
        description: 'Declares createStorageAdapter function',
        explanation: 'Declares createStorageAdapter function',
        rule: { kind: 'declaresFunction', name: 'createStorageAdapter' },
      },
      {
        id: 'req-tests-storageadapter',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-ws-1',
        name: 'Stores and retrieves structured object',
        call: "(() => { const s = createStorageAdapter(); s.set('user', { id: 1, name: 'Alice' }); return s.get('user'); })()",
        expect: { id: 1, name: 'Alice' },
      },
      {
        id: 't-ws-2',
        name: 'Returns specified fallback when key does not exist',
        call: "(() => { const s = createStorageAdapter(); return s.get('missing', 'defaultVal'); })()",
        expect: 'defaultVal',
      },
      {
        id: 't-ws-3',
        name: 'Removes key cleanly',
        call: "(() => { const s = createStorageAdapter(); s.set('k', 42); s.remove('k'); return s.get('k'); })()",
        expect: null,
      },
      {
        id: 't-ws-hidden-1',
        name: 'Clears all items on clear()',
        call: "(() => { const s = createStorageAdapter(); s.set('a', 1); s.set('b', 2); s.clear(); return [s.get('a'), s.get('b')]; })()",
        expect: [null, null],
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-testing-basics',
    topicId: 'testing-basics',
    title: 'Deterministic Assertion Expect Helper',
    difficulty: 'intermediate',
    prompt:
      'Implement miniExpect(actual). Return { toBe(expected), toEqual(expected), toThrow(fn) }. toBe tests strict === equality. toEqual tests deep structural equality (arrays/objects). toThrow calls fn() and throws if fn() did NOT throw an error.',
    objective:
      'Implement unit testing assertion primitives with clear error messaging for mismatched expectations.',
    starterCode: `function miniExpect(actual) {
  // TODO: implement miniExpect
  return {};
}
`,
    solutionCode: `function miniExpect(actual) {
  function deepEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(\`Expected \${expected}, got \${actual}\`);
      }
      return true;
    },
    toEqual: (expected) => {
      if (!deepEqual(actual, expected)) {
        throw new Error(\`Deep equal mismatch: \${JSON.stringify(actual)} !== \${JSON.stringify(expected)}\`);
      }
      return true;
    },
    toThrow: (fn) => {
      let threw = false;
      try {
        fn();
      } catch {
        threw = true;
      }
      if (!threw) {
        throw new Error('Expected function to throw an error, but it did not');
      }
      return true;
    },
  };
}
`,
    solutionExplanation: [
      'toBe asserts strict equality (===) and throws an error on mismatch.',
      'toEqual recursively validates keys and nested properties of arrays and objects.',
      'toThrow invokes the callback in a try-catch block and throws if no exception occurred.',
    ],
    hints: [
      'In toBe(expected), if (actual !== expected) throw new Error(...); return true.',
      'For toEqual, implement a recursive helper that checks Object.keys length and properties.',
      'For toThrow, wrap fn() in try/catch and track whether threw is true.',
    ],
    requirements: [
      {
        id: 'req-fn-miniexpect',
        description: 'Declares miniExpect function',
        explanation: 'Declares miniExpect function',
        rule: { kind: 'declaresFunction', name: 'miniExpect' },
      },
      {
        id: 'req-tests-miniexpect',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-tb-1',
        name: 'Passes toBe assertion on equal numbers',
        call: 'miniExpect(42).toBe(42)',
        expect: true,
      },
      {
        id: 't-tb-2',
        name: 'Passes toEqual on matching nested objects',
        call: "miniExpect({ a: [1, 2] }).toEqual({ a: [1, 2] })",
        expect: true,
      },
      {
        id: 't-tb-3',
        name: 'Passes toThrow when callback throws',
        call: "miniExpect(null).toThrow(() => { throw new Error('Boom'); })",
        expect: true,
      },
      {
        id: 't-tb-hidden-1',
        name: 'Fails toEqual when properties differ',
        call: "(() => { try { miniExpect({ x: 1 }).toEqual({ x: 2 }); return 'no-fail'; } catch { return 'threw'; } })()",
        expect: 'threw',
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-data-structures-basics',
    topicId: 'data-structures-basics',
    title: 'Word Frequency Counter with Map',
    difficulty: 'advanced',
    prompt:
      'Implement countWordFrequencies(text). Normalize text by converting to lowercase and stripping punctuation (keep letters, digits, and spaces: /[^a-z0-9\\s]/g). Count occurrences with a Map. Return an object { size: number, get(word): number, top(n): Array<{ word: string, count: number }> } where top(n) sorts by count desc, then word asc on ties.',
    objective:
      'Build a high-performance word frequency index with Map and implement deterministic top-N ranking.',
    starterCode: `function countWordFrequencies(text) {
  // TODO: implement word frequency index with Map
  return null;
}
`,
    solutionCode: `function countWordFrequencies(text) {
  const clean = (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\\s]/g, ' ');
  const words = clean.split(/\\s+/).filter(Boolean);
  const freq = new Map();

  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return {
    size: freq.size,
    get: (word) => freq.get((word || '').toLowerCase()) || 0,
    top: (n) => {
      const entries = Array.from(freq.entries()).map(([word, count]) => ({ word, count }));
      entries.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.word.localeCompare(b.word);
      });
      return entries.slice(0, n);
    },
  };
}
`,
    solutionExplanation: [
      'Sanitizes input text by lowering case and stripping non-alphanumeric characters.',
      'Uses Map to accumulate counts in O(n) linear time.',
      'top(n) sorts entries deterministically by count descending and alphabetical order for ties.',
    ],
    hints: [
      'Use text.toLowerCase().replace(/[^a-z0-9\\s]/g, " ") and .split(/\\s+/).filter(Boolean).',
      'Count into Map: freq.set(word, (freq.get(word) || 0) + 1).',
      'For sorting ties: if (b.count !== a.count) return b.count - a.count; return a.word.localeCompare(b.word);',
    ],
    requirements: [
      {
        id: 'req-fn-wordfreq',
        description: 'Declares countWordFrequencies function',
        explanation: 'Declares countWordFrequencies function',
        rule: { kind: 'declaresFunction', name: 'countWordFrequencies' },
      },
      {
        id: 'req-tests-wordfreq',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-ds-1',
        name: 'Counts word occurrences accurately',
        call: "(() => { const idx = countWordFrequencies('Hello world, hello CodeOrbit!'); return idx.get('hello'); })()",
        expect: 2,
      },
      {
        id: 't-ds-2',
        name: 'Reports correct distinct word size',
        call: "countWordFrequencies('quick brown fox jumps').size",
        expect: 4,
      },
      {
        id: 't-ds-3',
        name: 'Ranks top 2 words by frequency with alphabetical tie-breaker',
        call: "countWordFrequencies('apple banana apple cherry banana cherry cherry').top(2)",
        expect: [
          { word: 'cherry', count: 3 },
          { word: 'apple', count: 2 },
        ],
      },
      {
        id: 't-ds-hidden-1',
        name: 'Returns 0 for absent words',
        call: "countWordFrequencies('orbit').get('missing')",
        expect: 0,
        hidden: true,
      },
    ],
  },
  {
    id: 'ch-js-algorithms-basics',
    topicId: 'algorithms-basics',
    title: 'Logarithmic Binary Search',
    difficulty: 'advanced',
    prompt:
      'Implement binarySearch(arr, target). Return the 0-based index of target in sorted array arr, or -1 if target is not found. Must run in O(log n) time.',
    objective:
      'Implement the classic binary search algorithm with boundary pointers and logarithmic complexity.',
    starterCode: `function binarySearch(arr, target) {
  // TODO: implement binarySearch in O(log n) time
  return -1;
}
`,
    solutionCode: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const value = arr[mid];

    if (value === target) {
      return mid;
    }
    if (value < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
`,
    solutionExplanation: [
      'Maintains low and high pointers delineating the search candidate window.',
      'Computes the midpoint and checks if arr[mid] matches target.',
      'Halves the candidate window on each iteration, achieving O(log n) efficiency.',
    ],
    hints: [
      'Set let low = 0 and let high = arr.length - 1.',
      'In a while (low <= high) loop, calculate const mid = Math.floor((low + high) / 2).',
      'If arr[mid] < target, advance low = mid + 1; otherwise high = mid - 1.',
    ],
    requirements: [
      {
        id: 'req-fn-binsearch',
        description: 'Declares binarySearch function',
        explanation: 'Declares binarySearch function',
        rule: { kind: 'declaresFunction', name: 'binarySearch' },
      },
      {
        id: 'req-tests-binsearch',
        description: 'All unit test cases pass',
        explanation: 'All unit test cases pass',
        rule: { kind: 'allTestsPass' },
      },
    ],
    tests: [
      {
        id: 't-alg-1',
        name: 'Finds target in odd-length sorted array',
        call: 'binarySearch([10, 20, 30, 40, 50], 40)',
        expect: 3,
      },
      {
        id: 't-alg-2',
        name: 'Finds target at the first index (boundary)',
        call: 'binarySearch([5, 12, 19, 24], 5)',
        expect: 0,
      },
      {
        id: 't-alg-3',
        name: 'Returns -1 when target is absent',
        call: 'binarySearch([2, 4, 6, 8, 10], 7)',
        expect: -1,
      },
      {
        id: 't-alg-hidden-1',
        name: 'Finds target in large 1,000-element sorted array',
        call: '(() => { const arr = Array.from({ length: 1000 }, (_, i) => i * 2); return binarySearch(arr, 754); })()',
        expect: 377,
        hidden: true,
      },
    ],
  },
]
