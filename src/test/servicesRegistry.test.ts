import { describe, it, expect } from 'vitest'
import {
  getExternalServices,
  getExternalService,
  type ExternalServiceId,
} from '../core/services/registry'

describe('Stage 28: External Service Registry (PLT-06, PLT-07, Gates O-06, O-07, O-14)', () => {
  it('registers exactly the three Phase-2 external services', () => {
    const services = getExternalServices()
    expect(services.length).toBe(3)
    const ids = services.map((s) => s.id)
    expect(ids).toContain('w3c-validator')
    expect(ids).toContain('ai-hints')
    expect(ids).toContain('multiplayer')
  })

  it('declares all external services as strictly not-connected and unapproved by default', () => {
    const services = getExternalServices()
    for (const svc of services) {
      expect(svc.status).toBe('not-connected')
      expect(svc.isApproved).toBe(false)
      expect(svc.disclosure.length).toBeGreaterThanOrEqual(30)
      expect(svc.offlineFallback.length).toBeGreaterThanOrEqual(20)
    }
  })

  it('maps each service to its respective hard gate in 07_CONFLICTS_AND_DECISIONS', () => {
    const w3c = getExternalService('w3c-validator')
    expect(w3c?.gateId).toBe('O-14')

    const ai = getExternalService('ai-hints')
    expect(ai?.gateId).toBe('O-06')

    const multi = getExternalService('multiplayer')
    expect(multi?.gateId).toBe('O-07')
  })

  it('returns undefined for unregistered service IDs', () => {
    const unknown = getExternalService('fake-cloud-sync' as ExternalServiceId)
    expect(unknown).toBeUndefined()
  })

  it('guarantees an unconfigured provider cannot produce a false positive connected state', () => {
    const services = getExternalServices()
    for (const svc of services) {
      // Must not be connected merely by existence in the registry
      expect(svc.status).not.toBe('connected')
    }
  })
})
