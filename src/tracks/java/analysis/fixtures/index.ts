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

export const JAVA_FIXTURES: ComplexityFixture[] = [
  // Constant Time O(1)
  {
    id: 'java-c-arithmetic',
    name: 'Constant Arithmetic',
    code: `public class Test {\n    public static int add(int a, int b) {\n        return (a + b) * 2;\n    }\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Basic arithmetic evaluation in constant time and space',
  },
  {
    id: 'java-c-field',
    name: 'Field Access',
    code: `public class Test {\n    public static int getId(User u) {\n        return u.id;\n    }\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Direct object field lookup',
  },
  {
    id: 'java-c-min-max',
    name: 'Ternary Min/Max',
    code: `public class Test {\n    public static int max(int a, int b) {\n        return a > b ? a : b;\n    }\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Constant branching without loops',
  },
  {
    id: 'java-c-array-index',
    name: 'Array Indexing',
    code: `public class Test {\n    public static int getFirst(int[] arr) {\n        return arr[0];\n    }\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Direct array offset access',
  },

  // Linear Time O(n)
  {
    id: 'java-linear-for',
    name: 'Single For Loop',
    code: `public class Test {\n    public static int sum(int n) {\n        int total = 0;\n        for (int i = 0; i < n; i++) {\n            total += i;\n        }\n        return total;\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Standard single for loop iterating n times',
  },
  {
    id: 'java-linear-while',
    name: 'Single While Loop',
    code: `public class Test {\n    public static int count(int n) {\n        int i = 0;\n        while (i < n) {\n            i++;\n        }\n        return i;\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Standard single while loop iterating n times',
  },
  {
    id: 'java-linear-enhanced-for',
    name: 'Enhanced For Loop',
    code: `public class Test {\n    public static int sumAll(int[] items) {\n        int total = 0;\n        for (int x : items) {\n            total += x;\n        }\n        return total;\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Enhanced for-each loop over elements',
  },
  {
    id: 'java-linear-find',
    name: 'Linear Search with Break',
    code: `public class Test {\n    public static boolean contains(int[] arr, int target) {\n        for (int i = 0; i < arr.length; i++) {\n            if (arr[i] == target) return true;\n        }\n        return false;\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear search with worst-case O(n)',
  },
  {
    id: 'java-linear-alloc',
    name: 'Linear Space Allocation',
    code: `public class Test {\n    public static int[] duplicate(int n) {\n        int[] result = new int[n];\n        for (int i = 0; i < n; i++) {\n            result[i] = i;\n        }\n        return result;\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear array allocation requiring O(n) auxiliary space',
  },

  // Logarithmic Time O(log n)
  {
    id: 'java-log-halving-while',
    name: 'Halving While Loop',
    code: `public class Test {\n    public static int divideSteps(int n) {\n        int steps = 0;\n        while (n > 1) {\n            n /= 2;\n            steps++;\n        }\n        return steps;\n    }\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Halving loop with logarithmic steps',
  },
  {
    id: 'java-log-doubling-for',
    name: 'Doubling For Loop',
    code: `public class Test {\n    public static int doubleSteps(int n) {\n        int count = 0;\n        for (int i = 1; i < n; i *= 2) {\n            count++;\n        }\n        return count;\n    }\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'For loop with multiplicative step',
  },
  {
    id: 'java-log-binary-search',
    name: 'Iterative Binary Search',
    code: `public class Test {\n    public static int binarySearch(int[] arr, int key) {\n        int low = 0, high = arr.length - 1;\n        while (low <= high) {\n            int mid = (low + high) / 2;\n            if (arr[mid] == key) return mid;\n            if (arr[mid] < key) low = mid + 1;\n            else high = mid - 1;\n        }\n        return -1;\n    }\n}`,
    expectedTime: 'O(log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Classic binary search algorithm',
  },

  // Quadratic Time O(n^2)
  {
    id: 'java-quadratic-nested-for',
    name: 'Nested For Loops',
    code: `public class Test {\n    public static int pairSum(int n) {\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                count += i + j;\n            }\n        }\n        return count;\n    }\n}`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Double nested loops producing O(n^2) operations',
  },
  {
    id: 'java-quadratic-bubble-sort',
    name: 'Bubble Sort Structure',
    code: `public class Test {\n    public static void sort(int[] a) {\n        for (int i = 0; i < a.length; i++) {\n            for (int j = 0; j < a.length - 1; j++) {\n                if (a[j] > a[j + 1]) {\n                    int temp = a[j];\n                    a[j] = a[j + 1];\n                    a[j + 1] = temp;\n                }\n            }\n        }\n    }\n}`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Quadratic bubble sort pattern',
  },
  {
    id: 'java-quadratic-matrix-sum',
    name: 'Matrix Grid Traversal',
    code: `public class Test {\n    public static int sumMatrix(int[][] grid, int n) {\n        int sum = 0;\n        for (int r = 0; r < n; r++) {\n            for (int c = 0; c < n; c++) {\n                sum += grid[r][c];\n            }\n        }\n        return sum;\n    }\n}`,
    expectedTime: 'O(n^2)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Iterating through n x n grid elements',
  },

  // Cubic Time O(n^3)
  {
    id: 'java-cubic-triple-loop',
    name: 'Triple Nested Loops',
    code: `public class Test {\n    public static int tripleCount(int n) {\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                for (int k = 0; k < n; k++) {\n                    count++;\n                }\n            }\n        }\n        return count;\n    }\n}`,
    expectedTime: 'O(n^3)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Three nested loops yielding O(n^3) operations',
  },

  // Linear Recursion O(n) time, O(n) space
  {
    id: 'java-linear-recursion',
    name: 'Recursive Factorial',
    code: `public class Test {\n    public static int factorial(int n) {\n        if (n <= 1) return 1;\n        return n * factorial(n - 1);\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Single recursive call per frame',
  },
  {
    id: 'java-linear-rec-countdown',
    name: 'Recursive Countdown',
    code: `public class Test {\n    public static void countdown(int n) {\n        if (n <= 0) return;\n        countdown(n - 1);\n    }\n}`,
    expectedTime: 'O(n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear recursion depth consuming O(n) call stack space',
  },

  // Branching Recursion O(2^n) time, O(n) space
  {
    id: 'java-branching-fibonacci',
    name: 'Recursive Fibonacci',
    code: `public class Test {\n    public static int fib(int n) {\n        if (n <= 1) return n;\n        return fib(n - 1) + fib(n - 2);\n    }\n}`,
    expectedTime: 'O(2^n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Binary recursive branching with exponential growth',
  },
  {
    id: 'java-branching-tree',
    name: 'Binary Tree Traversal',
    code: `public class Test {\n    public static int countNodes(TreeNode node) {\n        if (node == null) return 0;\n        return 1 + countNodes(node.left) + countNodes(node.right);\n    }\n}`,
    expectedTime: 'O(2^n)',
    expectedSpace: 'O(n)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Binary branching recursive structure',
  },

  // Linearithmic Time O(n log n)
  {
    id: 'java-nlogn-nested-halving',
    name: 'Loop with Halving Inner Loop',
    code: `public class Test {\n    public static int nLogN(int n) {\n        int count = 0;\n        for (int i = 0; i < n; i++) {\n            int j = n;\n            while (j > 1) {\n                j /= 2;\n                count++;\n            }\n        }\n        return count;\n    }\n}`,
    expectedTime: 'O(n log n)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'medium',
    isSupported: true,
    description: 'Linear outer loop enclosing a logarithmic inner loop',
  },

  // Unsupported or complex code
  {
    id: 'java-unsupported-reflection',
    name: 'Unstructured Reflection Call',
    code: `public class Test {\n    public static void runReflection() throws Exception {\n        Class<?> c = Class.forName("java.lang.String");\n        c.getDeclaredMethods();\n    }\n}`,
    expectedTime: 'O(1)',
    expectedSpace: 'O(1)',
    expectedConfidence: 'low',
    isSupported: false,
    description: 'Reflective operations cannot be statically modeled by token analysis',
  },
]
