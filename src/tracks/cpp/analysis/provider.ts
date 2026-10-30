/**
 * C++ Static Complexity Analysis Provider (Stage 26, PLT-10, O-04).
 * Uses @lezer/cpp for lightweight client-side AST inspection.
 *
 * Strict Architectural Constraints:
 * - Confidence ceiling: never exceeds 'medium' (maxConfidence: 'medium').
 * - isFormalProof: false.
 * - method: 'static-ast'.
 * - Explicitly lists mandatory limitations:
 *   - 'No type information'
 *   - 'No call graph'
 *   - 'Templates/generics not modelled'
 *   - 'Static AST heuristic without runtime profiling'
 */

import { parser } from '@lezer/cpp'
import type { SyntaxNode } from '@lezer/common'
import type {
  AnalysisInput,
  AnalysisProvider,
  Bottleneck,
  ComplexityEstimate,
  Explanation,
  ExplanationStep,
  OptimisationSuggestion,
  SourceRange,
} from '../../../core/analysis/types'

const MAX_SOURCE_BYTES = 50 * 1024 // 50 kB input cap

interface LineCol {
  line: number
  column: number
}

function offsetToLineCol(text: string, offset: number): LineCol {
  let line = 1
  let column = 1
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === '\n') {
      line++
      column = 1
    } else {
      column++
    }
  }
  return { line, column }
}

function makeSourceRange(file: string, text: string, from: number, to: number): SourceRange {
  const start = offsetToLineCol(text, from)
  const end = offsetToLineCol(text, to)
  return {
    file,
    startLine: start.line,
    startCol: start.column,
    endLine: end.line,
    endCol: end.column,
  }
}

interface FunctionInfo {
  name: string
  from: number
  to: number
  recursiveCallCount: number
}

function isHalvingCode(slice: string): boolean {
  return (
    slice.includes('/= 2') ||
    slice.includes('/=2') ||
    slice.includes('*= 2') ||
    slice.includes('*=2') ||
    slice.includes('>>= 1') ||
    slice.includes('/ 2') ||
    slice.includes('/2') ||
    slice.includes('>> 1')
  )
}

function isLoopNode(nodeName: string): boolean {
  return (
    nodeName === 'ForStatement' ||
    nodeName === 'WhileStatement' ||
    nodeName === 'DoStatement' ||
    nodeName === 'ForRangeStatement'
  )
}

