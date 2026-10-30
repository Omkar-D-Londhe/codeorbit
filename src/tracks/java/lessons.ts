import type { Lesson } from '../../data/types'

export const javaLessons: Lesson[] = [
  {
    topicId: 'java-syntax-types',
    objective: 'Understand Java static typing, the class-based structure, primitive data types, and standard console output.',
    takeaways: [
      'Every Java application must be defined inside a class, with execution starting in the main method.',
      'Java is statically typed: every variable must be declared with an explicit type before use.',
      'Java provides 8 primitive types, including int (32-bit), double (64-bit IEEE 754), boolean (true/false), and char (16-bit Unicode).',
      'String is an immutable reference type, not a primitive.',
    ],
    terms: {
      staticTyping: {
        term: 'Static Typing',
        definition: 'A type system where variable types are checked at compile time and cannot change during execution.',
      },
      primitiveType: {
        term: 'Primitive Type',
        definition: 'A basic data type built directly into Java that stores its value directly in memory (e.g. int, double, boolean).',
      },
      immutability: {
        term: 'Immutability',
        definition: 'The property of an object whose state cannot be modified after it is constructed (e.g. Java String).',
      },
    },
    sections: [
      {
        id: 'java-class-entry',
        heading: 'Structure of a Java Program',
        body: [
          'In Java, all code resides inside classes. By convention, class names use PascalCase and match their filename.',
          'The entry point is always the public static void main(String[] args) method.',
        ],
        code: {
          label: 'Java Class Skeleton',
          code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Welcome to Java on CodeOrbit!");\n    }\n}`,
        },
      },
      {
        id: 'primitives-and-variables',
        heading: 'Variables and Primitive Types',
        body: [
          'Variables must be declared with their type before assignment:',
          '- int: 32-bit signed integer (-2^31 to 2^31-1)',
          '- double: 64-bit floating point number for decimals',
          '- boolean: true or false',
          '- char: 16-bit single Unicode character in single quotes (\'A\')',
        ],
        code: {
          label: 'Declaring Variables',
          code: `int score = 100;\ndouble rating = 4.95;\nboolean isActive = true;\nchar grade = 'A';`,
        },
      },
    ],
  },
  {
    topicId: 'java-control-flow',
    objective: 'Master branching logic with if-else and switch, and iterative execution using for and while loops.',
    takeaways: [
      'if, else if, and else statements evaluate boolean expressions to control conditional execution.',
      'for loops provide counter-driven iteration with initialization, condition, and update expressions.',
      'while loops repeatedly execute a block as long as their condition evaluates to true.',
      'Loop nesting multiplies execution counts, forming quadratic O(n^2) or polynomial asymptotic time complexity.',
    ],
    terms: {
      branching: {
        term: 'Conditional Branching',
        definition: 'Executing different blocks of code depending on whether a boolean expression evaluates to true or false.',
      },
      loopNesting: {
        term: 'Loop Nesting',
        definition: 'Placing one loop inside another, causing the inner loop to run completely for each iteration of the outer loop.',
      },
    },
    sections: [
      {
        id: 'conditionals',
        heading: 'Branching with if-else',
        body: [
          'Conditional statements direct program flow based on boolean expressions.',
        ],
        code: {
          label: 'Conditional Branching',
          code: `if (score >= 90) {\n    System.out.println("Grade: A");\n} else if (score >= 75) {\n    System.out.println("Grade: B");\n} else {\n    System.out.println("Grade: C");\n}`,
        },
      },
      {
        id: 'loops',
        heading: 'Iterating with for and while',
        body: [
          'for loops are ideal when the number of iterations is known in advance.',
          'while loops continue until a terminating boolean condition becomes false.',
        ],
        code: {
          label: 'Loop Examples',
          code: `for (int i = 0; i < 5; i++) {\n    System.out.println("Iteration: " + i);\n}\n\nint count = 3;\nwhile (count > 0) {\n    count--;\n}`,
        },
      },
    ],
  },
  {
    topicId: 'java-methods',
    objective: 'Declare modular methods with explicit parameter types, return values, and understand method overloading.',
    takeaways: [
      'Methods encapsulate reusable logic with explicit parameter lists and return types.',
      'Methods returning no value declare a void return type.',
      'Java passes all arguments by value: primitives pass a copy of the value, references pass a copy of the pointer.',
      'Method overloading allows multiple methods to share the same name if their parameter lists differ.',
    ],
    terms: {
      methodSignature: {
        term: 'Method Signature',
        definition: 'The combination of method name and parameter types that uniquely identifies a method in a class.',
      },
      passByValue: {
        term: 'Pass-by-Value',
        definition: 'The parameter passing mechanism where a copy of the argument value is passed into the method.',
      },
      overloading: {
        term: 'Method Overloading',
        definition: 'Defining multiple methods with the same name in the same class with different parameter lists.',
      },
    },
    sections: [
      {
        id: 'declaring-methods',
        heading: 'Declaring Methods',
        body: [
          'A method declaration specifies access modifier, return type, name, and parameter list.',
        ],
        code: {
          label: 'Method Declaration',
          code: `public static int add(int a, int b) {\n    return a + b;\n}\n\npublic static void greet(String name) {\n    System.out.println("Hello, " + name);\n}`,
        },
      },
    ],
  },
  {
    topicId: 'java-classes-oop',
    objective: 'Design encapsulated classes with private fields, public constructors, and accessor/mutator methods.',
    takeaways: [
      'Encapsulation hides internal state behind private access modifiers, exposing safe public methods.',
      'Constructors initialize new object instances and share the exact name of the class without a return type.',
      'The this keyword refers to the current object instance within constructors and member methods.',
    ],
    terms: {
      encapsulation: {
        term: 'Encapsulation',
        definition: 'Bundling data fields and methods operating on that data within a class while restricting direct access to internal state.',
      },
      constructor: {
        term: 'Constructor',
        definition: 'A special method invoked when instantiating an object using new, responsible for initializing member fields.',
      },
    },
    sections: [
      {
        id: 'class-encapsulation',
        heading: 'Creating an Encapsulated Class',
        body: [
          'Keep fields private and provide public getters and setters to control mutations.',
        ],
        code: {
          label: 'Encapsulated Java Class',
          code: `public class User {\n    private String username;\n    private int points;\n\n    public User(String username, int points) {\n        this.username = username;\n        this.points = points;\n    }\n\n    public String getUsername() {\n        return username;\n    }\n\n    public int getPoints() {\n        return points;\n    }\n}`,
        },
      },
    ],
  },
  {
    topicId: 'java-arrays-collections',
    objective: 'Work with fixed-size arrays and dynamic ArrayList collections in Java.',
    takeaways: [
      'Java arrays are fixed-length data structures allocated with square brackets (new int[10]).',
      'The length field returns the fixed size of an array.',
      'The enhanced for loop (for-each) provides clean iteration without manual index manipulation.',
      'java.util.ArrayList provides dynamic, resizable collections parameterized with generic types.',
    ],
    terms: {
      array: {
        term: 'Array',
        definition: 'A contiguous, fixed-size data structure storing elements of the same type indexed by zero-based integers.',
      },
      arrayList: {
        term: 'ArrayList',
        definition: 'A dynamic, resizable array implementation in java.util that automatically reallocates memory as items are added.',
      },
    },
    sections: [
      {
        id: 'arrays-and-iteration',
        heading: 'Arrays and Enhanced For Loop',
        body: [
          'Arrays have a fixed size defined at creation time.',
        ],
        code: {
          label: 'Working with Arrays',
          code: `int[] numbers = {10, 20, 30, 40};\nfor (int num : numbers) {\n    System.out.println(num);\n}`,
        },
      },
    ],
  },
  {
    topicId: 'java-recursion',
    objective: 'Understand recursive algorithms, identifying base cases, and tracing the call stack.',
    takeaways: [
      'A recursive method solves a problem by calling itself with smaller sub-problems.',
      'Every recursive method must have at least one base case that stops recursion without making further recursive calls.',
      'Without a base case, recursion continues until memory is exhausted, throwing a StackOverflowError.',
      'Linear recursion has O(n) call stack space, while binary branching recursion produces O(2^n) time complexity.',
    ],
    terms: {
      baseCase: {
        term: 'Base Case',
        definition: 'The termination condition in a recursive function that returns a direct result without further recursive calls.',
      },
      callStack: {
        term: 'Call Stack',
        definition: 'The execution stack frame memory allocated to track active method invocations and local variables.',
      },
    },
    sections: [
      {
        id: 'recursion-mechanics',
        heading: 'Anatomy of a Recursive Method',
        body: [
          'A recursive method must always test for its base case first.',
        ],
        code: {
          label: 'Factorial Example',
          code: `public static int factorial(int n) {\n    if (n <= 1) {\n        return 1; // Base case\n    }\n    return n * factorial(n - 1); // Recursive call\n}`,
        },
      },
    ],
  },
]
