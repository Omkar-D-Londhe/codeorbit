import type { Lesson } from '../../data/types'

export const cppLessons: Lesson[] = [
  {
    topicId: 'cpp-syntax-io',
    objective: 'Understand C++ compilation structure, standard library header inclusion, stream-based console I/O, and primitive types.',
    takeaways: [
      'C++ programs start execution in the main() function returning an integer status code (typically 0 for success).',
      'The #include <iostream> preprocessor directive provides access to standard I/O streams like std::cout and std::cin.',
      'Streams use insertion (<<) and extraction (>>) operators for formatted I/O.',
      'C++ provides strong static typing with fundamental types: int, double, float, bool, char, and auto type deduction.',
    ],
    terms: {
      preprocessor: {
        term: 'Preprocessor Directive',
        definition: 'Instructions processed before compilation begins, denoted by a leading hash symbol (e.g. #include, #define).',
      },
      streamIO: {
        term: 'Stream I/O',
        definition: 'Abstract sequence of bytes represented by std::istream and std::ostream for device-independent communication.',
      },
      namespaceStd: {
        term: 'Namespace std',
        definition: 'The standard C++ namespace encompassing all components of the ISO C++ standard library.',
      },
    },
    sections: [
      {
        id: 'cpp-structure',
        heading: 'Anatomy of a C++ Program',
        body: [
          'A minimal C++ program includes necessary header files, enters through main(), and streams output to std::cout.',
        ],
        code: {
          label: 'Hello World in C++',
          code: `#include <iostream>\n\nint main() {\n    std::cout << "Welcome to C++ on CodeOrbit!" << std::endl;\n    return 0;\n}`,
        },
      },
      {
        id: 'fundamental-types',
        heading: 'Variables and Fundamental Types',
        body: [
          'Variables must be declared with their type or auto for automatic type deduction by the compiler.',
        ],
        code: {
          label: 'Declaring Variables',
          code: `int count = 42;\ndouble price = 19.99;\nbool isAvailable = true;\nchar category = 'A';\nauto ratio = 3.14; // deduced as double`,
        },
      },
    ],
  },
  {
    topicId: 'cpp-control-flow',
    objective: 'Direct execution flow using conditionals, switch statements, and iterative for and while loops.',
    takeaways: [
      'Conditionals (if, else if, else) evaluate boolean expressions to select execution paths.',
      'for loops manage counter-driven iteration with initialization, condition check, and increment steps.',
      'while and do-while loops repeat blocks based on dynamic loop conditions.',
      'Nested loops multiply iteration counts, producing polynomial O(n^2) asymptotic runtime.',
    ],
    terms: {
      conditional: {
        term: 'Conditionals',
        definition: 'Statements directing program flow along distinct execution branches based on evaluated truth values.',
      },
      nestedLoop: {
        term: 'Nested Loop',
        definition: 'A loop placed within the body of another loop, executing its complete sequence for every cycle of the outer loop.',
      },
    },
    sections: [
      {
        id: 'branching-and-loops',
        heading: 'Control Flow Constructs',
        body: [
          'C++ supports standard C-style branching and loop constructs.',
        ],
        code: {
          label: 'Conditionals & Loops',
          code: `if (score >= 90) {\n    std::cout << "Grade A" << std::endl;\n}\n\nfor (int i = 0; i < 5; ++i) {\n    std::cout << i << " ";\n}`,
        },
      },
    ],
  },
  {
    topicId: 'cpp-functions-references',
    objective: 'Write modular C++ functions and understand the difference between pass-by-value and pass-by-reference (&).',
    takeaways: [
      'Functions encapsulate logic with declared parameter types and explicit return values.',
      'Pass-by-value copies the argument, preventing side-effects but incurring copy overhead for large structures.',
      'Pass-by-reference (&) creates an alias to the caller\'s variable, enabling direct mutation without copying.',
      'const references (const Type&) provide read-only efficiency without copying.',
    ],
    terms: {
      passByReference: {
        term: 'Pass-by-Reference',
        definition: 'Passing a reference alias (&) to an existing variable directly into a function rather than making a copy.',
      },
      constReference: {
        term: 'const Reference',
        definition: 'A reference qualified with const, guaranteeing the function will not mutate the caller\'s data.',
      },
    },
    sections: [
      {
        id: 'references-explained',
        heading: 'Pass-by-Value vs Pass-by-Reference',
        body: [
          'Using the & symbol in parameter declarations avoids expensive object copying.',
        ],
        code: {
          label: 'Pass-by-Reference Example',
          code: `void swap(int& a, int& b) {\n    int temp = a;\n    a = b;\n    b = temp;\n}\n\nvoid printString(const std::string& str) {\n    std::cout << str << std::endl;\n}`,
        },
      },
    ],
  },
  {
    topicId: 'cpp-pointers-memory',
    objective: 'Understand memory addresses, pointer syntax (* and &), dereferencing, and nullptr safety.',
    takeaways: [
      'A pointer is a variable storing the memory address of another variable.',
      'The address-of operator (&) retrieves the memory location of an identifier.',
      'The dereference operator (*) accesses or mutates the value stored at the pointer\'s address.',
      'nullptr is the type-safe C++11 literal representing a pointer that does not point to any valid object.',
    ],
    terms: {
      pointer: {
        term: 'Pointer',
        definition: 'A variable holding the hexadecimal memory address of another object.',
      },
      dereference: {
        term: 'Dereference',
        definition: 'Using the unary * operator on a pointer to read or write the value at the referenced memory address.',
      },
      nullptrLiteral: {
        term: 'nullptr',
        definition: 'The standard C++ type-safe null pointer constant replacing legacy NULL or 0.',
      },
    },
    sections: [
      {
        id: 'pointers-basics',
        heading: 'Working with Pointers',
        body: [
          'Always initialize pointers, either to a valid address or to nullptr.',
        ],
        code: {
          label: 'Pointers and Addresses',
          code: `int value = 42;\nint* ptr = &value; // ptr stores address of value\n\nstd::cout << *ptr; // dereferences to read 42\n*ptr = 100;        // mutates value directly\n\nint* emptyPtr = nullptr;`,
        },
      },
    ],
  },
  {
    topicId: 'cpp-classes-objects',
    objective: 'Design encapsulated classes using public and private access specifiers, constructors, and member methods.',
    takeaways: [
      'Classes bundle data members and member functions into user-defined types.',
      'private members are accessible only within the class; public members form the external interface.',
      'Constructors share the class name without a return type, executing automatically when objects are instantiated.',
      'Member initializer lists (: member(val)) initialize class fields before the constructor body executes.',
    ],
    terms: {
      accessSpecifier: {
        term: 'Access Specifier',
        definition: 'Keywords (public, private, protected) defining the visibility and accessibility of class members.',
      },
      constructorList: {
        term: 'Member Initializer List',
        definition: 'Syntax following constructor parameters using a colon to directly initialize member fields before entering the constructor body.',
      },
    },
    sections: [
      {
        id: 'class-structure',
        heading: 'Class Definition and Access Control',
        body: [
          'Encapsulate data under private: and expose safe operations under public:.',
        ],
        code: {
          label: 'C++ Class Example',
          code: `class Account {\nprivate:\n    int id;\n    double balance;\npublic:\n    Account(int id, double balance) : id(id), balance(balance) {}\n\n    double getBalance() const {\n        return balance;\n    }\n};`,
        },
      },
    ],
  },
  {
    topicId: 'cpp-recursion-stl',
    objective: 'Implement recursive algorithms and manipulate dynamic collections using std::vector.',
    takeaways: [
      'A recursive function solves problems by calling itself on strictly smaller instances.',
      'Every recursive function requires a non-recursive base case to prevent stack overflow.',
      'std::vector is the primary dynamic array container in the C++ Standard Template Library (STL).',
      'vector provides fast contiguous storage, dynamic resizing with push_back(), and size() tracking.',
    ],
    terms: {
      recursion: {
        term: 'Recursion',
        definition: 'A programming technique in which a function calls itself directly or indirectly to solve smaller sub-problems.',
      },
      stdVector: {
        term: 'std::vector',
        definition: 'The standard sequence container encapsulating dynamic contiguous array storage with automatic memory reallocation.',
      },
    },
    sections: [
      {
        id: 'vector-and-recursion',
        heading: 'Recursion and std::vector',
        body: [
          'Vectors handle dynamic sizing efficiently; recursion breaks complex problems into simpler cases.',
        ],
        code: {
          label: 'Recursion and Vector',
          code: `#include <vector>\n\nint sumRecursive(const std::vector<int>& vec, int index) {\n    if (index >= vec.size()) return 0; // Base case\n    return vec[index] + sumRecursive(vec, index + 1); // Recursive call\n}`,
        },
      },
    ],
  },
]
