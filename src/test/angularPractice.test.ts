import { describe, it, expect } from 'vitest'
import { angularTrack } from '../tracks/angular/track'
import { angularChallenges } from '../tracks/angular/challenges'
import { angularRunner, executeAngular } from '../tracks/angular/runner'
import { checkChallenge } from '../lib/validators'

describe('Angular Interactive Practice Lab (O-05, Pass 2)', () => {
  it('declares exactly 12 curated standalone component challenges', () => {
    expect(angularChallenges.length).toBe(12)
    expect(angularTrack.challenges.length).toBe(12)
    expect(angularTrack.capabilities).toContain('practice')
    expect(angularTrack.capabilities).toContain('preview')
    expect(angularTrack.runner).toBeDefined()
    expect(angularTrack.availability).toBe('available')
  })

  it('every challenge has 100% passing solutionCode and failing starterCode', () => {
    for (const challenge of angularChallenges) {
      // Starter code must fail at least one requirement
      const startRes = checkChallenge(challenge, challenge.starterCode)
      expect(startRes.allPassed).toBe(false)
      expect(startRes.results.some((r) => r.status === 'fail')).toBe(true)

      // Solution code must pass all requirements
      const solRes = checkChallenge(challenge, challenge.solutionCode)
      expect(solRes.allPassed).toBe(true)
      expect(solRes.passed).toBe(challenge.requirements.length)
      expect(solRes.results.every((r) => r.status === 'pass')).toBe(true)
    }
  })

  it('compiles standalone component to sandboxed interactive iframe preview', async () => {
    const code = `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: \`
    <div class="counter">
      <span>Count: {{ count() }}</span>
      <button (click)="increment()">Increment</button>
    </div>
  \`,
})
export class CounterComponent {
  count = signal(0);
  increment() { this.count.update(c => c + 1); }
}
`
    const res = await executeAngular(code)
    expect(res.status).toBe('ok')
    if (res.status === 'ok') {
      expect(res.previewDoc).toBeDefined()
      expect(res.previewDoc).toContain('Angular v18 Standalone Component')
      expect(res.previewDoc).toContain('Count: {{ count() }}')
      expect(res.previewDoc).toContain('Content-Security-Policy')
    }
  })

  it('verifies runner is registered on angularRunner instance', () => {
    expect(angularRunner.kind).toBe('iframe-preview')
  })
})
