/**
 * WebRTC Signalling Relay Server (Gate O-07, Pass 2 & Pass 3 Remediation).
 * Relays SDP offers, answers, and ICE candidate exchanges between peers.
 * Enforces room limits, message schema validation, payload ceilings, and rate controls.
 * Zero opponent simulation, zero fake bots.
 */

import { createServer, type Server, type IncomingMessage } from 'node:http'
import type { Socket } from 'node:net'
import { createHash } from 'node:crypto'
import {
  type SignallingMessage,
  type PeerRoom,
  type RelayLimits,
  DEFAULT_LIMITS,
  SignallingRelay,
  signallingRelay,
} from '../../src/core/multiplayer/protocol'

export {
  type SignallingMessage,
  type PeerRoom,
  type RelayLimits,
  DEFAULT_LIMITS,
  SignallingRelay,
  signallingRelay,
}

export interface WebSocketServerOptions {
  maxConnections?: number
  allowedOrigins?: string[]
}

/**
 * Lightweight Zero-Dependency WebSocket Signalling Server (RFC 6455).
 * Encodes/decodes WebRTC signalling frames in pure Node.js.
 */
export class WebSocketSignallingServer {
  private server: Server | null = null
  private sockets = new Map<string, { socket: Socket; peerId?: string; roomCode?: string }>()
  readonly relay: SignallingRelay
  readonly options: WebSocketServerOptions

  constructor(relay: SignallingRelay = signallingRelay, options: WebSocketServerOptions = {}) {
    this.relay = relay
    this.options = options
  }

  start(port = 8765): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = createServer((_req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('CodeOrbit WebRTC Signalling Relay')
      })

      this.server.on('upgrade', (req: IncomingMessage, socket: Socket) => {
        if (this.sockets.size >= (this.options.maxConnections ?? 2000)) {
          socket.write('HTTP/1.1 503 Service Unavailable\r\n\r\n')
          socket.destroy()
          return
        }

        const origin = req.headers['origin'] as string | undefined
        const allowedOrigins = process.env.SIGNALLING_ALLOWED_ORIGINS
          ? process.env.SIGNALLING_ALLOWED_ORIGINS.split(',').map((s) => s.trim())
          : (this.options.allowedOrigins ?? [
              'http://localhost:5173',
              'http://127.0.0.1:5173',
              'http://localhost:4173',
              'http://127.0.0.1:4173',
              'http://localhost:3000',
              'http://127.0.0.1:3000',
            ])

        if (origin) {
          if (!allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n')
            socket.destroy()
            return
          }
        }

        const key = req.headers['sec-websocket-key']
        if (!key || req.headers['upgrade']?.toLowerCase() !== 'websocket') {
          socket.write('HTTP/1.1 400 Bad Request\r\n\r\n')
          socket.destroy()
          return
        }

        const accept = createHash('sha1')
          .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
          .digest('base64')

        socket.write(
          'HTTP/1.1 101 Switching Protocols\r\n' +
          'Upgrade: websocket\r\n' +
          'Connection: Upgrade\r\n' +
          'Sec-WebSocket-Accept: ' + accept + '\r\n\r\n'
        )

        const socketId = `sock-${Math.random().toString(36).slice(2, 9)}`
        const entry = { socket }
        this.sockets.set(socketId, entry)

        socket.on('data', (buffer: Buffer) => {
          this.handleSocketData(socketId, buffer)
        })

        socket.on('close', () => {
          this.handleSocketClose(socketId)
        })

        socket.on('error', () => {
          this.handleSocketClose(socketId)
        })
      })

      this.server.listen(port, () => {
        const addr = this.server?.address()
        const actualPort = typeof addr === 'object' && addr ? addr.port : port
        resolve(actualPort)
      })

