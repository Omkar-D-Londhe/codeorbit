import type { Challenge } from '../../data/types'

const NOTICE = 'Structure check — your code is not run'

export const cppChallenges: Challenge[] = [
  {
    topicId: 'cpp-syntax-io',
    id: 'cpp-ch-syntax',
    title: 'Output to Standard Stream in C++',
    difficulty: 'beginner',
    prompt: 'Write a C++ program including <iostream> with a main function that outputs a greeting to std::cout.',
    objective: 'Practice basic C++ structure, header inclusion, and standard console stream output.',
    description: 'Write a C++ program including <iostream> with a main function that outputs a greeting to std::cout.',
    notice: NOTICE,
    starterCode: `// Missing iostream and main function
void unused() {}
`,
    solution: `#include <iostream>

int main() {
    std::cout << "Hello from C++ on CodeOrbit!" << std::endl;
    return 0;
}
`,
    solutionCode: `#include <iostream>

int main() {
    std::cout << "Hello from C++ on CodeOrbit!" << std::endl;
    return 0;
}
`,
    solutionExplanation: [
      'The <iostream> header provides standard stream I/O facilities including std::cout and std::endl.',
      'Every C++ executable begins execution in the global main function returning an integer exit status.',
    ],
    hints: [
      'Include the standard I/O library at the top using #include <iostream>.',
      'Declare the entry point function: int main().',
      'Use std::cout << "..." << std::endl; and return 0;.',
    ],
    requirements: [
      {
        id: 'cpp-req-iostream',
        description: 'Include the <iostream> standard header.',
        explanation: 'The <iostream> header is necessary for standard stream input/output.',
        rule: { kind: 'usesConstruct', construct: 'iostream' },
      },
      {
        id: 'cpp-req-main-fn',
        description: 'Define the main function.',
        explanation: 'Every C++ executable program requires an int main() entry point.',
        rule: { kind: 'definesFunction', name: 'main', returnType: 'int', paramsCount: 0 },
      },
      {
        id: 'cpp-req-cout',
        description: 'Stream output to std::cout.',
        explanation: 'std::cout stream operators format and emit console output.',
        rule: { kind: 'usesConstruct', construct: 'cout' },
      },
    ],
  },
  {
    topicId: 'cpp-control-flow',
    id: 'cpp-ch-flow',
    title: 'Conditional Branching and Iteration in C++',
    difficulty: 'beginner',
    prompt: 'Write a function named printEvens that loops through integers up to n and uses an if statement.',
    objective: 'Practice C++ loops and conditional branching.',
    description: 'Write a function named printEvens that loops through integers up to n and uses an if statement.',
    notice: NOTICE,
    starterCode: `#include <iostream>

void printEvens(int n) {
    // Missing loop and if condition
}
`,
    solution: `#include <iostream>

void printEvens(int n) {
    for (int i = 0; i <= n; i++) {
        if (i % 2 == 0) {
            std::cout << i << " ";
        }
    }
}
`,
    solutionCode: `#include <iostream>

void printEvens(int n) {
    for (int i = 0; i <= n; i++) {
        if (i % 2 == 0) {
            std::cout << i << " ";
        }
    }
}
`,
    solutionExplanation: [
      'for loops in C++ iterate with standard initialization, condition, and increment expressions.',
      'if conditions guard statements based on boolean expressions.',
    ],
    hints: [
      'Use a for loop: for (int i = 0; i <= n; i++).',
      'Inside the loop, write if (i % 2 == 0) to detect even numbers.',
      'Output each matching number.',
    ],
    requirements: [
      {
        id: 'cpp-req-flow-fn',
        description: 'Define the printEvens function.',
        explanation: 'Functions modularize iteration and display logic.',
        rule: { kind: 'definesFunction', name: 'printEvens', returnType: 'void', paramsCount: 1 },
      },
      {
        id: 'cpp-req-flow-loop',
        description: 'Include a for loop.',
        explanation: 'For loops iterate across bounded numeric ranges.',
        rule: { kind: 'containsLoop', loopType: 'for' },
      },
      {
        id: 'cpp-req-flow-if',
        description: 'Include an if conditional statement.',
        explanation: 'If branching checks evenness via modulo operations.',
        rule: { kind: 'usesConstruct', construct: 'if-else' },
      },
    ],
  },
  {
    topicId: 'cpp-functions-references',
    id: 'cpp-ch-functions',
    title: 'Pass-by-Reference Value Swap',
    difficulty: 'intermediate',
    prompt: 'Write a swapValues function taking two integer references (int& a, int& b) and swapping their values.',
    objective: 'Practice reference semantics and in-place argument mutation.',
    description: 'Write a swapValues function taking two integer references (int& a, int& b) and swapping their values.',
    notice: NOTICE,
    starterCode: `void swapValues(int a, int b) {
    // Missing reference parameters and swap logic
}
`,
    solution: `void swapValues(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}
`,
    solutionCode: `void swapValues(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}
`,
    solutionExplanation: [
      'Pass-by-reference allows functions to directly modify the caller arguments without copying memory.',
    ],
    hints: [
      'Declare the function signature: void swapValues(int& a, int& b).',
      'Store a in a temporary variable: int temp = a;.',
      'Assign a = b; and b = temp;.',
    ],
    requirements: [
      {
        id: 'cpp-req-swap-fn',
        description: 'Define the swapValues function.',
        explanation: 'Functions encapsulate reusable manipulation procedures.',
        rule: { kind: 'definesFunction', name: 'swapValues', returnType: 'void', paramsCount: 2 },
      },
      {
        id: 'cpp-req-ref-param',
        description: 'Use reference parameters (int&).',
        explanation: 'Reference parameters avoid copying and mutate original variables directly.',
        rule: { kind: 'usesPointerOrReference', usage: 'reference' },
      },
    ],
  },
  {
    topicId: 'cpp-pointers-memory',
    id: 'cpp-ch-pointers',
    title: 'Pointer Dereferencing and Memory Value Mutation',
    difficulty: 'intermediate',
    prompt: 'Write a function named resetToZero that accepts an integer pointer (int* ptr) and sets its dereferenced value to 0 if not null.',
    objective: 'Practice pointer parameters, null pointer checks, and pointer dereferencing.',
    description: 'Write a function named resetToZero that accepts an integer pointer (int* ptr) and sets its dereferenced value to 0 if not null.',
    notice: NOTICE,
    starterCode: `void resetToZero() {
    // Missing pointer parameter and dereferencing
}
`,
    solution: `void resetToZero(int* ptr) {
    if (ptr != nullptr) {
        *ptr = 0;
    }
}
`,
    solutionCode: `void resetToZero(int* ptr) {
    if (ptr != nullptr) {
        *ptr = 0;
    }
}
`,
    solutionExplanation: [
      'Pointers hold raw memory addresses. The dereference operator * accesses or mutates the value at that address.',
    ],
    hints: [
      'Declare void resetToZero(int* ptr).',
      'Check for nullptr before dereferencing: if (ptr != nullptr).',
      'Assign *ptr = 0;.',
    ],
    requirements: [
      {
        id: 'cpp-req-reset-fn',
        description: 'Define resetToZero accepting an integer pointer.',
        explanation: 'Pointer parameters pass memory addresses directly.',
        rule: { kind: 'definesFunction', name: 'resetToZero', returnType: 'void', paramsCount: 1 },
      },
      {
        id: 'cpp-req-pointer-param',
        description: 'Use a pointer parameter (int*).',
        explanation: 'Pointers store raw memory addresses.',
        rule: { kind: 'usesPointerOrReference', usage: 'pointer' },
      },
      {
        id: 'cpp-req-deref',
        description: 'Dereference pointer to assign zero (*ptr = 0).',
        explanation: 'The * operator dereferences the pointer to mutate the underlying value.',
        rule: { kind: 'cppSourceMatches', pattern: /\*ptr\s*=/ },
      },
    ],
  },
  {
    topicId: 'cpp-classes-objects',
    id: 'cpp-ch-classes',
    title: 'Define Point2D Class with Member Function',
    difficulty: 'intermediate',
    prompt: 'Create a class named Point2D with private coordinates (int x, y) and a public member function getX().',
    objective: 'Practice C++ class declarations, access specifiers, and member functions.',
    description: 'Create a class named Point2D with private coordinates (int x, y) and a public member function getX().',
    notice: NOTICE,
    starterCode: `// Missing Point2D class definition
`,
    solution: `class Point2D {
private:
    int x;
    int y;

public:
    Point2D(int xVal, int yVal) : x(xVal), y(yVal) {}

    int getX() const {
        return x;
    }
};
`,
    solutionCode: `class Point2D {
private:
    int x;
    int y;

public:
    Point2D(int xVal, int yVal) : x(xVal), y(yVal) {}

    int getX() const {
        return x;
    }
};
`,
    solutionExplanation: [
      'Classes encapsulate state with access specifiers private: and public: and constructor member initializers.',
    ],
    hints: [
      'Declare class Point2D { ... }; (remember the trailing semicolon).',
      'Add private: int x; int y;.',
      'Add public: int getX() const { return x; }.',
    ],
    requirements: [
      {
        id: 'cpp-req-class-point',
        description: 'Declare a class named Point2D.',
        explanation: 'Class encapsulates 2D spatial coordinate state.',
        rule: { kind: 'definesClass', name: 'Point2D' },
      },
      {
        id: 'cpp-req-getx-fn',
        description: 'Define member function getX.',
        explanation: 'Member functions provide accessors to encapsulated coordinates.',
        rule: { kind: 'definesFunction', name: 'getX', returnType: 'int', paramsCount: 0 },
      },
    ],
  },
  {
    topicId: 'cpp-recursion-stl',
    id: 'cpp-ch-stl',
    title: 'Recursive Fibonacci and STL Vector Container',
    difficulty: 'advanced',
    prompt: 'Write a recursive function named fibonacci and include the standard vector container header <vector>.',
    objective: 'Practice writing recursive algorithms and STL container inclusion in C++.',
    description: 'Write a recursive function named fibonacci and include the standard vector container header <vector>.',
    notice: NOTICE,
    starterCode: `// Missing vector header and recursive fibonacci
int fibonacci(int n) {
    return 0;
}
`,
    solution: `#include <vector>

int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}
`,
    solutionCode: `#include <vector>

int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}
`,
    solutionExplanation: [
      'Binary branching recursion decomposes the problem into fibonacci(n - 1) and fibonacci(n - 2) subproblems.',
    ],
    hints: [
      'Include #include <vector> at the top.',
      'Check base case: if (n <= 1) return n;.',
      'Return fibonacci(n - 1) + fibonacci(n - 2); in the recursive step.',
    ],
    requirements: [
      {
        id: 'cpp-req-vector-include',
        description: 'Include the <vector> header.',
        explanation: 'Standard template library containers require explicit header inclusion.',
        rule: { kind: 'usesConstruct', construct: 'vector' },
      },
      {
        id: 'cpp-req-fib-fn',
        description: 'Define the fibonacci function.',
        explanation: 'Fibonacci function returns integer sequence values.',
        rule: { kind: 'definesFunction', name: 'fibonacci', returnType: 'int', paramsCount: 1 },
      },
      {
        id: 'cpp-req-fib-rec',
        description: 'Use recursion by calling fibonacci.',
        explanation: 'Recursive calls solve self-similar subproblems.',
        rule: { kind: 'usesRecursion', functionName: 'fibonacci' },
      },
    ],
  },
]
