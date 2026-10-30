import type { Challenge } from '../../data/types'

const STRUCTURE_CHECK_NOTICE = 'Structure check — your code is not run'

export const pythonChallenges: Challenge[] = [
  {
    id: 'py-ch-basics',
    topicId: 'py-basics',
    title: 'Format User Greeting with f-Strings',
    difficulty: 'beginner',
    prompt:
      'Define a function named format_greeting(name, count) with a docstring that returns a formatted greeting using an f-string: f"Hello, {name}! You have completed {count} challenges."',
    objective: 'Practice Python function definition, f-string interpolation, and docstrings.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-b1', name: 'Greeting for Ada (5 challenges)', call: 'format_greeting("Ada", 5)', expect: 'Hello, Ada! You have completed 5 challenges.' },
      { id: 't-b2', name: 'Greeting for Grace (0 challenges)', call: 'format_greeting("Grace", 0)', expect: 'Hello, Grace! You have completed 0 challenges.' },
    ],
    starterCode: `# Format User Greeting
# Define format_greeting(name, count) here
`,
    requirements: [
      {
        id: 'py-req-basics-fn',
        description: 'Define a function named format_greeting accepting two parameters (name, count).',
        explanation: 'Functions in Python are defined with def format_greeting(name, count):',
        rule: { kind: 'definesFunction', name: 'format_greeting', paramsCount: 2, returns: true },
      },
      {
        id: 'py-req-basics-fstring',
        description: 'Use an f-string interpolating both {name} and {count}.',
        explanation: 'f-strings format expressions inside curly brackets: f"Hello, {name}! ... {count}"',
        rule: { kind: 'pythonSourceMatches', pattern: /f["'][^"']*\{name\}[^"']*\{count\}[^"']*["']/ },
      },
      {
        id: 'py-req-basics-docstring',
        description: 'Include an explanatory docstring in the function.',
        explanation: 'Docstrings use triple quotes directly under the def header.',
        rule: { kind: 'usesConstruct', construct: 'docstring' },
      },
    ],
    hints: [
      'Think about how Python defines functions with def and delineates blocks using indentation.',
      'Remember that f-strings begin with the letter f immediately preceding the quote mark.',
      'Write def format_greeting(name, count): with """Docstring""" and return f"Hello, {name}! You have completed {count} challenges."',
    ],
    solutionCode: `def format_greeting(name, count):
    """Return a formatted greeting message using an f-string."""
    return f"Hello, {name}! You have completed {count} challenges."
`,
    solutionExplanation: [
      'Defined format_greeting(name, count) taking two positional parameters.',
      'Provided a descriptive docstring with triple quotes documenting behavior.',
      'Returned an f-string interpolating the learner name and challenge count.',
    ],
  },
  {
    topicId: 'py-control-flow',
    id: 'py-ch-control-flow',
    title: 'Classify Age Category with Branching',
    difficulty: 'beginner',
    prompt:
      'Define a function classify_age(age) that returns "child" if age < 13, "teen" if age < 20, and "adult" otherwise using if, elif, and else.',
    objective: 'Implement conditional branching using if, elif, and else blocks in Python.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-cf1', name: 'Age 10 returns "child"', call: 'classify_age(10)', expect: 'child' },
      { id: 't-cf2', name: 'Age 15 returns "teen"', call: 'classify_age(15)', expect: 'teen' },
      { id: 't-cf3', name: 'Age 25 returns "adult"', call: 'classify_age(25)', expect: 'adult' },
    ],
    starterCode: `# Classify age category
# Define classify_age(age) using if, elif, else
`,
    requirements: [
      {
        id: 'py-req-cf-fn',
        description: 'Define a function named classify_age accepting one parameter (age).',
        explanation: 'The function signature should be def classify_age(age):',
        rule: { kind: 'definesFunction', name: 'classify_age', paramsCount: 1, returns: true },
      },
      {
        id: 'py-req-cf-construct',
        description: 'Use complete if, elif, and else branching constructs.',
        explanation: 'Python uses if, elif, and else with colons to delineate decision branches.',
        rule: { kind: 'usesConstruct', construct: 'if-elif-else' },
      },
      {
        id: 'py-req-cf-categories',
        description: 'Return strings "child", "teen", and "adult".',
        explanation: 'Each branch must return the corresponding category label string.',
        rule: { kind: 'pythonSourceMatches', pattern: /"child"|"teen"|"adult"/ },
      },
    ],
    hints: [
      'Structure the checks in ascending order so that earlier branches filter lower age thresholds.',
      'Use if age < 13, then elif age < 20, and finally else for the remaining cases.',
      'Return "child" for age < 13, "teen" for age < 20, and "adult" in the else block.',
    ],
    solutionCode: `def classify_age(age):
    """Classify an age into category."""
    if age < 13:
        return "child"
    elif age < 20:
        return "teen"
    else:
        return "adult"
`,
    solutionExplanation: [
      'Defined classify_age(age) taking an integer age.',
      'Checked age < 13 first to isolate children.',
      'Used elif age < 20 to isolate teenagers without needing chained >= 13 logic.',
      'Used else to cleanly catch adults.',
    ],
  },
  {
    topicId: 'py-functions',
    id: 'py-ch-functions',
    title: 'Calculate Price with Default Arguments',
    difficulty: 'beginner',
    prompt:
      'Define a function calculate_total(price, tax_rate=0.05, discount=0.0) that calculates the discounted subtotal price * (1.0 - discount) and applies the tax rate.',
    objective: 'Create functions with optional parameters using default arguments.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-fn1', name: 'Default tax and discount on 100', call: 'round(calculate_total(100), 2)', expect: 105.0 },
      { id: 't-fn2', name: 'Custom tax (10%) and discount (10%) on 100', call: 'round(calculate_total(100, 0.1, 0.1), 2)', expect: 99.0 },
    ],
    starterCode: `# Calculate total with default arguments
# Define calculate_total(price, tax_rate=0.05, discount=0.0)
`,
    requirements: [
      {
        id: 'py-req-fn-def',
        description: 'Define calculate_total accepting price and default arguments tax_rate=0.05 and discount=0.0.',
        explanation: 'Parameters with defaults must follow non-default parameters.',
        rule: { kind: 'definesFunction', name: 'calculate_total', paramsCount: 3, returns: true },
      },
      {
        id: 'py-req-fn-defaults',
        description: 'Specify default argument values tax_rate=0.05 and discount=0.0.',
        explanation: 'Default arguments are written directly in the parameter list.',
        rule: { kind: 'pythonSourceMatches', pattern: /tax_rate\s*=\s*0\.05/ },
      },
      {
        id: 'py-req-fn-math',
        description: 'Calculate subtotal using discount and apply tax rate before returning.',
        explanation: 'Compute discounted subtotal then multiply by (1.0 + tax_rate).',
        rule: { kind: 'pythonSourceMatches', pattern: /1\.0\s*-\s*discount|1\s*-\s*discount/ },
      },
    ],
    hints: [
      'Default arguments in Python allow callers to omit optional arguments when invoking a function.',
      'Set tax_rate=0.05 and discount=0.0 in the def line after the required price parameter.',
      'Calculate subtotal = price * (1.0 - discount) and return subtotal * (1.0 + tax_rate).',
    ],
    solutionCode: `def calculate_total(price, tax_rate=0.05, discount=0.0):
    """Calculate total price after discount and tax."""
    subtotal = price * (1.0 - discount)
    return round(subtotal * (1.0 + tax_rate), 2)
`,
    solutionExplanation: [
      'Defined calculate_total with price as a required argument.',
      'Specified tax_rate=0.05 and discount=0.0 as sensible defaults.',
      'Computed discounted subtotal and applied tax before returning rounded result.',
    ],
  },
  {
    topicId: 'py-data-structures',
    id: 'py-ch-data-structures',
    title: 'Word Frequency Counter with Dictionaries',
    difficulty: 'intermediate',
    prompt:
      'Define a function get_word_frequencies(words) that iterates over a list of words and returns a dictionary mapping each word to its frequency count.',
    objective: 'Build key-value mappings using Python dictionaries and for loops.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-ds1', name: 'Word counts in fruit list', call: 'get_word_frequencies(["apple", "banana", "apple"])', expect: { apple: 2, banana: 1 } },
      { id: 't-ds2', name: 'Empty list returns empty dict', call: 'get_word_frequencies([])', expect: {} },
    ],
    starterCode: `# Build word frequencies
# Define get_word_frequencies(words)
`,
    requirements: [
      {
        id: 'py-req-ds-fn',
        description: 'Define get_word_frequencies(words) taking one parameter.',
        explanation: 'Function signature should be def get_word_frequencies(words):',
        rule: { kind: 'definesFunction', name: 'get_word_frequencies', paramsCount: 1, returns: true },
      },
      {
        id: 'py-req-ds-loop',
        description: 'Iterate over the input list using a for loop.',
        explanation: 'Use for word in words: to iterate across sequential elements.',
        rule: { kind: 'containsLoop', loopType: 'for' },
      },
      {
        id: 'py-req-ds-dict',
        description: 'Update dictionary counts using bracket indexing or .get().',
        explanation: 'Use counts[word] = counts.get(word, 0) + 1 to accumulate frequencies.',
        rule: { kind: 'pythonSourceMatches', pattern: /counts\[word\]|\.get\(word/ },
      },
    ],
    hints: [
      'Initialize an empty dictionary counts = {} before looping over the collection.',
      'Inside the loop, use counts.get(word, 0) to avoid KeyError when encountering new words.',
      'Write counts[word] = counts.get(word, 0) + 1 and return counts after the loop.',
    ],
    solutionCode: `def get_word_frequencies(words):
    """Count frequency of words in list."""
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts
`,
    solutionExplanation: [
      'Initialized empty dictionary counts = {}.',
      'Iterated through words using standard for loop.',
      'Incremented counts using .get(word, 0) for safe initial value handling.',
      'Returned the populated dictionary.',
    ],
  },
  {
    topicId: 'py-comprehensions',
    id: 'py-ch-comprehensions',
    title: 'Filter and Square with List Comprehensions',
    difficulty: 'intermediate',
    prompt:
      'Define a function filter_even_squares(numbers) that returns a list containing the squares of only the even numbers from numbers using a list comprehension with an if condition.',
    objective: 'Write concise, idiomatic list comprehensions with conditional filtering.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-comp1', name: 'Squares of even numbers 1..6', call: 'filter_even_squares([1, 2, 3, 4, 5, 6])', expect: [4, 16, 36] },
      { id: 't-comp2', name: 'All odd numbers return empty list', call: 'filter_even_squares([1, 3, 5])', expect: [] },
    ],
    starterCode: `# List comprehension practice
# Define filter_even_squares(numbers)
`,
    requirements: [
      {
        id: 'py-req-comp-fn',
        description: 'Define filter_even_squares(numbers) returning a list.',
        explanation: 'Signature should be def filter_even_squares(numbers):',
        rule: { kind: 'definesFunction', name: 'filter_even_squares', paramsCount: 1, returns: true },
      },
      {
        id: 'py-req-comp-syntax',
        description: 'Construct the result using a list comprehension ([... for ... in ...]).',
        explanation: 'Use list comprehension syntax [expr for item in iterable if condition].',
        rule: { kind: 'usesComprehension', comprehensionType: 'list' },
      },
      {
        id: 'py-req-comp-filter',
        description: 'Filter for even numbers using the modulo operator (% 2 == 0).',
        explanation: 'The condition clause at the end of the comprehension should verify n % 2 == 0.',
        rule: { kind: 'pythonSourceMatches', pattern: /%\s*2\s*==\s*0/ },
      },
    ],
    hints: [
      'A list comprehension combines transformation and filtering in square brackets [].',
      'The expression n ** 2 or n * n should be at the front, followed by for n in numbers if n % 2 == 0.',
      'Return [n ** 2 for n in numbers if n % 2 == 0].',
    ],
    solutionCode: `def filter_even_squares(numbers):
    """Return squares of even numbers using list comprehension."""
    return [n ** 2 for n in numbers if n % 2 == 0]
`,
    solutionExplanation: [
      'Used square brackets [] to create a new list.',
      'Applied power operator n ** 2 for squaring elements.',
      'Included if n % 2 == 0 condition to filter out odd numbers.',
    ],
  },
  {
    topicId: 'py-recursion',
    id: 'py-ch-recursion',
    title: 'Compute Integer Power Recursively',
    difficulty: 'intermediate',
    prompt:
      'Define a recursive function recursive_power(base, exp) that computes base raised to exp (for non-negative integers exp) by returning 1 when exp == 0 and base * recursive_power(base, exp - 1) otherwise.',
    objective: 'Implement recursive decomposition with explicit base cases.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-rec1', name: '2 raised to 3', call: 'recursive_power(2, 3)', expect: 8 },
      { id: 't-rec2', name: '5 raised to 0', call: 'recursive_power(5, 0)', expect: 1 },
      { id: 't-rec3', name: '3 raised to 4', call: 'recursive_power(3, 4)', expect: 81 },
    ],
    starterCode: `# Recursive power calculation
# Define recursive_power(base, exp)
`,
    requirements: [
      {
        id: 'py-req-rec-fn',
        description: 'Define recursive_power(base, exp) taking two parameters.',
        explanation: 'Signature should be def recursive_power(base, exp):',
        rule: { kind: 'definesFunction', name: 'recursive_power', paramsCount: 2, returns: true },
      },
      {
        id: 'py-req-rec-call',
        description: 'Call recursive_power recursively within the function body.',
        explanation: 'The recursive step must call recursive_power(base, exp - 1).',
        rule: { kind: 'usesRecursion', functionName: 'recursive_power' },
      },
      {
        id: 'py-req-rec-base',
        description: 'Handle base case where exp == 0 returning 1.',
        explanation: 'Any number raised to the 0th power is 1; this terminates the recursion.',
        rule: { kind: 'pythonSourceMatches', pattern: /exp\s*==\s*0/ },
      },
    ],
    hints: [
      'Recursion requires two components: a terminating base case and a recursive step.',
      'Check if exp == 0 first and return 1 immediately.',
      'In the general case, return base * recursive_power(base, exp - 1).',
    ],
    solutionCode: `def recursive_power(base, exp):
    """Compute base raised to exp recursively."""
    if exp == 0:
        return 1
    return base * recursive_power(base, exp - 1)
`,
    solutionExplanation: [
      'Implemented base case checking exp == 0 returning 1.',
      'Executed recursive step reducing exponent by 1 on each call frame.',
      'Combined return values multiplicatively down the call stack.',
    ],
  },
  {
    topicId: 'py-algorithms',
    id: 'py-ch-algorithms',
    title: 'Binary Search on Sorted Collections',
    difficulty: 'advanced',
    prompt:
      'Define binary_search(sorted_items, target) using an iterative while loop with low and high pointers that returns the index of target if found or -1 if not found.',
    objective: 'Implement logarithmic binary search maintaining loop invariants in Python.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-bs1', name: 'Find 7 in [1, 3, 5, 7, 9]', call: 'binary_search([1, 3, 5, 7, 9], 7)', expect: 3 },
      { id: 't-bs2', name: 'Search for missing 4 returns -1', call: 'binary_search([1, 3, 5, 7, 9], 4)', expect: -1 },
    ],
    starterCode: `# Iterative binary search
# Define binary_search(sorted_items, target)
`,
    requirements: [
      {
        id: 'py-req-bs-fn',
        description: 'Define binary_search(sorted_items, target) taking two parameters.',
        explanation: 'Signature should be def binary_search(sorted_items, target):',
        rule: { kind: 'definesFunction', name: 'binary_search', paramsCount: 2, returns: true },
      },
      {
        id: 'py-req-bs-loop',
        description: 'Use a while loop to iterate while low <= high.',
        explanation: 'Iterative binary search relies on while low <= high: to narrow the bounds.',
        rule: { kind: 'containsLoop', loopType: 'while' },
      },
      {
        id: 'py-req-bs-mid',
        description: 'Compute integer midpoint using floor division (// 2).',
        explanation: 'Floor division mid = (low + high) // 2 ensures an integer list index.',
        rule: { kind: 'pythonSourceMatches', pattern: /\/\/\s*2/ },
      },
    ],
    hints: [
      'Initialize low = 0 and high = len(sorted_items) - 1 before entering the loop.',
      'Inside while low <= high:, compute mid = (low + high) // 2 and compare sorted_items[mid] with target.',
      'Adjust low = mid + 1 or high = mid - 1 based on comparison, returning -1 after loop terminates.',
    ],
    solutionCode: `def binary_search(sorted_items, target):
    """Perform binary search on sorted items list."""
    low = 0
    high = len(sorted_items) - 1
    while low <= high:
        mid = (low + high) // 2
        if sorted_items[mid] == target:
            return mid
        elif sorted_items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
    solutionExplanation: [
      'Initialized boundary pointers low and high.',
      'Computed midpoint index using floor division (// 2).',
      'Halved search space on each iteration in O(log n) time.',
      'Returned -1 if target was not found in the collection.',
    ],
  },
  {
    topicId: 'py-testing-basics',
    id: 'py-ch-testing-basics',
    title: 'Defensive Division with Unit Assertions',
    difficulty: 'advanced',
    prompt:
      'Define safe_divide(a, b) that raises ValueError("Cannot divide by zero") if b == 0, and define a test function test_safe_divide() with at least 2 assert statements verifying division results.',
    objective: 'Implement defensive exception raising and unit assertion functions in Python.',
    notice: STRUCTURE_CHECK_NOTICE,
    tests: [
      { id: 't-sd1', name: 'Safe divide 10 by 2 is 5.0', call: 'safe_divide(10, 2)', expect: 5.0 },
      { id: 't-sd2', name: 'Safe divide 9 by 3 is 3.0', call: 'safe_divide(9, 3)', expect: 3.0 },
    ],
    starterCode: `# Defensive division and testing
