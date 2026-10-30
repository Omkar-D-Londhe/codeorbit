// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import {
  SignallingRelay,
  WebSocketSignallingServer,
  type SignallingMessage,
} from '../../server/signalling/relay'

describe('WebRTC WebSocket Signalling Relay Integration (O-07)', () => {
  let server: WebSocketSignallingServer
  let relay: SignallingRelay
  let port: number
  let wsUrl: string

  beforeAll(async () => {
    relay = new SignallingRelay({ maxMessagesPerSec: 100, roomTtlMs: 5000 })
    server = new WebSocketSignallingServer(relay)
    port = await server.start(0) // dynamic test port
    wsUrl = `ws://127.0.0.1:${port}`
  })

  afterAll(async () => {
    await server.stop()
  })

  it('connects two WebSocket clients, exchanges SDP offer/answer, and relays ICE candidates', async () => {
    const clientA = new WebSocket(wsUrl)
    const clientB = new WebSocket(wsUrl)

    await Promise.all([
      new Promise<void>((resolve) => { clientA.onopen = () => resolve() }),
      new Promise<void>((resolve) => { clientB.onopen = () => resolve() }),
    ])

    const clientAMessages: SignallingMessage[] = []
    const clientBMessages: SignallingMessage[] = []

    clientA.onmessage = (ev) => {
      clientAMessages.push(JSON.parse(ev.data as string))
    }
    clientB.onmessage = (ev) => {
      clientBMessages.push(JSON.parse(ev.data as string))
    }

    const roomCode = 'WSRACE'

    // Peer A joins room
    clientA.send(JSON.stringify({
      type: 'join',
      roomCode,
      senderId: 'peer-alice',
    }))

    // Wait 20ms
    await new Promise((r) => setTimeout(r, 20))

    // Peer B joins room
    clientB.send(JSON.stringify({
      type: 'join',
      roomCode,
      senderId: 'peer-bob',
    }))

    await new Promise((r) => setTimeout(r, 20))

    // Peer A should receive join notification from peer B
    expect(clientAMessages.some((m) => m.type === 'join' && m.senderId === 'peer-bob')).toBe(true)

    // Peer A sends SDP offer to Peer B
    const dummyOffer = { type: 'offer', sdp: 'v=0\r\no=alice ...' }
    clientA.send(JSON.stringify({
      type: 'offer',
      roomCode,
      senderId: 'peer-alice',
      payload: dummyOffer,
    }))

    await new Promise((r) => setTimeout(r, 30))

    // Peer B should receive the offer
    const receivedOffer = clientBMessages.find((m) => m.type === 'offer')
    expect(receivedOffer).toBeDefined()
    expect(receivedOffer?.senderId).toBe('peer-alice')
    expect((receivedOffer?.payload as { sdp: string }).sdp).toBe(dummyOffer.sdp)

    // Peer B sends SDP answer back to Peer A
    const dummyAnswer = { type: 'answer', sdp: 'v=0\r\no=bob ...' }
    clientB.send(JSON.stringify({
      type: 'answer',
      roomCode,
      senderId: 'peer-bob',
      payload: dummyAnswer,
    }))

    await new Promise((r) => setTimeout(r, 30))

    // Peer A receives answer
    const receivedAnswer = clientAMessages.find((m) => m.type === 'answer')
    expect(receivedAnswer).toBeDefined()
    expect(receivedAnswer?.senderId).toBe('peer-bob')

    // Peer A sends ICE candidate
    const dummyCandidate = { candidate: 'candidate:1 1 UDP ...', sdpMid: '0', sdpMLineIndex: 0 }
    clientA.send(JSON.stringify({
      type: 'ice-candidate',
      roomCode,
      senderId: 'peer-alice',
      payload: dummyCandidate,
    }))

    await new Promise((r) => setTimeout(r, 30))

    const receivedCandidate = clientBMessages.find((m) => m.type === 'ice-candidate')
    expect(receivedCandidate).toBeDefined()

    // Clean close
    clientA.close()
    clientB.close()
  })

  it('rejects a 3rd peer from joining a full 2-peer room', async () => {
    const c1 = new WebSocket(wsUrl)
    const c2 = new WebSocket(wsUrl)
    const c3 = new WebSocket(wsUrl)

    await Promise.all([
      new Promise<void>((r) => { c1.onopen = () => r() }),
      new Promise<void>((r) => { c2.onopen = () => r() }),
      new Promise<void>((r) => { c3.onopen = () => r() }),
    ])

    const c3Messages: SignallingMessage[] = []
    c3.onmessage = (ev) => {
      c3Messages.push(JSON.parse(ev.data as string))
    }

    const room = 'FULLRM'
    c1.send(JSON.stringify({ type: 'join', roomCode: room, senderId: 'p1' }))
    c2.send(JSON.stringify({ type: 'join', roomCode: room, senderId: 'p2' }))
    await new Promise((r) => setTimeout(r, 20))

    c3.send(JSON.stringify({ type: 'join', roomCode: room, senderId: 'p3' }))
    await new Promise((r) => setTimeout(r, 40))

    expect(c3Messages.some((m) => m.type === 'error' && JSON.stringify(m.payload).includes('full'))).toBe(true)

    c1.close()
    c2.close()
    c3.close()
  })

  it('rejects WebSocket connections from untrusted origins with HTTP 403', async () => {
    // Attempt connection with untrusted origin
    const NodeWebSocket = WebSocket as unknown as new (url: string, opts?: { headers?: Record<string, string> }) => WebSocket
    const rejectedWs = new NodeWebSocket(wsUrl, {
      headers: { Origin: 'http://evil-attacker.com' },
    })

    const errorOrClose = await new Promise<'error' | 'close' | 'open'>((resolve) => {
      rejectedWs.onerror = () => resolve('error')
      rejectedWs.onclose = () => resolve('close')
      rejectedWs.onopen = () => resolve('open')
    })

    expect(errorOrClose).not.toBe('open')
    rejectedWs.close()
  })

  it('enforces maximum connection capacity limits', async () => {
    const limitedRelay = new SignallingRelay()
    const limitedServer = new WebSocketSignallingServer(limitedRelay, { maxConnections: 1 })
    const limitedPort = await limitedServer.start(0)
    const limitedUrl = `ws://127.0.0.1:${limitedPort}`

    const c1 = new WebSocket(limitedUrl)
    await new Promise<void>((r) => { c1.onopen = () => r() })

    // Second connection exceeds maxConnections=1 and should be rejected with 503
    const c2 = new WebSocket(limitedUrl)
    const outcome = await new Promise<'error' | 'close' | 'open'>((resolve) => {
      c2.onerror = () => resolve('error')
      c2.onclose = () => resolve('close')
      c2.onopen = () => resolve('open')
    })

    expect(outcome).not.toBe('open')

    c1.close()
    c2.close()
    await limitedServer.stop()
  })
})
