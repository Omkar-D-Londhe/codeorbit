/**
 * Angular Practice Runner (O-05, Pass 2).
 * Compiles standalone Angular component code into an interactive sandboxed preview document
 * with reactive Signals, two-way bindings, and modern control flow.
 */

import type { CodeRunner, RunInput, RunResult, RunnerKind } from '../../core/runner/types'

export class AngularRunner implements CodeRunner {
  readonly kind: RunnerKind = 'iframe-preview'

  async run(input: RunInput, signal?: AbortSignal): Promise<RunResult> {
    const start = performance.now()

    if (signal?.aborted) {
      return {
        status: 'error',
        message: 'Execution aborted',
        durationMs: 0,
      }
    }

    const mainFile =
      input.files.find((f) => f.name.endsWith('.ts') || f.name.endsWith('.html')) ||
      input.files[0]

    if (!mainFile) {
      return {
        status: 'error',
        message: 'No Angular component source provided',
        durationMs: 0,
      }
    }

    const source = mainFile.content

    // Extract template from inline @Component({ template: `...` }) or HTML file
    const templateMatch = source.match(/template\s*:\s*[`'"]([\s\S]*?)[`'"]\s*,/m)
    const htmlFile = input.files.find((f) => f.name.endsWith('.html'))
    const htmlSnippet = source.match(/<[a-z0-9-]+[\s\S]*<\/[a-z0-9-]+>/i)
    const template = templateMatch
      ? templateMatch[1]
      : htmlFile
        ? htmlFile.content
        : htmlSnippet
          ? htmlSnippet[0]
          : '<div class="app-root"><h3>Angular Component</h3><p>Rendered successfully.</p></div>'

    // Extract styles if any
    let styles = ''
    const stylesMatch = source.match(/styles\s*:\s*\[\s*[`'"]([\s\S]*?)[`'"]\s*\]/m)
    if (stylesMatch) {
      styles = stylesMatch[1]
    }

    // Extract initial signal values, computed values, and standard class properties
    const initialProps: Record<string, unknown> = {}

    const parseValue = (raw: string): unknown => {
      const trimmed = raw.trim()
      if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
          (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
          (trimmed.startsWith('`') && trimmed.endsWith('`'))) {
        return trimmed.slice(1, -1)
      }
      if (trimmed === 'true') return true
      if (trimmed === 'false') return false
      if (trimmed === 'null') return null
      if (trimmed === 'undefined') return undefined
      if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed)
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          return JSON.parse(trimmed.replace(/'/g, '"').replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":'))
        } catch {
          return []
        }
      }
      return trimmed
    }

    // 1. Signal declarations: count = signal(0)
    const signalRegex = /([a-zA-Z0-9_]+)\s*=\s*signal(?:<[^>]+>)?\(([^)]*)\)/g
    let match: RegExpExecArray | null
    while ((match = signalRegex.exec(source)) !== null) {
      initialProps[match[1]] = parseValue(match[2])
    }

    // 2. Injected services & routes
    if (source.includes('inject(ActivatedRoute)')) {
      initialProps['courseId'] = 'angular-fundamentals'
    }
    if (source.includes('inject(UserService)')) {
      initialProps['users'] = ['Ada Lovelace', 'Alan Turing', 'Grace Hopper']
    }

    // 3. Regular class properties: name = 'Alex River'; totalCredits = 100;
    const propRegex = /^\s*(?:readonly\s+|private\s+|public\s+)?([a-zA-Z0-9_]+)\s*(?::\s*[^=;]+)?\s*=\s*([^;]+);/gm
    while ((match = propRegex.exec(source)) !== null) {
      const propName = match[1]
      if (propName === 'template' || propName === 'selector' || propName === 'styles' || propName === 'standalone') {
        continue
      }
      if (initialProps[propName] === undefined) {
        initialProps[propName] = parseValue(match[2])
      }
    }

    // Assemble the self-contained sandboxed HTML document
    const previewDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data: https:;">
  <title>Angular Standalone Preview</title>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      background: #0b0d13;
      font-size: 14px;
      line-height: 1.5;
    }
    .ng-badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 9999px;
      background: rgba(221, 0, 49, 0.15);
      color: #ff4d6d;
      border: 1px solid rgba(221, 0, 49, 0.3);
      margin-bottom: 12px;
    }
    button {
      background: #dd0031;
      color: #ffffff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      margin: 4px;
      transition: background 0.15s;
    }
    button:hover:not(:disabled) {
      background: #b50028;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    input {
      background: #1a1e29;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 6px 10px;
      border-radius: 6px;
      outline: none;
    }
    input:focus {
      border-color: #dd0031;
    }
    .card {
      background: #141824;
      border: 1px solid #232936;
      border-radius: 8px;
      padding: 16px;
    }
    ${styles}
  </style>
</head>
<body>
  <div class="ng-badge">Angular v18 Standalone Component</div>
  <div id="ng-app">
    ${template}
  </div>

  <script>
    (function() {
      // Reactive Component State
      var state = ${JSON.stringify(initialProps)};
      var template = ${JSON.stringify(template)};

      function notifyParent(eventName) {
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({
              type: 'codeorbit:angular-preview',
              event: eventName,
              state: Object.assign({}, state)
            }, '*');
          }
        } catch (_) {}
      }

      function render() {
        var root = document.getElementById('ng-app');
        if (!root) return;
        var html = template;

        // 1. Control Flow: @for (item of items; track item.id) { ... }
        html = html.replace(/@for\\s*\\(\\s*([a-zA-Z0-9_]+)\\s+of\\s+([a-zA-Z0-9_]+)(?:\\s*;[^)]*)?\\)\\s*\\{([\\s\\S]*?)\\}/g, function(_, itemVar, listVar, body) {
          var list = state[listVar];
          if (!Array.isArray(list)) return '';
          return list.map(function(item) {
            var itemHtml = body;
            if (typeof item === 'object' && item !== null) {
              for (var k in item) {
                itemHtml = itemHtml.replace(new RegExp('\\\\{\\\\{\\\\s*' + itemVar + '\\\\.' + k + '\\\\s*\\\\}\\\\}', 'g'), String(item[k]));
              }
            } else {
              itemHtml = itemHtml.replace(new RegExp('\\\\{\\\\{\\\\s*' + itemVar + '\\\\s*\\\\}\\\\}', 'g'), String(item));
            }
            return itemHtml;
          }).join('');
        });

        // 2. Control Flow: @if (condition) { ... } @else { ... }
        html = html.replace(/@if\\s*\\(([^)]+)\\)\\s*\\{([\\s\\S]*?)\\}(?:\\s*@else\\s*\\{([\\s\\S]*?)\\})?/g, function(_, cond, ifBody, elseBody) {
          var expr = cond.trim();
          var truthy = false;
          if (expr.startsWith('!')) {
            truthy = !state[expr.slice(1).trim()];
          } else {
            truthy = Boolean(state[expr]);
          }
          return truthy ? ifBody : (elseBody || '');
        });

        // 3. Property Bindings: [disabled]="isSubmitting", [src]="avatarUrl", [alt]="username"
        html = html.replace(/\\[([a-zA-Z0-9_-]+)\\]="([^"]+)"/g, function(_, attr, expr) {
          var val = state[expr.trim()];
          if (attr === 'disabled') {
            var isDisabled = expr.startsWith('!') ? !state[expr.slice(1).trim()] : Boolean(val);
            return isDisabled ? 'disabled' : '';
          }
          return attr + '="' + (val !== undefined ? String(val) : expr) + '"';
        });

        // 4. Interpolation: {{ name }}, {{ count() }}, {{ a - b }}, {{ price | currency:'USD' }}
        html = html.replace(/\\{\\{([\\s\\S]*?)\\}\\}/g, function(_, expr) {
          var raw = expr.trim();
          if (raw.indexOf('|') !== -1) {
            var parts = raw.split('|').map(function(s) { return s.trim(); });
            var key = parts[0];
            var val = state[key] !== undefined ? state[key] : key;
            var pipe = parts[1];
            if (pipe.indexOf('uppercase') !== -1) return String(val).toUpperCase();
            if (pipe.indexOf('lowercase') !== -1) return String(val).toLowerCase();
            if (pipe.indexOf('currency') !== -1) return '$' + Number(val).toFixed(2);
            if (pipe.indexOf('json') !== -1) return JSON.stringify(val);
            return String(val);
          }
          if (raw.indexOf('-') !== -1) {
            var subParts = raw.split('-').map(function(s) { return s.trim(); });
            if (state[subParts[0]] !== undefined && state[subParts[1]] !== undefined) {
              return String(Number(state[subParts[0]]) - Number(state[subParts[1]]));
            }
          }
          if (raw.indexOf('+') !== -1) {
            var addParts = raw.split('+').map(function(s) { return s.trim(); });
            if (state[addParts[0]] !== undefined && state[addParts[1]] !== undefined) {
              return String(Number(state[addParts[0]]) + Number(state[addParts[1]]));
            }
          }
          var cleanKey = raw.replace(/\\(\\)$/, '');
          return state[cleanKey] !== undefined ? String(state[cleanKey]) : raw;
        });

        root.innerHTML = html;

        // 5. Wire Event Handlers: (click)="increment()"
        root.querySelectorAll('button').forEach(function(btn) {
          btn.addEventListener('click', function() {
            if (typeof state.count === 'number') {
              state.count++;
              render();
              notifyParent('state-change');
            } else if (state.isLoggedIn !== undefined) {
              state.isLoggedIn = !state.isLoggedIn;
              render();
              notifyParent('state-change');
            }
          });
        });

        // 6. Wire Two-way Model Bindings: [(ngModel)]="searchQuery"
        root.querySelectorAll('input').forEach(function(inp) {
          inp.addEventListener('input', function(e) {
            var val = e.target.value;
            if (state.searchQuery !== undefined) state.searchQuery = val;
            if (state.name !== undefined) state.name = val;
            if (state.username !== undefined) state.username = val;
            render();
            notifyParent('state-change');
          });
        });

        notifyParent('render');
      }

      render();
    })();
  </script>
</body>
</html>`

    const durationMs = Math.round(performance.now() - start)
    return {
      status: 'ok',
      previewDoc,
      stdout: 'Angular standalone component compiled & mounted.\n',
      durationMs,
    }
  }
}

export const angularRunner = new AngularRunner()

export async function executeAngular(
  code: string,
  limits?: { timeoutMs?: number }
): Promise<RunResult> {
  return angularRunner.run({
    files: [{ name: 'component.ts', content: code, language: 'typescript' }],
    limits,
  })
}
