import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  generateRoomCode,
  computeSolutionChecksum,
  validateRacePacket,
  PeerRaceSession,
} from '../core/multiplayer/peerRace'
import {
  SignallingRelay,
  WebSocketSignallingServer,
} from '../../server/signalling/relay'

describe('Real Cross-Device Multiplayer Challenge Race (Gate O-07, Rule L-08)', () => {
  let sessionHost: PeerRaceSession
  let sessionGuest: PeerRaceSession

  beforeEach(() => {
    vi.useFakeTimers()
    sessionHost = new PeerRaceSession('Alice')
    sessionGuest = new PeerRaceSession('Bob')
  })

  afterEach(() => {
    sessionHost.close()
    sessionGuest.close()
    vi.useRealTimers()
  })

  it('generates 6-character alphanumeric room codes', () => {
    const code = generateRoomCode()
    expect(code).toHaveLength(6)
    expect(code).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('computes deterministic SHA-256 checksums of solutions', async () => {
    const codeA = 'function sum(a, b) { return a + b; }'
    const codeB = 'function sum(a, b) { return a + b; }\n'
    const codeC = 'function sum(a, b) { return a * b; }'

    const hashA = await computeSolutionChecksum(codeA)
    const hashB = await computeSolutionChecksum(codeB)
    const hashC = await computeSolutionChecksum(codeC)

    expect(hashA).toBe(hashB) // normalized whitespace matches
    expect(hashA).not.toBe(hashC)
    expect(hashA.length).toBeGreaterThanOrEqual(8)
  })

  it('validates race packet schema strictly', () => {
    expect(validateRacePacket(null)).toBeNull()
    expect(validateRacePacket('string')).toBeNull()
    expect(validateRacePacket({ type: 'fake-hack', peerId: 'p1', roomCode: 'R1' })).toBeNull()
    expect(validateRacePacket({ type: 'progress', peerId: 'p1', roomCode: 'R1', progress: { passed: -5, total: 10 } })).toBeNull()
    expect(validateRacePacket({ type: 'countdown', peerId: 'p1', roomCode: 'R1', countdown: 999 })).toBeNull()

    const valid = validateRacePacket({
      type: 'progress',
      peerId: 'p1',
      roomCode: 'RACE1',
      progress: { passed: 2, total: 4 },
    })
    expect(valid).not.toBeNull()
    expect(valid?.type).toBe('progress')
  })

  it('coordinates lobby join and synchronizes countdown between real peers', () => {
    const roomCode = 'TEST99'

    sessionHost.join(roomCode, true)
    expect(sessionHost.status).toBe('lobby')
    expect(sessionHost.isHost).toBe(true)

    sessionGuest.join(roomCode, false)
    expect(sessionGuest.status).toBe('lobby')

    // Host sees Bob joined
    expect(sessionHost.opponentProgress?.displayName).toBe('Bob')

    // Host starts countdown
    sessionHost.startCountdown()
    expect(sessionHost.status).toBe('countdown')

    // Advance 3 seconds
    vi.advanceTimersByTime(3000)
    expect(sessionHost.status).toBe('racing')
  })

  it('synchronizes real-time requirements progress without fabrication', () => {
    const roomCode = 'RACE42'
    sessionHost.join(roomCode, true)
    sessionGuest.join(roomCode, false)

    sessionHost.status = 'racing'
    sessionGuest.status = 'racing'

    // Guest completes 2 of 4 requirements
    sessionGuest.sendProgress(2, 4)

    expect(sessionHost.opponentProgress?.requirementsPassed).toBe(2)
    expect(sessionHost.opponentProgress?.totalRequirements).toBe(4)
    expect(sessionHost.opponentProgress?.percent).toBe(50)
    expect(sessionHost.opponentProgress?.finished).toBe(false)
  })

  it('records finish with solution checksum and completion time', async () => {
    const roomCode = 'FINISH'
    sessionHost.join(roomCode, true)
    sessionGuest.join(roomCode, false)

    sessionHost.status = 'racing'
    sessionGuest.status = 'racing'

    await sessionGuest.sendFinish('solutionCode()', 45000)

    expect(sessionGuest.status).toBe('finished')
    expect(sessionHost.opponentProgress?.finished).toBe(true)
    expect(sessionHost.opponentProgress?.finishTimeMs).toBe(45000)
    expect(sessionHost.opponentProgress?.solutionChecksum).toBeDefined()
  })

  it('honestly reports opponent disconnect with grace timer and NEVER injects a fake bot (Rule L-08)', () => {
    const roomCode = 'HONEST'
    sessionHost.join(roomCode, true)
    sessionGuest.join(roomCode, false)

    sessionHost.status = 'racing'
    sessionGuest.status = 'racing'

    // Guest disconnects
    sessionGuest.leave()

    expect(sessionHost.status).toBe('opponent-disconnected')
    expect(sessionHost.disconnectGraceRemaining).toBe(15)

    // Verify Rule L-08: Opponent progress is NOT replaced with synthetic bot
    expect(sessionHost.opponentProgress?.displayName).toBe('Bob')

    vi.advanceTimersByTime(5000)
    expect(sessionHost.disconnectGraceRemaining).toBe(10)
  })

  it('signalling relay limits rooms to at most 2 racers and enforces validation', () => {
    const relay = new SignallingRelay({ roomTtlMs: 1000 })
    const code = 'DUO-ROOM'

    const r1 = relay.joinRoom(code, 'p1')
    expect(r1.ok).toBe(true)
    expect(r1.peerCount).toBe(1)

    const r2 = relay.joinRoom(code, 'p2')
    expect(r2.ok).toBe(true)
    expect(r2.peerCount).toBe(2)

    // Third peer rejected
    const r3 = relay.joinRoom(code, 'p3')
    expect(r3.ok).toBe(false)
    expect(r3.error).toContain('Room is full')

    // Message validation
    expect(relay.validateMessage({ type: 'invalid' }).valid).toBe(false)
    expect(relay.validateMessage({ type: 'offer', roomCode: code, senderId: 'p1', payload: {} }).valid).toBe(true)

    // Cleanup expired rooms
    vi.advanceTimersByTime(2000)
    const cleaned = relay.cleanupExpiredRooms()
    expect(cleaned).toBe(1)
    expect(relay.getRoom(code)).toBeUndefined()
  })

  it('starts and stops real WebSocket signalling server cleanly', async () => {
    const customRelay = new SignallingRelay()
    const server = new WebSocketSignallingServer(customRelay)
    const port = await server.start(0) // bind to random ephemeral port
    expect(port).toBeGreaterThan(0)

    await server.stop()
  })

  it('guarantees client multiplayer modules have zero Node.js or server/ dependencies', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')

    const peerRaceSrc = fs.readFileSync(path.resolve(__dirname, '../core/multiplayer/peerRace.ts'), 'utf-8')
    const protocolSrc = fs.readFileSync(path.resolve(__dirname, '../core/multiplayer/protocol.ts'), 'utf-8')

    // Must never import node: modules or server/ in client files
    expect(peerRaceSrc).not.toMatch(/from\s+['"]node:/)
    expect(peerRaceSrc).not.toMatch(/from\s+['"][^'"]*\/server\//)
    expect(protocolSrc).not.toMatch(/from\s+['"]node:/)
    expect(protocolSrc).not.toMatch(/from\s+['"][^'"]*\/server\//)
  })
})
