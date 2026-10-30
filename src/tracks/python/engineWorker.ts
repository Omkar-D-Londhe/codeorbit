/**
 * Pyodide Web Worker Execution Engine (Stage 25b, PLT-09, O-03).
 * Runs inside a dedicated Web Worker without DOM, storage, or external network access.
 * Enforces:
 * - Sandbox neutralization (strips residual globals)
 * - sys.meta_path import blocker (os, subprocess, socket, urllib, shutil, etc.)
 * - sys.setrecursionlimit(500)
 * - Fresh namespace dictionary per run
 * - 50 KB output truncation
 */

export interface PythonWorkerInitMessage {
  type: 'init'
  baseUrl?: string
}

export interface PythonWorkerRunMessage {
  type: 'run'
  code: string
  tests?: Array<{
    id: string
    name: string
    call: string
    expect: unknown
    hidden?: boolean
  }>
  stdin?: string
  limits?: {
    timeoutMs?: number
    maxOutputBytes?: number
  }
}

export interface PythonWorkerAnalyzeMessage {
  type: 'analyze'
  code: string
}

export type PythonWorkerInMessage =
  | PythonWorkerInitMessage
  | PythonWorkerRunMessage
  | PythonWorkerAnalyzeMessage

const MAX_OUTPUT_BYTES = 50 * 1024 // 50 KB hard cap

// Sandbox initialization: neutralize dangerous globals if present inside worker thread
const SENSITIVE_GLOBALS = [
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'indexedDB',
]
if (typeof self !== 'undefined' && typeof (self as unknown as { importScripts?: unknown }).importScripts === 'function') {
  for (const key of SENSITIVE_GLOBALS) {
    if (key in self) {
      try {
        Object.defineProperty(self, key, {
          value: undefined,
          writable: true,
          configurable: true,
        })
      } catch {
        // Ignore non-configurable globals
      }
    }
  }
}

const PYTHON_SANDBOX_INIT_SCRIPT = `
import sys
import builtins

BLOCKED_MODULES = {
    'os', 'subprocess', 'socket', 'urllib', 'http',
    'shutil', 'ctypes', 'multiprocessing', 'requests'
}

# Poison existing sys.modules
for mod in list(sys.modules.keys()):
    top = mod.split('.')[0]
    if top in BLOCKED_MODULES:
        sys.modules[mod] = None

class SandboxImportBlocker:
    def find_spec(self, fullname, path, target=None):
        top_level = fullname.split('.')[0]
        if top_level in BLOCKED_MODULES:
            raise ImportError(
                f"Security restriction: module '{fullname}' is unavailable in CodeOrbit's sandboxed environment."
            )
        return None

if not any(isinstance(finder, SandboxImportBlocker) for finder in sys.meta_path):
    sys.meta_path.insert(0, SandboxImportBlocker())

orig_import = builtins.__import__
def safe_import(name, *args, **kwargs):
    top_level = name.split('.')[0]
    if top_level in BLOCKED_MODULES:
        raise ImportError(f"Security restriction: module '{name}' is unavailable in CodeOrbit's sandboxed environment.")
    return orig_import(name, *args, **kwargs)

builtins.__import__ = safe_import
sys.setrecursionlimit(500)
`

