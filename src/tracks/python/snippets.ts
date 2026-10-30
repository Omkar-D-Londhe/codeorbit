export interface PythonSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
}

export const PYTHON_SNIPPETS: PythonSnippet[] = [
  {
    id: 'snip-py-fstring',
    title: 'Formatted String Interpolation',
    description: 'Modern f-string with numeric formatting, padding, and embedded expressions.',
    language: 'python',
    code: `name = "Ada"
score = 98.654
rank = 1

# Format float to 2 decimal places and pad rank with leading zeros
summary = f"Student: {name:<10} | Score: {score:.2f}% | Rank: #{rank:03d}"
print(summary)
`,
  },
  {
    id: 'snip-py-dict-frequency',
    title: 'Frequency Counter with Dictionary',
    description: 'Clean O(n) item frequency accumulator using dict.get() fallback.',
    language: 'python',
    code: `def frequency_counter(items):
    counts = {}
    for item in items:
        counts[item] = counts.get(item, 0) + 1
    return counts

words = ["orbit", "python", "code", "orbit", "code", "orbit"]
print(frequency_counter(words))
# Output: {'orbit': 3, 'python': 1, 'code': 2}
`,
  },
  {
    id: 'snip-py-list-comp',
    title: 'Filtered List Comprehension',
    description: 'Transforming and filtering sequential collections in a single idiomatic line.',
    language: 'python',
    code: `raw_data = [12, -4, 0, 19, 8, -2, 15, 22]

# Keep positive even numbers and compute their squares
processed = [x ** 2 for x in raw_data if x > 0 and x % 2 == 0]
print(processed)
# Output: [144, 64, 484]
`,
  },
  {
    id: 'snip-py-binary-search',
    title: 'Iterative Binary Search',
    description: 'O(log n) search on a sorted collection using integer floor division.',
    language: 'python',
    code: `def binary_search(sorted_items, target):
    low = 0
    high = len(sorted_items) - 1

    while low <= high:
        mid = (low + high) // 2
        current = sorted_items[mid]
        if current == target:
            return mid
        elif current < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1

numbers = [3, 9, 14, 21, 33, 45, 57, 68, 89]
print("Index of 33:", binary_search(numbers, 33))  # 4
print("Index of 99:", binary_search(numbers, 99))  # -1
`,
  },
  {
    id: 'snip-py-safe-divide',
    title: 'Defensive Exception Raising',
    description: 'Precondition validation and explicit exception raising pattern.',
    language: 'python',
    code: `def safe_divide(numerator: float, denominator: float) -> float:
    """Divide two numbers defensively, guarding against division by zero."""
    if denominator == 0:
        raise ValueError("Cannot divide by zero")
    return numerator / denominator

try:
    result = safe_divide(100, 4)
    print("Result:", result)
except ValueError as err:
    print("Error:", err)
`,
  },
]
