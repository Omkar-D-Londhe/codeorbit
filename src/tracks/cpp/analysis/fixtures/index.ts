export interface ComplexityFixture {
  id: string
  name: string
  code: string
  expectedTime: string
  expectedSpace: string
  expectedConfidence: 'medium' | 'low'
  isSupported: boolean
  description: string
}

export const CPP_FIXTURES: ComplexityFixture[] = [
  // Constant Time O(1)
  {
    id: 'cpp-c-arithmetic',
    name: 'Constant Arithmetic',
    code: `int compute(int a, int b) {\n    return (a + b) * 2;\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Basic arithmetic evaluation in constant time and space',
  },
  {
    id: 'cpp-c-field',
    name: 'Struct Member Access',
    code: `struct Point { int x, y; };\nint getX(const Point& p) {\n    return p.x;\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Direct struct field lookup via reference',
  },
  {
    id: 'cpp-c-min-max',
    name: 'Ternary Min/Max',
    code: `int maxVal(int a, int b) {\n    return a > b ? a : b;\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Constant conditional branching without loops',
  },
  {
    id: 'cpp-c-array-index',
    name: 'Vector/Array Indexing',
    code: `#include <vector>\nint getFirst(const std::vector<int>& vec) {\n    return vec[0];\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Direct subscript offset access',
  },

  // Linear Time O(n)
  {
    id: 'cpp-linear-for',
    name: 'Single For Loop',
    code: `int sumUp(int n) {\n    int total = 0;\n    for (int i = 0; i < n; i++) {\n        total += i;\n    }\n    return total;\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Single iteration counting up to n',
  },
  {
    id: 'cpp-linear-while',
    name: 'Single While Loop',
    code: `int countdownSum(int n) {\n    int sum = 0;\n    while (n > 0) {\n        sum += n;\n        n--;\n    }\n    return sum;\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Single decremental while loop',
  },
  {
    id: 'cpp-linear-vector-acc',
    name: 'Accumulator with Static Overhead',
    code: `#include <vector>\nint accumulate(const std::vector<int>& items) {\n    int res = 0;\n    for (size_t i = 0; i < items.size(); ++i) {\n        res += items[i];\n    }\n    return res;\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear traversal across container elements',
  },
  {
    id: 'cpp-linear-two-sequential',
    name: 'Sequential Loops',
    code: `int twoPasses(int n) {\n    int a = 0;\n    for (int i = 0; i < n; i++) { a++; }\n    for (int j = 0; j < n; j++) { a++; }\n    return a;\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Sequential non-nested linear passes dominate as O(n)',
  },

  // Logarithmic Time O(log n)
  {
    id: 'cpp-log-while-div2',
    name: 'While Loop Halving',
    code: `int logSteps(int n) {\n    int steps = 0;\n    while (n > 1) {\n        n /= 2;\n        steps++;\n    }\n    return steps;\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Repeated division by 2 in a while loop',
  },
  {
    id: 'cpp-log-for-div2',
    name: 'For Loop Halving',
    code: `int halvingFor(int n) {\n    int cnt = 0;\n    for (int i = n; i > 0; i /= 2) {\n        cnt++;\n    }\n    return cnt;\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'For loop step with division by 2',
  },
  {
    id: 'cpp-log-mult2',
    name: 'While Loop Doubling',
    code: `int doublingSteps(int n) {\n    int i = 1;\n    int steps = 0;\n    while (i < n) {\n        i *= 2;\n        steps++;\n    }\n    return steps;\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Repeated multiplication by 2 up to bound',
  },
  {
    id: 'cpp-log-binary-search',
    name: 'Binary Search Loop',
    code: `#include <vector>\nint bsearch(const std::vector<int>& arr, int target) {\n    int low = 0, high = (int)arr.size() - 1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (arr[mid] == target) return mid;\n        if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Divide-and-conquer search halving the interval',
  },

  // Quadratic Time O(n^2)
  {
    id: 'cpp-quad-nested-for',
    name: 'Nested For Loops',
    code: `int pairCount(int n) {\n    int pairs = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            pairs++;\n        }\n    }\n    return pairs;\n}`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Two nested loops iterating to n',
  },
  {
    id: 'cpp-quad-triangular',
    name: 'Triangular Loop',
    code: `int triangle(int n) {\n    int sum = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = i; j < n; j++) {\n            sum += j;\n        }\n    }\n    return sum;\n}`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Triangular loop structure evaluating to n(n+1)/2 = O(n^2)',
  },
  {
    id: 'cpp-quad-bubble-sort',
    name: 'Bubble Sort Structure',
    code: `#include <vector>\nvoid bubbleSort(std::vector<int>& a) {\n    int n = a.size();\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (a[j] > a[j + 1]) {\n                std::swap(a[j], a[j + 1]);\n            }\n        }\n    }\n}`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Nested bubble-pass loops yielding quadratic comparisons',
  },

  // Cubic Time O(n^3)
  {
    id: 'cpp-cubic-matrix-mult',
    name: 'Triple Nested Loop',
    code: `int tripleNested(int n) {\n    int ops = 0;\n    for (int i = 0; i < n; i++) {\n        for (int j = 0; j < n; j++) {\n            for (int k = 0; k < n; k++) {\n                ops++;\n            }\n        }\n    }\n    return ops;\n}`,
    expectedTime: 'O(n^3)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Three nested loops yielding O(n^3) operations',
  },

  // Linear Recursion O(n) time, O(n) space
  {
    id: 'cpp-linear-recursion',
    name: 'Recursive Factorial',
    code: `int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Single recursive call per frame',
  },
  {
    id: 'cpp-linear-rec-countdown',
    name: 'Recursive Countdown',
    code: `void countdown(int n) {\n    if (n <= 0) return;\n    countdown(n - 1);\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear recursion depth consuming O(n) call stack space',
  },

  // Branching Recursion O(2^n) time, O(n) space
  {
    id: 'cpp-branching-fibonacci',
    name: 'Recursive Fibonacci',
    code: `int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2);\n}`,
    expectedTime: 'O(2^n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Binary recursive branching with exponential growth',
  },
  {
    id: 'cpp-branching-tree',
    name: 'Binary Tree Traversal',
    code: `struct Node { int val; Node* left; Node* right; };\nint countNodes(Node* root) {\n    if (!root) return 0;\n    return 1 + countNodes(root->left) + countNodes(root->right);\n}`,
    expectedTime: 'O(2^n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Binary branching recursive structure',
  },

  // Linearithmic Time O(n log n)
  {
    id: 'cpp-nlogn-nested-halving',
    name: 'Loop with Halving Inner Loop',
    code: `int nLogN(int n) {\n    int count = 0;\n    for (int i = 0; i < n; i++) {\n        int j = n;\n        while (j > 1) {\n            j /= 2;\n            count++;\n        }\n    }\n    return count;\n}`,
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear outer loop enclosing a logarithmic inner loop',
  },

  // Unsupported or complex code
  {
    id: 'cpp-unsupported-asm',
    name: 'Inline Assembly Block',
    code: `int executeAsm(int val) {\n    __asm__ __volatile__("nop");\n    return val;\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    isSupported: false,
    description: 'Inline assembly cannot be statically analyzed via high-level AST rules',
  },
]
