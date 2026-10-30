/**
 * Labelled Fixture Suite for JavaScript Complexity Analysis (Stage 23b, PLT-08).
 * Contains >= 30 labelled functions with expected complexity classes,
 * confidence expectations, and limitation flags.
 */

export interface ComplexityFixture {
  id: string
  name: string
  code: string
  expectedTime: string
  expectedSpace: string
  expectedConfidence: 'high' | 'medium' | 'low'
  isSupported: boolean
  description: string
  hasLimitation?: boolean
}

export const FIXTURES: ComplexityFixture[] = [
  // 1. Constant Time O(1)
  {
    id: 'c-arithmetic',
    name: 'Constant Arithmetic',
    code: `function add(a, b) {
      return (a + b) * 2;
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Basic arithmetic evaluation in constant time and space',
  },
  {
    id: 'c-property',
    name: 'Object Property Access',
    code: `function getName(user) {
      return user && user.profile ? user.profile.name : null;
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Direct field lookups in constant time',
  },
  {
    id: 'c-array-index',
    name: 'Array Index Lookup',
    code: `function getFirst(arr) {
      return arr.length > 0 ? arr[0] : undefined;
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Indexed memory lookup in O(1)',
  },
  {
    id: 'c-swap',
    name: 'In-Place Swap',
    code: `function swap(arr, i, j) {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Three-point swap in constant time and auxiliary space',
  },
  {
    id: 'c-map-get',
    name: 'Map Hash Lookup',
    code: `function getCached(map, key) {
      return map.get(key);
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Average O(1) hash map key lookup',
  },
  {
    id: 'c-set-has',
    name: 'Set Membership Check',
    code: `function isMember(set, item) {
      return set.has(item);
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Average O(1) set membership check',
  },

  // 2. Logarithmic Time O(log n)
  {
    id: 'log-binary-search',
    name: 'Iterative Binary Search',
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
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Classic binary search halving search space on each iteration',
  },
  {
    id: 'log-halving-loop',
    name: 'Count Halving While Loop',
    code: `function countDivisions(n) {
      let count = 0;
      let val = n;
      while (val > 1) {
        val = Math.floor(val / 2);
        count++;
      }
      return count;
    }`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Loop halving candidate variable on every step',
  },

  // 3. Linear Time O(n)
  {
    id: 'lin-for-sum',
    name: 'Single For Loop Sum',
    code: `function sumArray(arr) {
      let total = 0;
      for (let i = 0; i < arr.length; i++) {
        total += arr[i];
      }
      return total;
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Single iteration over array length with constant auxiliary space',
  },
  {
    id: 'lin-for-of',
    name: 'For-Of Element Iteration',
    code: `function maxElement(arr) {
      let max = -Infinity;
      for (const x of arr) {
        if (x > max) max = x;
      }
      return max;
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'for...of loop iterating over n items',
  },
  {
    id: 'lin-while',
    name: 'Linear While Loop',
    code: `function findFirstPositive(arr) {
      let i = 0;
      while (i < arr.length) {
        if (arr[i] > 0) return i;
        i++;
      }
      return -1;
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'While loop incrementing counter up to array length',
  },
  {
    id: 'lin-includes',
    name: 'Array Includes Method',
    code: `function containsValue(arr, val) {
      return arr.includes(val);
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Built-in linear search using includes()',
  },
  {
    id: 'lin-indexof',
    name: 'Array IndexOf Method',
    code: `function findIndex(arr, val) {
      return arr.indexOf(val);
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Built-in linear search using indexOf()',
  },
  {
    id: 'lin-map',
    name: 'Array Map Transformation',
    code: `function doubleValues(arr) {
      return arr.map((x) => x * 2);
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear map allocating a new array of size n',
  },
  {
    id: 'lin-filter',
    name: 'Array Filter Extraction',
    code: `function filterEvens(arr) {
      return arr.filter((x) => x % 2 === 0);
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear filter allocating up to n elements',
  },
  {
    id: 'lin-reduce',
    name: 'Array Reduce Accumulator',
    code: `function sumWithReduce(arr) {
      return arr.reduce((acc, x) => acc + x, 0);
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear reduction with constant accumulator',
  },
  {
    id: 'lin-slice',
    name: 'Array Slice Copy',
    code: `function copyPrefix(arr) {
      return arr.slice(0, Math.floor(arr.length / 2));
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Linear slice allocating a subarray',
  },
  {
    id: 'lin-find',
    name: 'Array Find Predicate',
    code: `function findAdmin(users) {
      return users.find((u) => u.role === 'admin');
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear scan via find predicate',
  },

  // 4. Linearithmic Time O(n log n)
  {
    id: 'nlogn-sort',
    name: 'Built-in Array Sort',
    code: `function sortNumbers(arr) {
      return arr.slice().sort((a, b) => a - b);
    }`,
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Built-in TimSort/merge sort running in O(n log n)',
  },
  {
    id: 'nlogn-merge-sort',
    name: 'Custom Merge Sort',
    code: `function mergeSort(arr) {
      if (arr.length <= 1) return arr;
      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid));
      const right = mergeSort(arr.slice(mid));
      const merged = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) merged.push(left[i++]);
        else merged.push(right[j++]);
      }
      return merged.concat(left.slice(i)).concat(right.slice(j));
    }`,
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Divide-and-conquer merge sort halving and merging',
  },

  // 5. Quadratic Time O(n^2)
  {
    id: 'quad-nested-for',
    name: 'Nested For Loops',
    code: `function countPairs(arr) {
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          count++;
        }
      }
      return count;
    }`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Standard nested loop over n * n elements',
  },
  {
    id: 'quad-loop-includes',
    name: 'Loop with Nested Array Includes',
    code: `function findCommonElements(a, b) {
      const common = [];
      for (const item of a) {
        if (b.includes(item)) {
          common.push(item);
        }
      }
      return common;
    }`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Outer loop multiplied by inner linear includes() scan',
  },
  {
    id: 'quad-bubble-sort',
    name: 'Bubble Sort',
    code: `function bubbleSort(arr) {
      const n = arr.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
          }
        }
      }
      return arr;
    }`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Nested loops comparing adjacent elements in O(n^2)',
  },
  {
    id: 'quad-triangle-loop',
    name: 'Triangular Nested Loops',
    code: `function printPairs(arr) {
      const pairs = [];
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          pairs.push([arr[i], arr[j]]);
        }
      }
      return pairs;
    }`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'n(n-1)/2 pairs in quadratic time',
  },
  {
    id: 'quad-loop-indexof',
    name: 'Deduplication with Nested IndexOf',
    code: `function removeDuplicates(arr) {
      const unique = [];
      for (let i = 0; i < arr.length; i++) {
        if (unique.indexOf(arr[i]) === -1) {
          unique.push(arr[i]);
        }
      }
      return unique;
    }`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Loop with inner indexOf scan over growing array',
  },

  // 6. Cubic Time O(n^3)
  {
    id: 'cubic-triple-loop',
    name: 'Triple Nested For Loops',
    code: `function countTriplets(arr) {
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
          for (let k = 0; k < arr.length; k++) {
            count++;
          }
        }
      }
      return count;
    }`,
    expectedTime: 'O(n^3)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Three nested loops over array length',
  },

  // 7. Exponential Time O(2^n)
  {
    id: 'exp-fibonacci',
    name: 'Naive Recursive Fibonacci',
    code: `function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }`,
    expectedTime: 'O(2^n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Binary recursion tree with 2 branches per step',
  },

  // 8. Recursive Linear O(n)
  {
    id: 'lin-recursive-fact',
    name: 'Recursive Factorial',
    code: `function factorial(n) {
      if (n <= 1) return 1;
      return n * factorial(n - 1);
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'high',
    isSupported: true,
    description: 'Single branch recursion taking n stack frames',
  },

  // 9. Memoized Linear O(n)
  {
    id: 'lin-memoized-fib',
    name: 'Memoized Fibonacci with Map',
    code: `function memoFib(n, memo = new Map()) {
      if (n <= 1) return n;
      if (memo.has(n)) return memo.get(n);
      const res = memoFib(n - 1, memo) + memoFib(n - 2, memo);
      memo.set(n, res);
      return res;
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear recursion with cached intermediate states',
  },

  // 10. Unsupported / Dynamic / Low Confidence Constructs (Never silently wrong!)
  {
    id: 'unsupported-eval',
    name: 'Dynamic Eval Invocation',
    code: `function dynamicExec(str) {
      return eval(str);
    }`,
    expectedTime: 'O(1)', // Fallback reported with low confidence and limitation
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    isSupported: false,
    hasLimitation: true,
    description: 'Dynamic eval cannot be statically modeled; must report low confidence',
  },
  {
    id: 'unsupported-callback',
    name: 'Higher-Order Function with Unknown Callback',
    code: `function runCustom(items, callback) {
      for (const item of items) {
        callback(item);
      }
    }`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    hasLimitation: true,
    description: 'External callback complexity cannot be fully proven statically',
  },
  {
    id: 'unsupported-async',
    name: 'Asynchronous Promise Flow',
    code: `async function fetchData(url) {
      const res = await get(url);
      return res.data;
    }`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    isSupported: false,
    hasLimitation: true,
    description: 'Async execution and event loop delays cannot be modeled as Big-O',
  },
]