export const PYTHON_AST_ANALYZER_SCRIPT = `
import ast
import json

def analyze_python_ast(source_code):
    try:
        tree = ast.parse(source_code)
    except SyntaxError as e:
        return {
            "time": {"worst": "O(1)"},
            "auxiliarySpace": "O(1)",
            "confidence": "low",
            "assumptions": ["Source code contains syntax errors; static analysis is heuristic"],
            "limitations": [f"SyntaxError at line {e.lineno}: {e.msg}"],
            "explanation": {
                "summary": "Source could not be fully parsed due to syntax errors.",
                "steps": []
            },
            "bottlenecks": [],
            "method": "static-ast",
            "isFormalProof": False
        }

    loop_depth = 0
    max_loop_depth = 0
    has_log_loop = False
    has_recursion = False
    is_branching_recursion = False
    has_linear_recursion = False
    has_log_recursion = False
    built_in_costs = []
    has_nested_in_list = False
    space_allocations = []
    unsupported_features = []
    bottlenecks = []
    steps = []

    # Map function names to their AST FunctionDef nodes
    function_defs = {}
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            function_defs[node.name] = node

    class ASTVisitor(ast.NodeVisitor):
        def __init__(self):
            self.current_loop_depth = 0
            self.current_fn = None
            self.loop_vars = set()
            self.list_vars = set()
            self.set_vars = set()

        def visit_FunctionDef(self, node):
            old_fn = self.current_fn
            self.current_fn = node.name
            self.generic_visit(node)
            self.current_fn = old_fn

        def visit_AsyncFunctionDef(self, node):
            self.visit_FunctionDef(node)

        def visit_For(self, node):
            self.current_loop_depth += 1
            nonlocal max_loop_depth
            if self.current_loop_depth > max_loop_depth:
                max_loop_depth = self.current_loop_depth

            line = getattr(node, 'lineno', 1)
            steps.append({
                "text": f"For loop at line {line} contributes depth {self.current_loop_depth}",
                "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                "contributes": f"O(n^{self.current_loop_depth})" if self.current_loop_depth > 1 else "O(n)"
            })
            bottlenecks.append({
                "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                "reason": f"Loop nesting depth {self.current_loop_depth}",
                "contributes": f"O(n^{self.current_loop_depth})" if self.current_loop_depth > 1 else "O(n)",
                "rank": self.current_loop_depth
            })

            self.generic_visit(node)
            self.current_loop_depth -= 1

        def visit_While(self, node):
            self.current_loop_depth += 1
            nonlocal max_loop_depth, has_log_loop
            if self.current_loop_depth > max_loop_depth:
                max_loop_depth = self.current_loop_depth

            # Check if condition or body has n //= 2 or n = n // 2
            is_halving = False
            for child in ast.walk(node):
                if isinstance(child, ast.AugAssign) and isinstance(child.op, ast.FloorDiv):
                    is_halving = True
                elif isinstance(child, ast.Assign) and isinstance(child.value, ast.BinOp) and isinstance(child.value.op, ast.FloorDiv):
                    is_halving = True

            line = getattr(node, 'lineno', 1)
            if is_halving:
                has_log_loop = True
                steps.append({
                    "text": f"While loop at line {line} divides input size logarithmically",
                    "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                    "contributes": "O(log n)"
                })
            else:
                steps.append({
                    "text": f"While loop at line {line} contributes depth {self.current_loop_depth}",
                    "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                    "contributes": f"O(n^{self.current_loop_depth})" if self.current_loop_depth > 1 else "O(n)"
                })
                bottlenecks.append({
                    "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                    "reason": f"While loop execution",
                    "contributes": f"O(n^{self.current_loop_depth})" if self.current_loop_depth > 1 else "O(n)",
                    "rank": self.current_loop_depth
                })

            self.generic_visit(node)
            self.current_loop_depth -= 1

        def visit_ListComp(self, node):
            gen_count = len(node.generators)
            nonlocal max_loop_depth
            effective_depth = self.current_loop_depth + gen_count
            has_inner_list_mult = False
            if isinstance(node.elt, ast.BinOp) and isinstance(node.elt.op, ast.Mult):
                if isinstance(node.elt.left, ast.List) or isinstance(node.elt.right, ast.List):
                    has_inner_list_mult = True
                    effective_depth += 1
                    space_allocations.append("O(n^2)")

            if effective_depth > max_loop_depth:
                max_loop_depth = effective_depth
            if not has_inner_list_mult:
                space_allocations.append("O(n^" + str(gen_count) + ")" if gen_count > 1 else "O(n)")
            line = getattr(node, 'lineno', 1)
            steps.append({
                "text": f"List comprehension at line {line} with {gen_count} generator(s)",
                "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                "contributes": "O(n^" + str(effective_depth) + ")" if effective_depth > 1 else "O(n)"
            })
            self.generic_visit(node)

        def visit_DictComp(self, node):
            gen_count = len(node.generators)
            nonlocal max_loop_depth
            effective_depth = self.current_loop_depth + gen_count
            if effective_depth > max_loop_depth:
                max_loop_depth = effective_depth
            space_allocations.append("O(n)")
            self.generic_visit(node)

        def visit_SetComp(self, node):
            gen_count = len(node.generators)
            nonlocal max_loop_depth
            effective_depth = self.current_loop_depth + gen_count
            if effective_depth > max_loop_depth:
                max_loop_depth = effective_depth
            space_allocations.append("O(n)")
            self.generic_visit(node)

        def visit_Compare(self, node):
            # Check for 'in' operation: e.g. target in list_collection
            for op, comparator in zip(node.ops, node.comparators):
                if isinstance(op, (ast.In, ast.NotIn)):
                    line = getattr(node, 'lineno', 1)
                    if self.current_loop_depth > 0:
                        # Membership check inside a loop
                        # If the comparator is named or known to be a set, it is O(1)
                        is_set = False
                        if isinstance(comparator, ast.Name):
                            name_lower = comparator.id.lower()
                            if 'set' in name_lower or 'dict' in name_lower or 'seen' in name_lower or comparator.id in self.set_vars:
                                is_set = True
                        if not is_set:
                            nonlocal has_nested_in_list
                            has_nested_in_list = True
                            steps.append({
                                "text": f"Linear membership scan 'in' at line {line} inside loop contributes O(n) per iteration",
                                "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                                "contributes": "O(n^2)"
                            })
                            bottlenecks.append({
                                "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                                "reason": "Linear search (in) nested inside a loop",
                                "contributes": "O(n^2)",
                                "rank": 2
                            })
            self.generic_visit(node)

        def visit_Call(self, node):
            line = getattr(node, 'lineno', 1)
            # Check built-in functions
            if isinstance(node.func, ast.Name):
                fn_name = node.func.id
                if fn_name == 'eval' or fn_name == 'exec':
                    unsupported_features.append(f"Dynamic execution with '{fn_name}'")
                elif fn_name == 'sorted':
                    built_in_costs.append('O(n log n)')
                    space_allocations.append('O(n)')
                    steps.append({
                        "text": f"Built-in sorted() at line {line} contributes O(n log n)",
                        "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                        "contributes": "O(n log n)"
                    })
                    bottlenecks.append({
                        "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                        "reason": "Built-in sorted() call",
                        "contributes": "O(n log n)",
                        "rank": 2
                    })
                elif fn_name in ('sum', 'min', 'max', 'reversed', 'list'):
                    built_in_costs.append('O(n)')
                    if fn_name == 'list':
                        space_allocations.append('O(n)')
                elif fn_name in ('set', 'dict'):
                    space_allocations.append('O(n)')
                elif fn_name == self.current_fn and self.current_fn is not None:
                    # Recursive call
                    nonlocal has_recursion, is_branching_recursion, has_linear_recursion, has_log_recursion
                    has_recursion = True
                    # Check if binary search / log recursion or branching
                    fn_ast = function_defs.get(self.current_fn)
                    if fn_ast:
                        recursive_calls = [
                            c for c in ast.walk(fn_ast)
                            if isinstance(c, ast.Call) and isinstance(c.func, ast.Name) and c.func.id == self.current_fn
                        ]
                        if len(recursive_calls) >= 2:
                            is_branching_recursion = True
                        else:
                            # Single recursive call
                            # Check if parameter has // 2 or - 1
                            has_division = False
                            for arg in node.args:
                                for sub in ast.walk(arg):
                                    if isinstance(sub, ast.BinOp) and isinstance(sub.op, ast.FloorDiv):
                                        has_division = True
                            if has_division:
                                has_log_recursion = True
                            else:
                                has_linear_recursion = True

            elif isinstance(node.func, ast.Attribute):
                method_name = node.func.attr
                if method_name == 'sort':
                    built_in_costs.append('O(n log n)')
                    steps.append({
                        "text": f"In-place list.sort() at line {line} contributes O(n log n)",
                        "range": {"file": "solution.py", "startLine": line, "startCol": getattr(node, 'col_offset', 0), "endLine": getattr(node, 'end_lineno', line), "endCol": getattr(node, 'end_col_offset', 10)},
                        "contributes": "O(n log n)"
                    })
                elif method_name in ('index', 'count'):
                    built_in_costs.append('O(n)')
                elif method_name == 'append':
                    # O(1) amortized, but records space allocation
                    space_allocations.append('O(n)')

            self.generic_visit(node)

        def visit_BinOp(self, node):
            # Check for [0] * n list replication
            if isinstance(node.op, ast.Mult):
                if isinstance(node.left, ast.List) or isinstance(node.right, ast.List):
                    space_allocations.append('O(n)')
            self.generic_visit(node)

    visitor = ASTVisitor()
    visitor.visit(tree)

    # Determine Time Complexity
    time_class = "O(1)"
    if unsupported_features:
        confidence = "low"
    else:
        confidence = "high"

    if is_branching_recursion:
        time_class = "O(2^n)"
    elif max_loop_depth >= 3:
        time_class = "O(n^3)"
    elif max_loop_depth == 2 or has_nested_in_list:
        time_class = "O(n^2)"
    elif 'O(n log n)' in built_in_costs:
        time_class = "O(n log n)"
    elif has_log_loop or has_log_recursion:
        time_class = "O(log n)"
    elif max_loop_depth == 1 or has_linear_recursion or ('O(n)' in built_in_costs):
        time_class = "O(n)"
    else:
        time_class = "O(1)"

    # Determine Space Complexity
    if is_branching_recursion or has_linear_recursion:
        space_class = "O(n)"
    elif has_log_recursion:
        space_class = "O(log n)"
    elif any('O(n^2)' in s for s in space_allocations):
        space_class = "O(n^2)"
    elif any('O(n)' in s for s in space_allocations) or ('O(n log n)' in built_in_costs and any(isinstance(n, ast.Call) and getattr(n.func, 'id', None) == 'sorted' for n in ast.walk(tree))):
        space_class = "O(n)"
    else:
        space_class = "O(1)"

    assumptions = [
        "Input collections scale with size n",
        "Built-in list membership tests perform linear O(n) scans",
        "Built-in sorted() utilizes Timsort with O(n log n) worst-case time"
    ]

    limitations = [
        "Static AST heuristics cannot infer runtime loop iterations governed by dynamic break/return flags",
        "Amortized bounds for custom class behaviors are not formally proven"
    ]
    if unsupported_features:
        limitations.extend(unsupported_features)

    summary = f"Estimated worst-case time {time_class} and auxiliary space {space_class} based on static AST traversal."

    return {
        "time": {
            "worst": time_class,
            "average": time_class,
            "best": "O(1)" if max_loop_depth > 0 or has_recursion else time_class
        },
        "auxiliarySpace": space_class,
        "confidence": confidence,
        "assumptions": assumptions,
        "limitations": limitations,
        "explanation": {
            "summary": summary,
            "steps": steps
        },
        "bottlenecks": sorted(bottlenecks, key=lambda b: b.get("rank", 0), reverse=True),
        "method": "static-ast",
        "isFormalProof": False
    }
`

