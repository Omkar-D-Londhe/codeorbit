import type { Topic, TopicGroup } from '../../data/types'

export const JAVA_TECH_ID = 'java'

export const javaGroups: TopicGroup[] = [
  { id: 'java-foundations', title: 'Foundations' },
  { id: 'java-control', title: 'Control Flow & Methods' },
  { id: 'java-oop', title: 'Object-Oriented Programming' },
  { id: 'java-data-structures', title: 'Data Structures & Algorithms' },
]

export const javaTopics: Topic[] = [
  {
    id: 'java-syntax-types',
    technologyId: JAVA_TECH_ID,
    title: 'Java Syntax, Primitive Types & Variables',
    shortTitle: 'Syntax & Types',
    groupId: 'java-foundations',
    description: 'Strong static typing, primitives (int, double, boolean, char), String immutability, and basic operations.',
    prerequisiteIds: [],
    tags: ['java', 'types', 'variables', 'syntax'],
  },
  {
    id: 'java-control-flow',
    technologyId: JAVA_TECH_ID,
    title: 'Conditionals & Loops in Java',
    shortTitle: 'Control Flow',
    groupId: 'java-control',
    description: 'Decision making with if-else and switch, and iterative execution using for and while loops.',
    prerequisiteIds: ['java-syntax-types'],
    tags: ['java', 'loops', 'conditionals', 'control-flow'],
  },
  {
    id: 'java-methods',
    technologyId: JAVA_TECH_ID,
    title: 'Methods, Parameters & Return Types',
    shortTitle: 'Methods',
    groupId: 'java-control',
    description: 'Modular method declarations, parameter signatures, return types, and method overloading.',
    prerequisiteIds: ['java-control-flow'],
    tags: ['java', 'methods', 'functions', 'signatures'],
  },
  {
    id: 'java-classes-oop',
    technologyId: JAVA_TECH_ID,
    title: 'Classes, Constructors & Encapsulation',
    shortTitle: 'Classes & OOP',
    groupId: 'java-oop',
    description: 'Object-oriented class structures, private member fields, public constructors, and getter/setter methods.',
    prerequisiteIds: ['java-methods'],
    tags: ['java', 'oop', 'classes', 'encapsulation'],
  },
  {
    id: 'java-arrays-collections',
    technologyId: JAVA_TECH_ID,
    title: 'Arrays & ArrayList Collections',
    shortTitle: 'Arrays & Collections',
    groupId: 'java-data-structures',
    description: 'Fixed-size arrays, enhanced for-each iteration, and dynamic collection manipulation with ArrayList.',
    prerequisiteIds: ['java-classes-oop'],
    tags: ['java', 'arrays', 'collections', 'arraylist'],
  },
  {
    id: 'java-recursion',
    technologyId: JAVA_TECH_ID,
    title: 'Recursion & Algorithmic Patterns',
    shortTitle: 'Recursion',
    groupId: 'java-data-structures',
    description: 'Recursive problem breakdown, mandatory base cases, call-stack mechanics, and divide-and-conquer.',
    prerequisiteIds: ['java-arrays-collections'],
    tags: ['java', 'recursion', 'algorithms', 'call-stack'],
  },
]
