export type ExternalServiceId = 'w3c-validator' | 'ai-hints' | 'multiplayer'

export type ExternalServiceStatus = 'not-connected' | 'connected' | 'error'

export interface ExternalService {
  id: ExternalServiceId
  name: string
  description: string
  status: ExternalServiceStatus
  disclosure: string
  gateId: 'O-06' | 'O-07' | 'O-14'
  isApproved: boolean
  offlineFallback: string
}

export const EXTERNAL_SERVICES: ExternalService[] = [
  {
    id: 'w3c-validator',
    name: 'W3C HTML Validator',
    description: 'Remote HTML markup syntax and standard compliance checking using the official W3C Nu HTML Checker API.',
    status: 'not-connected',
    disclosure: 'When connected and explicitly triggered via a confirmation dialog, learner HTML markup is transmitted to the external W3C Nu HTML Checker service. No personal information or identifiers are sent.',
    gateId: 'O-14',
    isApproved: false,
    offlineFallback: 'Local deterministic AST validators and accessibility linters operate entirely offline without network access.',
  },
  {
    id: 'ai-hints',
    name: 'AI-Powered Hint Expansion',
    description: 'Contextual AI hints for interactive practice challenges using large language models.',
    status: 'not-connected',
    disclosure: 'Requires an owner-managed backend proxy to safeguard API credentials without exposing keys in client code. When enabled, challenge requirements and learner code snippets would be dispatched to the remote LLM proxy. Each AI hint request counts as a hint usage towards challenge mastery.',
    gateId: 'O-06',
    isApproved: false,
    offlineFallback: 'Curated 3-stage deterministic hints (concept -> structure -> syntax) are bundled statically and function 100% offline.',
  },
  {
    id: 'multiplayer',
    name: 'Multiplayer Challenge Race',
    description: 'Real-time peer-to-peer coding races and challenge completion telemetry across local network peers.',
    status: 'not-connected',
    disclosure: 'True multi-device coordination requires external WebRTC signalling infrastructure. Peer-to-peer rooms transmit code diffs and completion times. In accordance with architectural rule L-08, opponent progress is never fabricated or simulated.',
    gateId: 'O-07',
    isApproved: false,
    offlineFallback: 'Personal best tracking, speed metrics, and local practice challenges function completely offline on your device.',
  },
]

export function getExternalServices(): ExternalService[] {
  return [...EXTERNAL_SERVICES]
}

export function getExternalService(id: ExternalServiceId): ExternalService | undefined {
  return EXTERNAL_SERVICES.find((s) => s.id === id)
}