      this.server.on('error', reject)
    })
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      for (const { socket } of this.sockets.values()) {
        try {
          socket.destroy()
        } catch { /* ignore */ }
      }
      this.sockets.clear()
      if (this.server) {
        if (typeof (this.server as unknown as { closeAllConnections?: () => void }).closeAllConnections === 'function') {
          (this.server as unknown as { closeAllConnections: () => void }).closeAllConnections()
        }
        this.server.close(() => resolve())
        // Safety timeout to avoid hanging if an OS socket buffer lingers
        setTimeout(resolve, 100)
      } else {
        resolve()
      }
    })
  }

  private handleSocketData(socketId: string, buffer: Buffer): void {
    if (buffer.length < 2) return

    const opcode = buffer[0] & 0x0f
    if (opcode === 8) {
      // Close frame
      this.handleSocketClose(socketId)
      return
    }
    if (opcode !== 1) {
      // Only text frames accepted
      return
    }

    const isMasked = (buffer[1] & 0x80) !== 0
    let payloadLen = buffer[1] & 0x7f
    let offset = 2

    if (payloadLen === 126) {
      if (buffer.length < 4) return
      payloadLen = buffer.readUInt16BE(2)
      offset = 4
    } else if (payloadLen === 127) {
      if (buffer.length < 10) return
      payloadLen = Number(buffer.readBigUInt64BE(2))
      offset = 10
    }

    if (payloadLen > this.relay.limits.maxMessageBytes) {
      this.sendError(socketId, 'Message exceeds 64 KiB limit')
      return
    }

    let payload: Buffer
    if (isMasked) {
      if (buffer.length < offset + 4 + payloadLen) return
      const mask = buffer.subarray(offset, offset + 4)
      offset += 4
      payload = Buffer.alloc(payloadLen)
      for (let i = 0; i < payloadLen; i++) {
        payload[i] = buffer[offset + i] ^ mask[i % 4]
      }
    } else {
      payload = buffer.subarray(offset, offset + payloadLen)
    }

    try {
      const text = payload.toString('utf8')
      const parsed = JSON.parse(text)
      const validation = this.relay.validateMessage(parsed)
      if (!validation.valid || !validation.message) {
        this.sendError(socketId, validation.error || 'Invalid message')
        return
      }

      const msg = validation.message
      const client = this.sockets.get(socketId)
      if (client) {
        client.peerId = msg.senderId
        client.roomCode = msg.roomCode
      }

      if (msg.type === 'join') {
        const res = this.relay.joinRoom(msg.roomCode, msg.senderId)
        if (!res.ok) {
          this.sendError(socketId, res.error || 'Failed to join room')
          return
        }
      }

      this.relay.relayMessage(msg, (targetPeerId, relayedMsg) => {
        this.sendToPeer(targetPeerId, relayedMsg)
      })
    } catch {
      this.sendError(socketId, 'Malformed JSON')
    }
  }

  private handleSocketClose(socketId: string): void {
    const client = this.sockets.get(socketId)
    if (client && client.roomCode && client.peerId) {
      this.relay.leaveRoom(client.roomCode, client.peerId)
      this.relay.relayMessage(
        { type: 'leave', roomCode: client.roomCode, senderId: client.peerId },
        (targetPeerId, msg) => {
          this.sendToPeer(targetPeerId, msg)
        }
      )
    }
    this.sockets.delete(socketId)
  }

  private sendToPeer(peerId: string, msg: SignallingMessage): void {
    for (const client of this.sockets.values()) {
      if (client.peerId === peerId) {
        this.sendFrame(client.socket, JSON.stringify(msg))
        break
      }
    }
  }

  private sendError(socketId: string, error: string): void {
    const client = this.sockets.get(socketId)
    if (client) {
      const msg: SignallingMessage = {
        type: 'error',
        roomCode: client.roomCode || '',
        senderId: 'server',
        payload: { error },
      }
      this.sendFrame(client.socket, JSON.stringify(msg))
    }
  }

  private sendFrame(socket: Socket, data: string): void {
    try {
      const payload = Buffer.from(data, 'utf8')
      const len = payload.length
      let header: Buffer
      if (len < 126) {
        header = Buffer.from([0x81, len])
      } else if (len < 65536) {
        header = Buffer.alloc(4)
        header[0] = 0x81
        header[1] = 126
        header.writeUInt16BE(len, 2)
      } else {
        header = Buffer.alloc(10)
        header[0] = 0x81
        header[1] = 127
        header.writeBigUInt64BE(BigInt(len), 2)
      }
      socket.write(Buffer.concat([header, payload]))
    } catch { /* ignore */ }
  }
}