export interface PyProxy {
  toJs: (options?: { dict_converter?: (entries: Iterable<[unknown, unknown]>) => unknown }) => unknown
  destroy?: () => void
}

export interface PyodideInstance {
  runPython: (code: string, options?: { globals?: unknown }) => unknown
  runPythonAsync: (code: string, options?: { globals?: unknown }) => Promise<unknown>
  setStdout: (opts: { batched: (str: string) => void }) => void
  setStderr: (opts: { batched: (str: string) => void }) => void
  setStdin: (opts: { stdin?: () => string | null; isatty?: boolean }) => void
  toPy: (obj: unknown) => unknown
  globals: {
    set: (name: string, value: unknown) => void
    get: (name: string) => unknown
  }
}

interface WorkerScopeWithPyodide {
  loadPyodide?: (opts: { indexURL: string }) => Promise<PyodideInstance>
  importScripts?: (...urls: string[]) => void
  postMessage?: (message: unknown) => void
}

let pyodideInstance: PyodideInstance | null = null

async function getPyodide(baseUrl = '/pyodide/'): Promise<PyodideInstance> {
  if (pyodideInstance) return pyodideInstance

  const g = self as unknown as WorkerScopeWithPyodide
  const loader = g.loadPyodide
  if (typeof loader === 'function') {
    pyodideInstance = await loader({ indexURL: baseUrl })
  } else {
    try {
      // In ES module workers, load via dynamic import of pyodide.mjs
      const pyodideModule = (await import(/* @vite-ignore */ `${baseUrl}pyodide.mjs`)) as {
        loadPyodide: (opts: { indexURL: string }) => Promise<PyodideInstance>
      }
      if (typeof pyodideModule.loadPyodide === 'function') {
        pyodideInstance = await pyodideModule.loadPyodide({ indexURL: baseUrl })
      }
    } catch {
      // Fallback for classic workers or environments where importScripts is available
      try {
        if (typeof g.importScripts === 'function') {
          g.importScripts(`${baseUrl}pyodide.js`)
        }
        const recheckLoader = (self as unknown as WorkerScopeWithPyodide).loadPyodide
        if (typeof recheckLoader === 'function') {
          pyodideInstance = await recheckLoader({ indexURL: baseUrl })
        }
      } catch (importErr) {
        throw new Error(`Failed to load Pyodide: ${importErr instanceof Error ? importErr.message : String(importErr)}`, {
          cause: importErr,
        })
      }
    }
  }

  if (!pyodideInstance) {
    throw new Error('Failed to create Pyodide instance')
  }

  // Initialize sandbox import blocker and recursion limit
  pyodideInstance.runPython(PYTHON_SANDBOX_INIT_SCRIPT)
  return pyodideInstance
}

