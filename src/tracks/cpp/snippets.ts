export interface CppSnippet {
  id: string
  title: string
  category: string
  code: string
  description: string
}

export const CPP_SNIPPETS: CppSnippet[] = [
  {
    id: 'cpp-snip-io',
    title: 'Stream I/O Template',
    category: 'syntax',
    code: `#include <iostream>\n\nint main() {\n    std::cout << "Output: " << 42 << std::endl;\n    return 0;\n}`,
    description: 'Standard C++ console output with stream operators.',
  },
  {
    id: 'cpp-snip-ref-swap',
    title: 'Pass-by-Reference Swap',
    category: 'functions',
    code: `void swap(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}`,
    description: 'Zero-copy in-place parameter mutation via C++ reference aliases.',
  },
  {
    id: 'cpp-snip-vector-loop',
    title: 'Range-Based For Loop on Vector',
    category: 'stl',
    code: `#include <vector>\n\nstd::vector<int> numbers = {1, 2, 3};\nfor (const auto& num : numbers) {\n    std::cout << num << " ";\n}`,
    description: 'Safe range-for loop traversing a std::vector by const reference.',
  },
  {
    id: 'cpp-snip-ptr-check',
    title: 'Safe Pointer Dereference',
    category: 'memory',
    code: `if (ptr != nullptr) {\n    *ptr = 100;\n}`,
    description: 'Defensive nullptr check guarding against segmentation faults.',
  },
]
