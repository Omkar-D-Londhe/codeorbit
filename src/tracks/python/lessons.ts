import type { Lesson } from '../../data/types'

export const pythonLessons: Lesson[] = [
  {
    topicId: 'py-basics',
    objective: 'Understand indentation-based syntax, dynamic typing in Python 3, primitive types, and f-string interpolation.',
    takeaways: [
      'Python uses whitespace indentation (typically 4 spaces) instead of curly braces to define scope and blocks.',
      'Variables in Python are dynamically typed references; types are bound to values rather than variable names.',
      'f-strings (prefixed with f"...") evaluate expressions directly inside replacement fields within curly brackets.',
      'Comments start with # and span until the end of the line; multiline docstrings use triple quotes.',
    ],
    terms: {
      dynamicTyping: {
        term: 'Dynamic Typing',
        definition: 'A typing system where variable types are resolved at runtime and variables can be rebound to different types.',
      },
      fstring: {
        term: 'f-string',
        definition: 'Formatted string literal introduced in Python 3.6 that evaluates embedded expressions inside {expr} at runtime.',
      },
      docstring: {
        term: 'Docstring',
        definition: 'A string literal occurring as the first statement in a module, function, or class used for documentation.',
      },
      typeInference: {
        term: 'Type Inference',
        definition: 'The interpreter automatically determining the type of an expression without explicit type declarations.',
      },
    },
    sections: [
      {
        id: 'syntax-and-indentation',
        heading: 'Indentation and Readability',
        body: [
          'Python prioritizes code readability above all else. Unlike languages that use curly braces or closing tags, Python strictly uses whitespace indentation to define blocks of code.',
          'The official style guide, PEP 8, prescribes exactly 4 spaces per indentation level. Mixing tabs and spaces results in an IndentationError.',
        ],
        code: {
          label: 'Indentation Example',
          code: `def greet(name):\n    if name:\n        print(f"Hello, {name}!")\n    else:\n        print("Hello, World!")`,
        },
      },
      {
        id: 'primitive-types',
        heading: 'Core Built-In Types',
        body: [
          'Python provides rich built-in primitive types:',
          '- int: Arbitrary-precision integers (42, -1000, 10**100)',
          '- float: IEEE 754 double-precision floating-point numbers (3.14159)',
          '- str: Immutable Unicode text sequences ("CodeOrbit", \'Python 3\')',
          '- bool: Boolean values (True and False, capitalized)',
        ],
      },
      {
        id: 'f-strings',
        heading: 'Formatted String Literals',
        body: [
          'Formatted string literals (f-strings) provide concise, readable string interpolation.',
          'Inside replacement brackets {}, you can evaluate arithmetic, method calls, or format specifiers like {value:.2f}.',
        ],
        code: {
          label: 'f-String Formatting',
          code: `user = "Ada"\npoints = 120\nprint(f"Learner {user} earned {points} XP!")`,
        },
      },
    ],
    demos: [
      {
        id: 'demo-py-basics',
        title: 'Interactive Python Basics',
        files: [
          {
            name: 'basics.py',
            content: `# Python 3 Basics Demo\nname = "Orbit Explorer"\nlevel = 4\nxp = 450.5\n\nsummary = f"Student: {name} | Level: {level} | Score: {xp:.1f} XP"\nprint(summary)\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-control-flow',
    objective: 'Structure branching logic using if, elif, and else statements and write clean guard clauses.',
    takeaways: [
      'Python uses elif instead of else if for multi-way branching.',
      'Comparison operators can be chained naturally, such as 0 <= x < 100.',
      'Short-circuit evaluation means and stops on the first False, while or stops on the first True.',
      'Guard clauses handle edge cases early with an immediate return, keeping happy-path code unindented.',
    ],
    terms: {
      guardClause: {
        term: 'Guard Clause',
        definition: 'A conditional check placed at the start of a function that returns or exits early when preconditions fail.',
      },
      shortCircuit: {
        term: 'Short-Circuit Evaluation',
        definition: 'The evaluation of a logical expression where the second operand is only executed if the first does not determine the outcome.',
      },
      truthyFalsy: {
        term: 'Truthy / Falsy',
        definition: 'Values that evaluate to True or False in a Boolean context. Zero, None, and empty collections are falsy.',
      },
    },
    sections: [
      {
        id: 'branching-statements',
        heading: 'Branching with if, elif, and else',
        body: [
          'Python uses if, elif, and else followed by colons to direct execution.',
          'Elif provides clean sequential evaluation without nesting multiple else blocks.',
        ],
        code: {
          label: 'Branching Structure',
          code: `def evaluate_score(score):\n    if score >= 90:\n        return "A"\n    elif score >= 80:\n        return "B"\n    elif score >= 70:\n        return "C"\n    else:\n        return "Review"`,
        },
      },
      {
        id: 'guard-clauses',
        heading: 'Guard Clauses and Cyclomatic Simplicity',
        body: [
          'Deeply nested conditionals increase cognitive load and bug surface.',
          'Use guard clauses to exit early whenever invalid or boundary conditions occur.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-control-flow',
        title: 'Branching and Chained Comparisons',
        files: [
          {
            name: 'control.py',
            content: `def check_status(score):\n    if 90 <= score <= 100:\n        return "Mastery"\n    elif 70 <= score < 90:\n        return "Proficient"\n    else:\n        return "Needs Practice"\n\nprint(check_status(85))\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-functions',
    objective: 'Define modular functions with default arguments and understand lexical scope rules.',
    takeaways: [
      'Functions are first-class citizens in Python and can be passed as arguments or returned from other functions.',
      'Default arguments are evaluated once at function definition time; avoid mutable defaults like [] or {}.',
      'Python resolves variable names using the LEGB rule: Local, Enclosing, Global, and Built-in.',
      'Functions should document their inputs, outputs, and side effects using docstrings.',
    ],
    terms: {
      legb: {
        term: 'LEGB Rule',
        definition: 'The name resolution lookup order in Python: Local scope, Enclosing scope, Global scope, then Built-in scope.',
      },
      defaultArg: {
        term: 'Default Argument',
        definition: 'A parameter that assumes a fallback value if omitted during function invocation.',
      },
      pureFunction: {
        term: 'Pure Function',
        definition: 'A function whose return value depends only on its arguments and causes no observable side effects.',
      },
    },
    sections: [
      {
        id: 'function-anatomy',
        heading: 'Function Definition and Return Values',
        body: [
          'Functions are defined with def and end execution with an explicit return.',
          'If no return statement is reached, Python implicitly returns None.',
        ],
        code: {
          label: 'Function Definition',
          code: `def calculate_area(width: float, height: float) -> float:\n    """Calculate rectangle area."""\n    return width * height`,
        },
      },
      {
        id: 'default-arg-trap',
        heading: 'The Mutable Default Argument Trap',
        body: [
          'In Python, default arguments are created once when the function definition is executed, not on each call.',
          'Always use None as a sentinel default for mutable collections like lists and dicts.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-functions',
        title: 'Functions with Default Parameters',
        files: [
          {
            name: 'functions.py',
            content: `def format_currency(amount, currency="$", decimals=2):\n    formatted = f"{amount:.{decimals}f}"\n    return f"{currency}{formatted}"\n\nprint(format_currency(42.5))\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-data-structures',
    objective: 'Select appropriate collections (lists, tuples, dicts, sets) for efficient access and modification.',
    takeaways: [
      'Lists are mutable ordered sequences ([1, 2, 3]); tuples are immutable ordered sequences ((1, 2, 3)).',
      'Dictionaries map hashable keys to arbitrary values with average O(1) key lookup.',
      'Sets store unique unordered elements with average O(1) membership testing via the in operator.',
      'Use the .get() method on dictionaries to provide safe default values without raising KeyError.',
    ],
    terms: {
      hashTable: {
        term: 'Hash Table',
        definition: 'An underlying data structure used by dicts and sets that computes array indices from keys for O(1) lookups.',
      },
      mutability: {
        term: 'Mutability',
        definition: 'The ability of an object to modify its internal state in-place after initial instantiation.',
      },
      hashable: {
        term: 'Hashable',
        definition: 'An object with a fixed hash value that never changes during its lifetime, suitable as a dict key or set member.',
      },
    },
    sections: [
      {
        id: 'lists-and-tuples',
        heading: 'Lists vs Tuples',
        body: [
          'Lists are dynamic arrays that support indexing, slicing, appending, and sorting.',
          'Tuples are immutable and frequently used as coordinates or fixed records.',
        ],
        code: {
          label: 'Collection Creation',
          code: `coordinates = (10, 20)\ntags = ["python", "learning"]\ntags.append("orbit")`,
        },
      },
      {
        id: 'dicts-and-sets',
        heading: 'Dictionaries and Sets',
        body: [
          'Dictionaries and sets provide constant-time average access through hashing.',
          'Dictionaries associate unique keys with values; sets guarantee item uniqueness.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-collections',
        title: 'Collection Manipulation',
        files: [
          {
            name: 'collections.py',
            content: `inventory = ["apple", "banana", "apple"]\ncounts = {}\nfor item in inventory:\n    counts[item] = counts.get(item, 0) + 1\nprint(counts)\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-comprehensions',
    objective: 'Author idiomatic list, dictionary, and set comprehensions for clean data transformation.',
    takeaways: [
      'List comprehensions replace verbose map() and filter() loops with clean, expressive syntax.',
      'Dictionary comprehensions construct key-value mappings in a single readable line.',
      'Set comprehensions automatically filter out duplicates during transformation.',
      'Generator expressions use parentheses () and evaluate lazily on-demand, saving memory on large streams.',
    ],
    terms: {
      listComp: {
        term: 'List Comprehension',
        definition: 'A compact syntactic construct for creating a new list by transforming and filtering elements of an iterable.',
      },
      genExp: {
        term: 'Generator Expression',
        definition: 'An iterator created with comprehension syntax that yields items lazily on demand without allocating an array.',
      },
      lazyEval: {
        term: 'Lazy Evaluation',
        definition: 'An execution strategy that delays expression computation until its value is strictly required.',
      },
    },
    sections: [
      {
        id: 'list-comprehensions',
        heading: 'Transforming and Filtering Lists',
        body: [
          'A list comprehension follows the syntax [expression for item in iterable if condition].',
          'This provides both transformation and filtering in a readable expression.',
        ],
        code: {
          label: 'List Comprehension',
          code: `numbers = [1, 2, 3, 4, 5, 6]\neven_squares = [n ** 2 for n in numbers if n % 2 == 0]`,
        },
      },
      {
        id: 'dict-and-set-comp',
        heading: 'Dictionary and Set Comprehensions',
        body: [
          'Dictionary comprehensions construct key-value pairs using curly braces: {k: v for k, v in pairs}.',
          'Set comprehensions use curly braces without colons and deduplicate items automatically.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-comp',
        title: 'Comprehensions in Practice',
        files: [
          {
            name: 'comprehensions.py',
            content: `raw_scores = [45, 88, 92, 58, 76, 95]\npassing = [s for s in raw_scores if s >= 70]\nprint("Passing scores:", passing)\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-recursion',
    objective: 'Implement recursive decomposition with explicit base cases and recursive steps.',
    takeaways: [
      'Every recursive function requires a base case to terminate execution without blowing the call stack.',
      'Each recursive call creates a new stack frame storing local variables and return addresses.',
      'Python enforces a default recursion limit (usually 1000) to protect against stack overflows.',
      'Divide-and-conquer divides a problem into smaller subproblems, solves them recursively, and combines results.',
    ],
    terms: {
      baseCase: {
        term: 'Base Case',
        definition: 'The conditional branch in a recursive function that terminates recursion without making further recursive calls.',
      },
      callStack: {
        term: 'Call Stack',
        definition: 'A stack memory structure that tracks active subroutines and local execution state in the interpreter.',
      },
      recursionLimit: {
        term: 'Recursion Limit',
        definition: 'A maximum call frame limit set by Python (sys.getrecursionlimit()) to prevent system stack overflow.',
      },
    },
    sections: [
      {
        id: 'anatomy-of-recursion',
        heading: 'Base Cases and Decomposition',
        body: [
          'A recursive function calls itself with a strictly smaller problem instance.',
          'Omitting the base case or failing to decrease input size leads to a RecursionError.',
        ],
        code: {
          label: 'Factorial Recursion',
          code: `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)`,
        },
      },
      {
        id: 'divide-and-conquer',
        heading: 'Divide and Conquer Strategies',
        body: [
          'Divide and conquer divides the input in halves, as in binary search or merge sort.',
          'Subproblem results are combined to yield the final solution.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-recursion',
        title: 'Recursive Power Calculation',
        files: [
          {
            name: 'recursion.py',
            content: `def power(base, exp):\n    if exp == 0:\n        return 1\n    return base * power(base, exp - 1)\n\nprint("2^6 =", power(2, 6))\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-algorithms',
    objective: 'Implement linear search and iterative binary search while understanding asymptotic scaling.',
    takeaways: [
      'Linear search operates in O(n) time on unsorted data.',
      'Binary search achieves O(log n) time by halving search space, requiring pre-sorted input.',
      'Integer division in Python (//) computes exact floor midpoints without overflow issues.',
      'Two pointers moving towards each other can solve pair-sum problems in linear time on sorted collections.',
    ],
    terms: {
      binarySearch: {
        term: 'Binary Search',
        definition: 'A search algorithm that repeatedly halves a sorted search interval until the target is located or eliminated.',
      },
      twoPointers: {
        term: 'Two Pointers',
        definition: 'An algorithmic technique that uses two index references to traverse collections from opposite ends or at differing speeds.',
      },
      floorDiv: {
        term: 'Floor Division',
        definition: 'The // operator in Python that divides numbers and rounds down to the nearest integer.',
      },
    },
    sections: [
      {
        id: 'binary-search-implementation',
        heading: 'Iterative Binary Search',
        body: [
          'Binary search requires sorted items. It maintains two index pointers, low and high.',
          'On each step, the search interval is halved.',
        ],
        code: {
          label: 'Binary Search',
          code: `def binary_search(items, target):\n    low, high = 0, len(items) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if items[mid] == target:\n            return mid\n        elif items[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
        },
      },
      {
        id: 'complexity-tradeoffs',
        heading: 'Scalability Comparison',
        body: [
          'For 1,000,000 items, linear search requires up to 1,000,000 comparisons, whereas binary search takes at most 20 comparisons.',
          'Algorithmic efficiency is critical for software scalability.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-algorithms',
        title: 'Binary Search Step-by-Step',
        files: [
          {
            name: 'search.py',
            content: `data = [1, 4, 7, 12, 19, 25, 33]\nprint("Found 19 at index:", data.index(19))\n`,
          },
        ],
      },
    ],
  },
  {
    topicId: 'py-testing-basics',
    objective: 'Write defensive assertions using assert, validate arguments, and structure test functions.',
    takeaways: [
      'The assert statement validates conditions and raises AssertionError if the condition evaluates to False.',
      'Defensive code raises explicit exceptions like ValueError or TypeError with descriptive error messages.',
      'Python testing frameworks (pytest, unittest) automatically discover functions prefixed with test_.',
      'Testing functions should isolate units of behavior, verify positive cases, and verify boundary error conditions.',
    ],
    terms: {
      assertion: {
        term: 'Assertion',
        definition: 'A boolean statement in code that tests whether an invariant remains true during execution.',
      },
      valueError: {
        term: 'ValueError',
        definition: 'A built-in exception raised when an operation receives an argument with the right type but inappropriate value.',
      },
      defensiveCoding: {
        term: 'Defensive Programming',
        definition: 'A design practice aimed at continuing function operation despite unanticipated inputs by validating preconditions early.',
      },
    },
    sections: [
      {
        id: 'assert-statements',
        heading: 'Validating Invariants with assert',
        body: [
          'The assert keyword tests assumptions during development.',
          'If an assertion fails, Python halts execution and outputs an AssertionError.',
        ],
        code: {
          label: 'Test Assertions',
          code: `def test_addition():\n    assert 2 + 2 == 4\n    assert sum([1, 2, 3]) == 6`,
        },
      },
      {
        id: 'raising-exceptions',
        heading: 'Raising Explicit Exceptions',
        body: [
          'When input preconditions fail, raise standard exceptions rather than producing incorrect results or crashing silently.',
          'Standard exception types include ValueError, TypeError, and KeyError.',
        ],
      },
    ],
    demos: [
      {
        id: 'demo-py-testing',
        title: 'Unit Assertion Patterns',
        files: [
          {
            name: 'test_demo.py',
            content: `def add(a, b):\n    return a + b\n\ndef test_add():\n    assert add(2, 3) == 5\n\ntest_add()\nprint("Passed!")\n`,
          },
        ],
      },
    ],
  },
]
