/**
 * Angular Challenge Validators (O-05, Pass 2).
 * Validates Angular component declarations, modern signals, control flow,
 * binding syntax, and services.
 */

export type AngularRule =
  | { kind: 'angularSourceMatches'; pattern: string | RegExp; explanation?: string }
  | { kind: 'declaresComponent'; selector?: string; standalone?: boolean }
  | { kind: 'usesSignal'; signalName?: string }
  | { kind: 'usesControlFlow'; directive: '@if' | '@for' | '@switch' }
  | { kind: 'usesBinding'; bindingType: 'property' | 'event' | 'two-way' }
  | { kind: 'declaresInjectable'; providedIn?: string }
  | { kind: 'usesRouterLink' }

export function evaluateAngularRule(source: string, rule: AngularRule): boolean {
  switch (rule.kind) {
    case 'angularSourceMatches': {
      if (typeof rule.pattern === 'string') {
        return source.includes(rule.pattern)
      }
      return rule.pattern.test(source)
    }

    case 'declaresComponent': {
      const hasDecorator = /@Component\s*\(\s*\{/.test(source)
      if (!hasDecorator) return false
      if (rule.standalone && !/standalone\s*:\s*true/.test(source)) {
        return false
      }
      if (rule.selector) {
        const selRegex = new RegExp(`selector\\s*:\\s*['"\`]${rule.selector}['"\`]`)
        if (!selRegex.test(source)) return false
      }
      return true
    }

    case 'usesSignal': {
      if (rule.signalName) {
        const regex = new RegExp(`\\b${rule.signalName}\\s*=\\s*signal\\s*\\(`)
        return regex.test(source)
      }
      return /\bsignal\s*\(/.test(source) || /\bcomputed\s*\(/.test(source)
    }

    case 'usesControlFlow': {
      if (rule.directive === '@if') {
        return /@if\s*\(/.test(source)
      }
      if (rule.directive === '@for') {
        return /@for\s*\(/.test(source) && /\btrack\b/.test(source)
      }
      if (rule.directive === '@switch') {
        return /@switch\s*\(/.test(source)
      }
      return false
    }

    case 'usesBinding': {
      if (rule.bindingType === 'property') {
        return /\[[a-zA-Z0-9_\-.]+\]\s*=/.test(source)
      }
      if (rule.bindingType === 'event') {
        return /\([a-zA-Z0-9_\-.]+\)\s*=/.test(source)
      }
      if (rule.bindingType === 'two-way') {
        return /\[\([a-zA-Z0-9_\-.]+\)\]\s*=/.test(source)
      }
      return false
    }

    case 'declaresInjectable': {
      const hasInjectable = /@Injectable\s*\(\s*\{/.test(source)
      if (!hasInjectable) return false
      if (rule.providedIn) {
        const regex = new RegExp(`providedIn\\s*:\\s*['"\`]${rule.providedIn}['"\`]`)
        return regex.test(source)
      }
      return true
    }

    case 'usesRouterLink': {
      return /\brouterLink\b/.test(source) || /\[routerLink\]/.test(source)
    }

    default:
      return false
  }
}

export function findAngularRuleLocation(
  source: string,
  rule: AngularRule
): { line: number; column: number } | undefined {
  const lines = source.split('\n')

  let matchStr: string | RegExp | undefined
  if (rule.kind === 'angularSourceMatches') {
    matchStr = rule.pattern
  } else if (rule.kind === 'declaresComponent') {
    matchStr = '@Component'
  } else if (rule.kind === 'usesSignal') {
    matchStr = 'signal('
  } else if (rule.kind === 'usesControlFlow') {
    matchStr = rule.directive
  } else if (rule.kind === 'usesBinding') {
    matchStr = rule.bindingType === 'two-way' ? '[(' : rule.bindingType === 'property' ? '[' : '('
  } else if (rule.kind === 'declaresInjectable') {
    matchStr = '@Injectable'
  } else if (rule.kind === 'usesRouterLink') {
    matchStr = 'routerLink'
  }

  if (!matchStr) return undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (typeof matchStr === 'string') {
      const col = line.indexOf(matchStr)
      if (col !== -1) {
        return { line: i + 1, column: col + 1 }
      }
    } else if (matchStr.test(line)) {
      const match = line.match(matchStr)
      return { line: i + 1, column: (match?.index ?? 0) + 1 }
    }
  }

  return undefined
}
