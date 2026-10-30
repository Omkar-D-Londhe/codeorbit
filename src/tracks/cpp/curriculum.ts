import type { Topic, TopicGroup } from '../../data/types'

export const CPP_TECH_ID = 'cpp'

export const cppGroups: TopicGroup[] = [
  { id: 'cpp-foundations', title: 'Foundations' },
  { id: 'cpp-control', title: 'Control Flow & Functions' },
  { id: 'cpp-memory', title: 'Pointers & Memory' },
  { id: 'cpp-oop-stl', title: 'Classes & STL' },
]

export const cppTopics: Topic[] = [
  {
    id: 'cpp-syntax-io',
    technologyId: CPP_TECH_ID,
    title: 'C++ Syntax, Types & Stream I/O',
    shortTitle: 'Syntax & I/O',
    groupId: 'cpp-foundations',
    description: 'Header inclusion, std::cout, std::cin, namespaces, strongly-typed variables, and auto.',
    prerequisiteIds: [],
    tags: ['cpp', 'syntax', 'iostream', 'types'],
  },
  {
    id: 'cpp-control-flow',
    technologyId: CPP_TECH_ID,
    title: 'Conditionals & Loops in C++',
    shortTitle: 'Control Flow',
    groupId: 'cpp-control',
    description: 'if-else branching, switch statements, for and while loops, and loop nesting.',
    prerequisiteIds: ['cpp-syntax-io'],
    tags: ['cpp', 'loops', 'conditionals', 'control-flow'],
  },
  {
    id: 'cpp-functions-references',
    technologyId: CPP_TECH_ID,
    title: 'Functions & Pass-by-Reference',
    shortTitle: 'Functions & Ref',
    groupId: 'cpp-control',
    description: 'Function prototypes, return values, pass-by-value vs pass-by-reference (&), and const correctness.',
    prerequisiteIds: ['cpp-control-flow'],
    tags: ['cpp', 'functions', 'references', 'parameters'],
  },
  {
    id: 'cpp-pointers-memory',
    technologyId: CPP_TECH_ID,
    title: 'Pointers & Memory Addresses',
    shortTitle: 'Pointers & Memory',
    groupId: 'cpp-memory',
    description: 'Address-of operator (&), pointer dereferencing (*), nullptr safety, and memory models.',
    prerequisiteIds: ['cpp-functions-references'],
    tags: ['cpp', 'pointers', 'memory', 'addresses'],
  },
  {
    id: 'cpp-classes-objects',
    technologyId: CPP_TECH_ID,
    title: 'Classes, Objects & Encapsulation',
    shortTitle: 'Classes & Objects',
    groupId: 'cpp-oop-stl',
    description: 'Class declaration, public and private access specifiers, constructors, and member methods.',
    prerequisiteIds: ['cpp-pointers-memory'],
    tags: ['cpp', 'oop', 'classes', 'constructors'],
  },
  {
    id: 'cpp-recursion-stl',
    technologyId: CPP_TECH_ID,
    title: 'Recursion & std::vector Containers',
    shortTitle: 'Recursion & STL',
    groupId: 'cpp-oop-stl',
    description: 'Recursive functions, base cases, dynamic sizing with std::vector, and algorithmic thinking.',
    prerequisiteIds: ['cpp-classes-objects'],
    tags: ['cpp', 'recursion', 'stl', 'vector'],
  },
]
