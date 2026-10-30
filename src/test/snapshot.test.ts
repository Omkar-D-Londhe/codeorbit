import { describe, it, expect } from 'vitest'
import {
  encodeSnapshot,
  decodeSnapshot,
  validateSnapshotSchema,
  MAX_SNAPSHOT_LINK_BYTES,
  type SnapshotV1,
} from '../core/share/snapshot'
import '../app/registerTracks' // Ensure tracks are registered

describe('Stage 18b — Peer Challenge Snapshots (snapshot.ts)', () => {
  const validSnapshot: SnapshotV1 = {
    v: 1,
    trackId: 'html',
    title: 'Semantic Article Card',
    files: [
      {
        name: 'index.html',
        content: '<article>\n  <h2>Title</h2>\n  <p>Content</p>\n</article>',
      },
    ],
  }

  it('validates schema correctly for valid snapshots', () => {
    const res = validateSnapshotSchema(validSnapshot)
    expect(res.valid).toBe(true)
    expect(res.snapshot?.title).toBe('Semantic Article Card')
    expect(res.snapshot?.trackId).toBe('html')
  })

  it('rejects snapshots with unsupported version', () => {
    const invalid = { ...validSnapshot, v: 2 }
    const res = validateSnapshotSchema(invalid)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Unsupported snapshot version')
  })

  it('rejects snapshots with unknown trackId', () => {
    const invalid = { ...validSnapshot, trackId: 'ruby-on-rails-unknown' }
    const res = validateSnapshotSchema(invalid)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('Unknown or uninstalled track')
  })

  it('rejects snapshots with empty or missing files', () => {
    const invalid = { ...validSnapshot, files: [] }
    const res = validateSnapshotSchema(invalid)
    expect(res.valid).toBe(false)
    expect(res.error).toContain('must contain at least one file')
  })

  it('encodes and decodes round-trip accurately', async () => {
    const encoded = await encodeSnapshot(validSnapshot, 'https://codeorbit.test/share')
    expect(encoded.ok).toBe(true)
    expect(encoded.url).toBeDefined()
    expect(encoded.hash).toBeDefined()
    expect(encoded.size).toBeLessThan(MAX_SNAPSHOT_LINK_BYTES)

    const decoded = await decodeSnapshot(encoded.hash!)
    expect(decoded.ok).toBe(true)
    expect(decoded.snapshot).toEqual(validSnapshot)
  })

  it('handles decoding with or without # or snapshot= prefix', async () => {
    const encoded = await encodeSnapshot(validSnapshot)
    expect(encoded.ok).toBe(true)

    // With #snapshot=
    const d1 = await decodeSnapshot(encoded.hash!)
    expect(d1.ok).toBe(true)

    // Without #
    const d2 = await decodeSnapshot(encoded.hash!.replace(/^#/, ''))
    expect(d2.ok).toBe(true)

    // Raw token only
    const d3 = await decodeSnapshot(encoded.hash!.replace(/^#snapshot=/, ''))
    expect(d3.ok).toBe(true)
  })

  it('enforces the strict 8 KB link-size cap', async () => {
    // Generate a payload that exceeds 8 KB when compressed or uncompressed
    const hugeContent = 'a'.repeat(20000)
    const oversizedSnapshot: SnapshotV1 = {
      v: 1,
      trackId: 'html',
      title: 'Oversized Challenge',
      files: [
        {
          name: 'large.html',
          content: hugeContent,
        },
      ],
    }

    const res = await encodeSnapshot(oversizedSnapshot)
    expect(res.ok).toBe(false)
    expect(res.error).toContain('8 KB link-size limit')
  })

  it('rejects malformed base64url or corrupted tokens', async () => {
    const res = await decodeSnapshot('#snapshot=u.NOT_VALID_BASE64_!!!')
    expect(res.ok).toBe(false)
  })

  it('preserves script and HTML tags safely as plain inert strings (no execution on decode)', async () => {
    const maliciousPayload: SnapshotV1 = {
      v: 1,
      trackId: 'html',
      title: '<script>alert("xss")</script>',
      files: [
        {
          name: 'index.html',
          content: '<img src=x onerror="alert(1)">',
        },
      ],
    }

    const encoded = await encodeSnapshot(maliciousPayload)
    const decoded = await decodeSnapshot(encoded.hash!)

    expect(decoded.ok).toBe(true)
    expect(decoded.snapshot?.title).toBe('<script>alert("xss")</script>')
    expect(decoded.snapshot?.files[0].content).toBe('<img src=x onerror="alert(1)">')
  })
})
