/**
 * Pure Browser-Safe WebRTC Signalling Protocol & In-Memory Relay (Gate O-07).
 * This module has ZERO Node.js dependencies and can be safely imported in browser bundles.
 */

export interface SignallingMessage {
  type: 'join' | 'ready' | 'offer' | 'answer' | 'ice-candidate' | 'leave' | 'error'
  roomCode: string
  senderId: string
  payload?: unknown
}

export interface PeerRoom {
  code: string
  peers: Set<string>
  createdAt: number
  lastActivity: number
}

export interface RelayLimits {
  maxRooms: number
  maxMessageBytes: number
  roomTtlMs: number
  maxMessagesPerSec: number
}

export const DEFAULT_LIMITS: RelayLimits = {
  maxRooms: 1000,
  maxMessageBytes: 64 * 1024, // 64 KiB
  roomTtlMs: 2 * 60 * 60 * 1000, // 2 hours
  maxMessagesPerSec: 50,
}

export class SignallingRelay {
  private rooms = new Map<string, PeerRoom>()
  private peerRates = new Map<string, { count: number; windowStart: number }>()
  readonly limits: RelayLimits

  constructor(limits: Partial<RelayLimits> = {}) {
    this.limits = { ...DEFAULT_LIMITS, ...limits }
  }

  joinRoom(roomCode: string, peerId: string): { ok: boolean; peerCount: number; error?: string } {
    this.cleanupExpiredRooms()

    if (!roomCode || typeof roomCode !== 'string' || roomCode.length > 16) {
      return { ok: false, peerCount: 0, error: 'Invalid room code' }
    }
    if (!peerId || typeof peerId !== 'string' || peerId.length > 64) {
      return { ok: false, peerCount: 0, error: 'Invalid peer ID' }
    }

    const code = roomCode.toUpperCase().trim()
    let room = this.rooms.get(code)

    if (!room) {
      if (this.rooms.size >= this.limits.maxRooms) {
        return { ok: false, peerCount: 0, error: 'Relay server at capacity' }
      }
      room = { code, peers: new Set(), createdAt: Date.now(), lastActivity: Date.now() }
      this.rooms.set(code, room)
    }

    if (room.peers.size >= 2 && !room.peers.has(peerId)) {
      return { ok: false, peerCount: room.peers.size, error: 'Room is full (max 2 racers)' }
    }

    room.peers.add(peerId)
    room.lastActivity = Date.now()
    return { ok: true, peerCount: room.peers.size }
  }

  leaveRoom(roomCode: string, peerId: string): void {
    const code = roomCode.toUpperCase().trim()
    const room = this.rooms.get(code)
    if (!room) return

    room.peers.delete(peerId)
    if (room.peers.size === 0) {
      this.rooms.delete(code)
    } else {
      room.lastActivity = Date.now()
    }
    this.peerRates.delete(peerId)
  }

  getRoom(roomCode: string): PeerRoom | undefined {
    return this.rooms.get(roomCode.toUpperCase().trim())
  }

  getRoomCount(): number {
    return this.rooms.size
  }

  validateMessage(raw: unknown): { valid: boolean; message?: SignallingMessage; error?: string } {
    if (!raw || typeof raw !== 'object') {
      return { valid: false, error: 'Message must be a non-null object' }
    }

    const msg = raw as Record<string, unknown>
    const validTypes = ['join', 'ready', 'offer', 'answer', 'ice-candidate', 'leave']
    if (typeof msg.type !== 'string' || !validTypes.includes(msg.type)) {
      return { valid: false, error: 'Invalid signalling message type' }
    }
    if (typeof msg.roomCode !== 'string' || msg.roomCode.length === 0 || msg.roomCode.length > 16) {
      return { valid: false, error: 'Invalid roomCode' }
    }
    if (typeof msg.senderId !== 'string' || msg.senderId.length === 0 || msg.senderId.length > 64) {
      return { valid: false, error: 'Invalid senderId' }
    }

    // Check rate limit for this sender
    const now = Date.now()
    let rate = this.peerRates.get(msg.senderId)
    if (!rate || now - rate.windowStart > 1000) {
      rate = { count: 1, windowStart: now }
      this.peerRates.set(msg.senderId, rate)
    } else {
      rate.count++
      if (rate.count > this.limits.maxMessagesPerSec) {
        return { valid: false, error: 'Rate limit exceeded' }
      }
    }

    return { valid: true, message: msg as unknown as SignallingMessage }
  }

  relayMessage(
    msg: SignallingMessage,
    broadcastFn: (targetPeerId: string, msg: SignallingMessage) => void
  ): boolean {
    const code = msg.roomCode.toUpperCase().trim()
    const room = this.rooms.get(code)
    if (!room) return false

    room.lastActivity = Date.now()

    for (const peerId of room.peers) {
      if (peerId !== msg.senderId) {
        broadcastFn(peerId, msg)
      }
    }
    return true
  }

  cleanupExpiredRooms(): number {
    const now = Date.now()
    let cleaned = 0
    for (const [code, room] of this.rooms.entries()) {
      if (now - room.lastActivity > this.limits.roomTtlMs) {
        this.rooms.delete(code)
        cleaned++
      }
    }
    return cleaned
  }

  reset(): void {
    this.rooms.clear()
    this.peerRates.clear()
  }
}

export const signallingRelay = new SignallingRelay()