export const cppStaticProvider: AnalysisProvider = {
  id: 'cpp-static-v1',
  language: 'cpp',
  version: '1.0.0',

  supports(input: AnalysisInput): { ok: true } | { ok: false; reason: string } {
    if (!input) return { ok: false, reason: 'No input provided' }
    if (input.language && input.language.toLowerCase() !== 'cpp' && input.language.toLowerCase() !== 'c++') {
      return { ok: false, reason: 'Analysis provider only supports C++' }
    }
    const cppFile =
      input.files.find((f) => {
        const lower = f.name.toLowerCase()
        return lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx') || lower.endsWith('.h') || lower.endsWith('.hpp')
      }) || input.files[0]
    if (!cppFile) {
      return { ok: false, reason: 'No C++ source file found in input' }
    }
    const byteSize = new TextEncoder().encode(cppFile.content).length
    if (byteSize > MAX_SOURCE_BYTES) {
      return { ok: false, reason: 'Source file exceeds 50 kB limit' }
    }
    return { ok: true }
  },

  async analyze(input: AnalysisInput, signal?: AbortSignal): Promise<ComplexityEstimate> {
    if (signal?.aborted) {
      throw new Error('Analysis aborted')
    }

    const cppFile =
      input.files.find((f) => {
        const lower = f.name.toLowerCase()
        return lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx') || lower.endsWith('.h') || lower.endsWith('.hpp')
      }) || input.files[0]
    const code = cppFile ? cppFile.content : ''
    const fileName = cppFile ? cppFile.name : 'main.cpp'

    let tree
    let hasParseError = false
    try {
      tree = parser.parse(code)
    } catch {
      hasParseError = true
    }

    if (hasParseError || !tree) {
      return {
        time: { worst: 'O(1)', average: 'O(1)', best: 'O(1)' },
        auxiliarySpace: 'O(1)',
        confidence: 'low',
        assumptions: ['Static fallback due to unrecognized syntax'],
        limitations: [
          'Could not analyse: syntax not recognised near line 1',
          'No type information',
          'No call graph',
          'Templates/generics not modelled',
          'Static AST heuristic without runtime profiling',
        ],
        explanation: {
          summary: 'Syntax could not be completely parsed by the static analyzer.',
          steps: [{ text: 'Parsing encountered an error.' }],
        },
        bottlenecks: [],
        method: 'static-ast',
        isFormalProof: false,
      }
    }

    let hasErrorNode = false
    const isUnsupported = code.includes('__asm__') || code.includes('asm volatile')

    const functions: FunctionInfo[] = []
    let currentFunction: FunctionInfo | null = null

    const allLoops: Array<{ from: number; to: number; isHalving: boolean; depth: number }> = []

    const cursor = tree.cursor()
    do {
      if (cursor.name === '⚠') {
        hasErrorNode = true
      }

      if (cursor.name === 'FunctionDefinition') {
        const node = cursor.node
        const decl = node.getChild('FunctionDeclarator')
        const idNode = decl ? decl.getChild('Identifier') : null
        const name = idNode ? code.slice(idNode.from, idNode.to) : 'anonymous'
        currentFunction = {
          name,
          from: node.from,
          to: node.to,
          recursiveCallCount: 0,
        }
        functions.push(currentFunction)
      }

      if (cursor.name === 'CallExpression') {
        const node = cursor.node
        const idNode = node.getChild('Identifier')
        if (idNode && currentFunction) {
          const calledName = code.slice(idNode.from, idNode.to)
          if (calledName === currentFunction.name) {
            currentFunction.recursiveCallCount++
          }
        }
      }
    } while (cursor.next())

    // Second pass to identify loops with accurate nesting
    function traverse(node: SyntaxNode, currentDepth: number) {
      const isLoop = isLoopNode(node.name)
      let nextDepth = currentDepth

      if (isLoop) {
        nextDepth = currentDepth + 1
        const slice = code.slice(node.from, node.to)
        const halving = isHalvingCode(slice)
        allLoops.push({
          from: node.from,
          to: node.to,
          isHalving: halving,
          depth: nextDepth,
        })
      }

      let child = node.firstChild
      while (child) {
        traverse(child, nextDepth)
        child = child.nextSibling
      }
    }

    traverse(tree.topNode, 0)

    let maxLoopDepth = 0
    let hasHalvingAtDepth1 = false
    let hasHalvingNested = false

    for (const loop of allLoops) {
      if (loop.depth > maxLoopDepth) {
        maxLoopDepth = loop.depth
      }
      if (loop.depth === 1 && loop.isHalving) {
        hasHalvingAtDepth1 = true
      }
      if (loop.depth > 1 && loop.isHalving) {
        hasHalvingNested = true
      }
    }

    let maxRecursionCount = 0
    for (const f of functions) {
      if (f.recursiveCallCount > maxRecursionCount) {
        maxRecursionCount = f.recursiveCallCount
      }
    }

    let worstTime = 'O(1)'
    let auxiliarySpace = 'O(1)'

    if (maxRecursionCount >= 2) {
      worstTime = 'O(2^n)'
      auxiliarySpace = 'O(n)'
    } else if (maxRecursionCount === 1) {
      worstTime = 'O(n)'
      auxiliarySpace = 'O(n)'
    } else if (maxLoopDepth === 1) {
      worstTime = hasHalvingAtDepth1 ? 'O(log n)' : 'O(n)'
    } else if (maxLoopDepth === 2) {
      worstTime = hasHalvingNested ? 'O(n log n)' : 'O(n^2)'
    } else if (maxLoopDepth === 3) {
      worstTime = 'O(n^3)'
    } else if (maxLoopDepth > 3) {
      worstTime = `O(n^${maxLoopDepth})`
    }

    const confidence: 'low' | 'medium' = isUnsupported || hasErrorNode ? 'low' : 'medium'

    const bottlenecks: Bottleneck[] = []
    let rank = 1
    const sortedLoops = [...allLoops].sort((a, b) => b.depth - a.depth)
    for (const loop of sortedLoops) {
      bottlenecks.push({
        rank: rank++,
        range: makeSourceRange(fileName, code, loop.from, loop.to),
        reason: loop.isHalving ? 'Halving loop step' : `Loop at nesting depth ${loop.depth}`,
        contributes: loop.depth === 1 ? (loop.isHalving ? 'O(log n)' : 'O(n)') : loop.depth === 2 ? 'O(n^2)' : `O(n^${loop.depth})`,
      })
    }

    for (const f of functions) {
      if (f.recursiveCallCount > 0) {
        bottlenecks.push({
          rank: rank++,
          range: makeSourceRange(fileName, code, f.from, f.to),
          reason: f.recursiveCallCount >= 2 ? 'Branching recursion' : 'Linear recursion',
          contributes: f.recursiveCallCount >= 2 ? 'O(2^n)' : 'O(n)',
        })
      }
    }

    const steps: ExplanationStep[] = []
    steps.push({
      text: `Detected ${functions.length} function definition(s) and ${allLoops.length} loop(s).`,
    })

    if (maxRecursionCount >= 2) {
      steps.push({
        text: 'Detected multi-branching recursive self-invocation leading to exponential call tree.',
        contributes: 'O(2^n)',
      })
    } else if (maxRecursionCount === 1) {
      steps.push({
        text: 'Detected linear recursive call stack proportional to input depth.',
        contributes: 'O(n)',
      })
    } else if (maxLoopDepth > 0) {
      steps.push({
        text: `Identified maximum loop nesting depth of ${maxLoopDepth}${hasHalvingNested || hasHalvingAtDepth1 ? ' with logarithmic halving step' : ''}.`,
        contributes: worstTime,
      })
    } else {
      steps.push({
        text: 'No loops or recursive calls identified. Code executes constant-time statements.',
        contributes: 'O(1)',
      })
    }

    const explanation: Explanation = {
      summary: `Estimated ${worstTime} worst-case time complexity and ${auxiliarySpace} auxiliary space based on static AST inspection.`,
      steps,
    }

    return {
      time: {
        worst: worstTime,
        average: worstTime,
        best: worstTime === 'O(1)' ? 'O(1)' : 'O(1)',
      },
      auxiliarySpace,
      confidence,
      assumptions: [
        'Loop bounds and recursive call counts scale with input size n',
        'Basic arithmetic and primitive operations execute in O(1) time',
      ],
      limitations: [
        'Static AST heuristic without runtime profiling',
        'No type information',
        'No call graph',
        'Templates/generics not modelled',
        'Confidence capped at medium per specification',
      ],
      explanation,
      bottlenecks,
      method: 'static-ast',
      isFormalProof: false,
    }
  },

  async suggest(
    _input: AnalysisInput,
    estimate: ComplexityEstimate,
  ): Promise<OptimisationSuggestion[]> {
    const suggestions: OptimisationSuggestion[] = []
    if (estimate.time.worst === 'O(n^2)') {
      suggestions.push({
        id: 'cpp-opt-unordered-set',
        title: 'Consider std::unordered_set for hash lookup',
        rationale: 'Nested linear scans can frequently be replaced with std::unordered_set lookup to achieve O(n) average time complexity.',
        expected: {
          time: 'O(n)',
          auxiliarySpace: 'O(n)',
        },
        risk: 'low',
        requiresCorrectnessCheck: true,
      })
    } else if (estimate.time.worst === 'O(2^n)') {
      suggestions.push({
        id: 'cpp-opt-memoization',
        title: 'Apply memoization or tabulation',
        rationale: 'Overlapping subproblems in branching recursion can be cached to achieve O(n) time complexity.',
        expected: {
          time: 'O(n)',
          auxiliarySpace: 'O(n)',
        },
        risk: 'low',
        requiresCorrectnessCheck: true,
      })
    }
    return suggestions
  },
}
