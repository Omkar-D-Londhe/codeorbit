export interface JavaSnippet {
  id: string
  title: string
  category: string
  code: string
  description: string
}

export const JAVA_SNIPPETS: JavaSnippet[] = [
  {
    id: 'java-snip-main',
    title: 'Main Method Boilerplate',
    category: 'syntax',
    code: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    description: 'Standard Java application entry point method declaration.',
  },
  {
    id: 'java-snip-for-each',
    title: 'Enhanced For Loop',
    category: 'loops',
    code: `for (int item : array) {\n    System.out.println(item);\n}`,
    description: 'Enhanced for-each loop iterating through arrays and iterable collections.',
  },
  {
    id: 'java-snip-encapsulation',
    title: 'Encapsulated Class',
    category: 'oop',
    code: `public class Item {\n    private String name;\n\n    public Item(String name) {\n        this.name = name;\n    }\n\n    public String getName() {\n        return name;\n    }\n}`,
    description: 'Standard encapsulated class with private field, constructor, and getter.',
  },
  {
    id: 'java-snip-arraylist',
    title: 'ArrayList Operations',
    category: 'collections',
    code: `import java.util.ArrayList;\n\nArrayList<String> list = new ArrayList<>();\nlist.add("First");\nlist.add("Second");`,
    description: 'Instantiating and appending elements to a dynamic generic ArrayList.',
  },
]
