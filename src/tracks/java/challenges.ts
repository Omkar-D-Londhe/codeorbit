import type { Challenge } from '../../data/types'

const NOTICE = 'Structure check — your code is not run'

export const javaChallenges: Challenge[] = [
  {
    topicId: 'java-syntax-types',
    id: 'java-ch-syntax',
    title: 'Declare a Java Application Class with Primitive Variables',
    difficulty: 'beginner',
    prompt: 'Declare a class named Greeter with a main method declaring an integer variable named age and printing a greeting using System.out.println.',
    objective: 'Practice declaring a basic Java class, entry point method, and primitive variables.',
    description: 'Declare a class named Greeter with a main method declaring an integer variable named age and printing a greeting using System.out.println.',
    notice: NOTICE,
    starterCode: `// Java Practice Challenge
public class Incomplete {
    // Missing main method and variables
}
`,
    solution: `public class Greeter {
    public static void main(String[] args) {
        int age = 21;
        System.out.println("Hello, Age: " + age);
    }
}
`,
    solutionCode: `public class Greeter {
    public static void main(String[] args) {
        int age = 21;
        System.out.println("Hello, Age: " + age);
    }
}
`,
    solutionExplanation: [
      'In Java, all applications are defined in a class matching the filename.',
      'The entry point must be public static void main(String[] args).',
    ],
    hints: [
      'Remember that class names in Java must match PascalCase conventions and contain member methods.',
      'Declare a main method with signature: public static void main(String[] args).',
      'Inside main, declare an int variable (e.g. int age = 21;) and output via System.out.println.',
    ],
    requirements: [
      {
        id: 'java-req-class-greeter',
        description: 'Define a class named Greeter.',
        explanation: 'Java application code must be enclosed in a class definition.',
        rule: { kind: 'definesClass', name: 'Greeter' },
      },
      {
        id: 'java-req-main-method',
        description: 'Declare the standard public static void main method.',
        explanation: 'Execution begins at the public static void main(String[] args) entry point.',
        rule: { kind: 'definesMethod', name: 'main', isStatic: true, returnType: 'void', paramsCount: 1 },
      },
      {
        id: 'java-req-int-var',
        description: 'Declare an int variable named age.',
        explanation: 'Java requires explicit primitive type declarations before assigning variables.',
        rule: { kind: 'javaSourceMatches', pattern: /\bint\s+age\s*=/ },
      },
    ],
  },
  {
    topicId: 'java-control-flow',
    id: 'java-ch-flow',
    title: 'Categorize Scores and Count Multiples with Loops',
    difficulty: 'beginner',
    prompt: 'Create a class named LoopEvaluator with a for loop and an if-else statement to check numbers.',
    objective: 'Practice using Java loops and conditional statements.',
    description: 'Create a class named LoopEvaluator with a for loop and an if-else statement to check numbers.',
    notice: NOTICE,
    starterCode: `public class LoopEvaluator {
    // Missing loop and conditional structure
}
`,
    solution: `public class LoopEvaluator {
    public static void evaluate() {
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                System.out.println("Even: " + i);
            } else {
                System.out.println("Odd: " + i);
            }
        }
    }
}
`,
    solutionCode: `public class LoopEvaluator {
    public static void evaluate() {
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                System.out.println("Even: " + i);
            } else {
                System.out.println("Odd: " + i);
            }
        }
    }
}
`,
    solutionExplanation: [
      'A standard for loop iterates from 1 to 10 with i++ step.',
      'An if-else branch checks even numbers via the modulo operator % 2.',
    ],
    hints: [
      'Define a method inside LoopEvaluator to enclose your logic.',
      'Write a standard for loop iterating from index 1 to 10.',
      'Use an if (condition) { ... } else { ... } block inside the loop body.',
    ],
    requirements: [
      {
        id: 'java-req-flow-class',
        description: 'Declare a class named LoopEvaluator.',
        explanation: 'All logic must reside within the LoopEvaluator class.',
        rule: { kind: 'definesClass', name: 'LoopEvaluator' },
      },
      {
        id: 'java-req-flow-loop',
        description: 'Include a for loop.',
        explanation: 'For loops iterate across bounded numeric ranges.',
        rule: { kind: 'containsLoop', loopType: 'for' },
      },
      {
        id: 'java-req-flow-branch',
        description: 'Include an if-else conditional construct.',
        explanation: 'If-else branching enables decision paths based on conditions.',
        rule: { kind: 'usesConstruct', construct: 'if-else' },
      },
    ],
  },
  {
    topicId: 'java-methods',
    id: 'java-ch-methods',
    title: 'Implement Modular Math Methods with Overloading',
    difficulty: 'intermediate',
    prompt: 'Declare a class named MathUtils containing two overloaded add methods: one for adding two integers, and one for adding three integers.',
    objective: 'Practice method definition, return types, parameter lists, and method overloading.',
    description: 'Declare a class named MathUtils containing two overloaded add methods: one for adding two integers, and one for adding three integers.',
    notice: NOTICE,
    starterCode: `public class MathUtils {
    // Missing overloaded add methods
}
`,
    solution: `public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
    }

    public static int add(int a, int b, int c) {
        return a + b + c;
    }
}
`,
    solutionCode: `public class MathUtils {
    public static int add(int a, int b) {
        return a + b;
    }

    public static int add(int a, int b, int c) {
        return a + b + c;
    }
}
`,
    solutionExplanation: [
      'Method overloading requires identical method names with differing parameter counts or parameter types.',
    ],
    hints: [
      'Define a public static int add(int a, int b) method that returns the sum of both parameters.',
      'Define a second add method with three int parameters.',
      'Verify that both methods return int values.',
    ],
    requirements: [
      {
        id: 'java-req-math-class',
        description: 'Declare a class named MathUtils.',
        explanation: 'All overloaded methods belong inside the MathUtils class.',
        rule: { kind: 'definesClass', name: 'MathUtils' },
      },
      {
        id: 'java-req-add-two',
        description: 'Define an add method accepting two int parameters.',
        explanation: 'The binary overload sums two integer inputs.',
        rule: { kind: 'definesMethod', name: 'add', returnType: 'int', paramsCount: 2 },
      },
      {
        id: 'java-req-add-three',
        description: 'Define an overloaded add method accepting three int parameters.',
        explanation: 'The ternary overload demonstrates method overloading with three parameters.',
        rule: { kind: 'definesMethod', name: 'add', returnType: 'int', paramsCount: 3 },
      },
    ],
  },
  {
    topicId: 'java-classes-oop',
    id: 'java-ch-oop',
    title: 'Model Encapsulated BankAccount Class',
    difficulty: 'intermediate',
    prompt: 'Model a BankAccount class with a private balance field, a constructor initializing balance, and a public getBalance method.',
    objective: 'Practice object-oriented encapsulation, private fields, and constructors.',
    description: 'Model a BankAccount class with a private balance field, a constructor initializing balance, and a public getBalance method.',
    notice: NOTICE,
    starterCode: `public class BankAccount {
    // Missing private field, constructor and getter
}
`,
    solution: `public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {
        return this.balance;
    }
}
`,
    solutionCode: `public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {
        return this.balance;
    }
}
`,
    solutionExplanation: [
      'Encapsulation hides internal state with private visibility modifiers and provides controlled accessors.',
    ],
    hints: [
      'Declare private double balance; at the top of the class body.',
      'Write a public constructor public BankAccount(double initialBalance) that assigns this.balance.',
      'Add a public double getBalance() getter method returning balance.',
    ],
    requirements: [
      {
        id: 'java-req-oop-class',
        description: 'Declare a class named BankAccount.',
        explanation: 'BankAccount encapsulates account state.',
        rule: { kind: 'definesClass', name: 'BankAccount' },
      },
      {
        id: 'java-req-private-field',
        description: 'Declare a private balance field.',
        explanation: 'Private access specifiers protect internal fields from external direct mutation.',
        rule: { kind: 'usesConstruct', construct: 'private-field' },
      },
      {
        id: 'java-req-getter',
        description: 'Declare a public getBalance method returning double.',
        explanation: 'Public getter methods provide controlled read access to private state.',
        rule: { kind: 'definesMethod', name: 'getBalance', returnType: 'double', paramsCount: 0 },
      },
    ],
  },
  {
    topicId: 'java-arrays-collections',
    id: 'java-ch-collections',
    title: 'Accumulate List Elements with Enhanced For-Loop',
    difficulty: 'intermediate',
    prompt: 'Create a class named ListProcessor with an enhanced for-loop (for (int num : list)) to sum all elements.',
    objective: 'Practice using Java Collections and the enhanced for-loop.',
    description: 'Create a class named ListProcessor with an enhanced for-loop (for (int num : list)) to sum all elements.',
    notice: NOTICE,
    starterCode: `import java.util.List;

public class ListProcessor {
    // Missing sumList method and enhanced for loop
}
`,
    solution: `import java.util.List;

public class ListProcessor {
    public static int sumList(List<Integer> numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return total;
    }
}
`,
    solutionCode: `import java.util.List;

public class ListProcessor {
    public static int sumList(List<Integer> numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return total;
    }
}
`,
    solutionExplanation: [
      'The enhanced for-loop provides clean idiomatic iteration over Iterable collections in Java.',
    ],
    hints: [
      'Import java.util.List at the top.',
      'Declare public static int sumList(List<Integer> numbers).',
      'Use for (int num : numbers) { total += num; } to accumulate values.',
    ],
    requirements: [
      {
        id: 'java-req-proc-class',
        description: 'Declare a class named ListProcessor.',
        explanation: 'ListProcessor encapsulates the collection accumulation logic.',
        rule: { kind: 'definesClass', name: 'ListProcessor' },
      },
      {
        id: 'java-req-sum-method',
        description: 'Define sumList method accepting List<Integer>.',
        explanation: 'sumList processes generic Java collection types.',
        rule: { kind: 'definesMethod', name: 'sumList', returnType: 'int', paramsCount: 1 },
      },
      {
        id: 'java-req-enhanced-for',
        description: 'Iterate using an enhanced for-loop.',
        explanation: 'Enhanced for-loops offer clean syntax for traversing collections.',
        rule: { kind: 'usesConstruct', construct: 'enhanced-for' },
      },
    ],
  },
  {
    topicId: 'java-recursion',
    id: 'java-ch-recursion',
    title: 'Compute Factorial with Base Case and Recursive Call',
    difficulty: 'advanced',
    prompt: 'Create a class named FactorialCalculator with a recursive factorial method implementing base case n <= 1.',
    objective: 'Practice writing recursive algorithms with base conditions in Java.',
    description: 'Create a class named FactorialCalculator with a recursive factorial method implementing base case n <= 1.',
    notice: NOTICE,
    starterCode: `public class FactorialCalculator {
    // Missing recursive factorial method
}
`,
    solution: `public class FactorialCalculator {
    public static long factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
}
`,
    solutionCode: `public class FactorialCalculator {
    public static long factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
}
`,
    solutionExplanation: [
      'Recursion requires a base condition to terminate stack frames and recursive self-invocation for smaller problem sizes.',
    ],
    hints: [
      'Declare public static long factorial(int n).',
      'Handle base case: if (n <= 1) return 1;.',
      'Return n * factorial(n - 1); in the recursive step.',
    ],
    requirements: [
      {
        id: 'java-req-fact-class',
        description: 'Declare a class named FactorialCalculator.',
        explanation: 'FactorialCalculator holds the recursive algorithm.',
        rule: { kind: 'definesClass', name: 'FactorialCalculator' },
      },
      {
        id: 'java-req-fact-method',
        description: 'Define a factorial method returning long.',
        explanation: 'Factorial returns large integer values represented by long.',
        rule: { kind: 'definesMethod', name: 'factorial', returnType: 'long', paramsCount: 1 },
      },
      {
        id: 'java-req-fact-rec',
        description: 'Use recursion by invoking factorial recursively.',
        explanation: 'Recursive self-invocation solves the subproblem factorial(n - 1).',
        rule: { kind: 'usesRecursion', methodName: 'factorial' },
      },
    ],
  },
]