if (typeof self !== 'undefined' && typeof (self as unknown as WorkerScopeWithPyodide).postMessage === 'function') {
  self.onmessage = async (event: MessageEvent) => {
    const data = event.data as PythonWorkerInMessage
    if (!data || typeof data !== 'object') return

    if (data.type === 'init') {
      try {
        await getPyodide(data.baseUrl || '/pyodide/')
        self.postMessage({ type: 'ready' })
      } catch (err) {
        self.postMessage({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
      return
    }

    if (data.type === 'analyze') {
      try {
        const py = await getPyodide()
        py.runPython(PYTHON_AST_ANALYZER_SCRIPT)
        py.globals.set('__source_to_analyze', data.code)
        const resJsonStr = py.runPython(`json.dumps(analyze_python_ast(__source_to_analyze))`)
        const parsed = JSON.parse(String(resJsonStr))
        self.postMessage({ type: 'analysis_result', result: parsed })
      } catch (err) {
        self.postMessage({
          type: 'error',
          message: err instanceof Error ? err.message : String(err),
        })
      }
      return
    }

    if (data.type === 'run') {
      const start = performance.now()
      let stdout = ''
      let stderr = ''
      let truncated = false

      const appendStdout = (text: string) => {
        if (truncated) return
        if (stdout.length + text.length > MAX_OUTPUT_BYTES) {
          stdout += text.slice(0, MAX_OUTPUT_BYTES - stdout.length) + '\n[Output truncated: exceeded 50 KB limit]\n'
          truncated = true
        } else {
          stdout += text
        }
      }

      const appendStderr = (text: string) => {
        if (truncated) return
        if (stderr.length + text.length > MAX_OUTPUT_BYTES) {
          stderr += text.slice(0, MAX_OUTPUT_BYTES - stderr.length) + '\n[Output truncated: exceeded 50 KB limit]\n'
          truncated = true
        } else {
          stderr += text
        }
      }

      try {
        const py = await getPyodide()

        // Set stdout and stderr callbacks
        py.setStdout({ batched: (str: string) => appendStdout(str + '\n') })
        py.setStderr({ batched: (str: string) => appendStderr(str + '\n') })

        // Set stdin if provided
        if (data.stdin) {
          const stdinLines = data.stdin.split('\n')
          let lineIdx = 0
          py.setStdin({
            stdin: () => (lineIdx < stdinLines.length ? stdinLines[lineIdx++] : null),
          })
        }

        // Run in fresh namespace
        const freshNs = py.toPy({})
        py.runPython(data.code, { globals: freshNs })

        // Evaluate tests if provided
        const testResults: Array<{
          id: string
          name: string
          passed: boolean
          actual: unknown
          expected: unknown
          error?: string
          hidden?: boolean
        }> = []

        if (Array.isArray(data.tests) && data.tests.length > 0) {
          for (const test of data.tests) {
            try {
              const evalRes = py.runPython(test.call, { globals: freshNs })
              // Convert PyProxy or primitive to JS
              const pyProxy = evalRes as PyProxy | null
              const actual = pyProxy && typeof pyProxy.toJs === 'function' ? pyProxy.toJs({ dict_converter: Object.fromEntries }) : evalRes
              const passed = JSON.stringify(actual) === JSON.stringify(test.expect)
              testResults.push({
                id: test.id,
                name: test.name,
                passed,
                actual,
                expected: test.expect,
                hidden: test.hidden,
              })
            } catch (testErr) {
              testResults.push({
                id: test.id,
                name: test.name,
                passed: false,
                actual: undefined,
                expected: test.expect,
                error: testErr instanceof Error ? testErr.message : String(testErr),
                hidden: test.hidden,
              })
            }
          }
        }

        const allPassed = testResults.length > 0 ? testResults.every((t) => t.passed) : true
        const durationMs = Math.round(performance.now() - start)

        self.postMessage({
          type: 'result',
          status: 'ok',
          stdout,
          stderr: stderr || undefined,
          testResults,
          allPassed,
          durationMs,
        })
      } catch (err) {
        const durationMs = Math.round(performance.now() - start)
        const errMsg = err instanceof Error ? err.message : String(err)
        appendStderr(errMsg + '\n')

        self.postMessage({
          type: 'error',
          status: 'error',
          message: errMsg,
          stdout,
          stderr: stderr || undefined,
          durationMs,
          allPassed: false,
          testResults: (data.tests || []).map((t) => ({
            id: t.id,
            name: t.name,
            passed: false,
            actual: undefined,
            expected: t.expect,
            error: errMsg,
            hidden: t.hidden,
          })),
        })
      }
    }
  }
}