# Define safe_divide(a, b) and test_safe_divide()
`,
    requirements: [
      {
        id: 'py-req-test-fn1',
        description: 'Define safe_divide(a, b) taking two parameters and returning division result.',
        explanation: 'Signature should be def safe_divide(a, b):',
        rule: { kind: 'definesFunction', name: 'safe_divide', paramsCount: 2, returns: true },
      },
      {
        id: 'py-req-test-raise',
        description: 'Raise ValueError defensively when divisor b == 0.',
        explanation: 'Use raise ValueError("...") when b is zero.',
        rule: { kind: 'pythonSourceMatches', pattern: /raise\s+ValueError/ },
      },
      {
        id: 'py-req-test-fn2',
        description: 'Define test_safe_divide() taking zero parameters.',
        explanation: 'Standard test function naming prefix: def test_safe_divide():',
        rule: { kind: 'definesFunction', name: 'test_safe_divide', paramsCount: 0 },
      },
      {
        id: 'py-req-test-assert',
        description: 'Use the assert statement inside test_safe_divide() to verify behavior.',
        explanation: 'Test functions assert expected return values from functions under test.',
        rule: { kind: 'usesConstruct', construct: 'assert' },
      },
    ],
    hints: [
      'Check if b == 0 before performing division, and raise ValueError("Cannot divide by zero").',
      'Define test_safe_divide(): with no arguments.',
      'Write assert safe_divide(10, 2) == 5.0 and assert safe_divide(9, 3) == 3.0 in test_safe_divide().',
    ],
    solutionCode: `def safe_divide(a, b):
    """Divide a by b safely, raising ValueError on zero."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b

def test_safe_divide():
    """Verify safe_divide behavior with assertions."""
    assert safe_divide(10, 2) == 5.0
    assert safe_divide(9, 3) == 3.0
`,
    solutionExplanation: [
      'Validated precondition b == 0 and raised ValueError defensively.',
      'Performed true division a / b returning floating point quotient.',
      'Authored test_safe_divide() adhering to standard discovery conventions.',
      'Utilized assert statements to verify invariants and unit correctness.',
    ],
  },
]
