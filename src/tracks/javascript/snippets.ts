/**
 * JavaScript Snippet Library (Stage 23a).
 * Pre-authored patterns for insertion into the editor.
 */

export interface Snippet {
  id: string
  title: string
  description: string
  code: string
}

export const JS_SNIPPETS: Snippet[] = [
  {
    id: 'snip-js-debounce',
    title: 'Debounce Function',
    description: 'Delays invoking function until after wait milliseconds have elapsed since the last time it was called.',
    code: `function debounce(fn, delayMs = 250) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delayMs);
  };
}`,
  },
  {
    id: 'snip-js-safe-storage',
    title: 'Safe Storage Cache',
    description: 'Reads and writes to localStorage with JSON serialization and try-catch safety against quota limits.',
    code: `const safeStorage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};`,
  },
  {
    id: 'snip-js-deep-clone',
    title: 'Structured Deep Clone',
    description: 'Recursively clones complex objects and arrays using native structuredClone or fallback.',
    code: `function deepClone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}`,
  },
  {
    id: 'snip-js-event-delegation',
    title: 'Event Delegation Helper',
    description: 'Attaches a delegated event listener that triggers callback only when target matches selector.',
    code: `function on(parent, eventType, selector, callback) {
  parent.addEventListener(eventType, (e) => {
    const target = e.target.closest(selector);
    if (target && parent.contains(target)) {
      callback.call(target, e, target);
    }
  });
}`,
  },
  {
    id: 'snip-js-binary-search',
    title: 'Binary Search Algorithm',
    description: 'Logarithmic search locating target index in a sorted array in O(log n) time.',
    code: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
  },
]
