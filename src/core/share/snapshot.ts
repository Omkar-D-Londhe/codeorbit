/**
 * Peer Challenge Snapshots (Stage 18b, Catalog 17.3).
 * Encodes challenge snapshots into base64url URL fragments with deflate compression and strict 8 KB cap.
 */

import { getTrack } from '../content/registry'

export const MAX_SNAPSHOT_LINK_BYTES = 8192 // 8 KB hard cap (§8, §11)
export const MAX_SNAPSHOT_TITLE_LENGTH = 100
export const MAX_SNAPSHOT_FILES = 10
export const MAX_FILE_CONTENT_BYTES = 65536 // 64 KB per file limit

export interface SnapshotFile {
  name: string
  content: string
}

export interface SnapshotV1 {
  v: 1
  trackId: string
  title: string
  files: SnapshotFile[]
}

export interface EncodeResult {
  ok: boolean
  hash?: string
  url?: string
  size: number
  limit: number
  error?: string
}

export interface DecodeResult {
  ok: boolean
  snapshot?: SnapshotV1
  error?: string
}

// Base64URL conversions (RFC 4648)
export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlToBytes(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  const binary = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Checks if CompressionStream and DecompressionStream are available.
 */
export function hasCompressionStream(): boolean {
  return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined'
}

/**
 * Compresses bytes using Deflate.
 */
async function compressDeflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Response(
    new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'))
  )
  const buffer = await stream.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * Decompresses Deflate bytes.
 */
async function decompressDeflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Response(
    new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate'))
  )
  const buffer = await stream.arrayBuffer()
  return new Uint8Array(buffer)
}

/**
 * Validates the schema and bounds of an untrusted snapshot object.
 */
export function validateSnapshotSchema(data: unknown): { valid: boolean; snapshot?: SnapshotV1; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Snapshot data must be a JSON object.' }
  }

  const obj = data as Record<string, unknown>

  if (obj.v !== 1) {
    return { valid: false, error: `Unsupported snapshot version: ${String(obj.v)}. Expected version 1.` }
  }

  if (typeof obj.trackId !== 'string' || !obj.trackId.trim()) {
    return { valid: false, error: 'Snapshot trackId is required.' }
  }

  const track = getTrack(obj.trackId)
  if (!track) {
    return { valid: false, error: `Unknown or uninstalled track: "${obj.trackId}".` }
  }

  if (typeof obj.title !== 'string' || !obj.title.trim()) {
    return { valid: false, error: 'Snapshot title is required.' }
  }

  if (obj.title.trim().length > MAX_SNAPSHOT_TITLE_LENGTH) {
    return { valid: false, error: `Snapshot title exceeds maximum length of ${MAX_SNAPSHOT_TITLE_LENGTH} characters.` }
  }

  if (!Array.isArray(obj.files) || obj.files.length === 0) {
    return { valid: false, error: 'Snapshot must contain at least one file.' }
  }

  if (obj.files.length > MAX_SNAPSHOT_FILES) {
    return { valid: false, error: `Snapshot contains too many files (max: ${MAX_SNAPSHOT_FILES}).` }
  }

  const validatedFiles: SnapshotFile[] = []

  for (let i = 0; i < obj.files.length; i++) {
    const f = obj.files[i]
    if (!f || typeof f !== 'object') {
      return { valid: false, error: `Invalid file entry at index ${i}.` }
    }
    const fileObj = f as Record<string, unknown>
    if (typeof fileObj.name !== 'string' || !fileObj.name.trim()) {
      return { valid: false, error: `File at index ${i} is missing a filename.` }
    }
    if (typeof fileObj.content !== 'string') {
      return { valid: false, error: `File "${fileObj.name}" content must be a string.` }
    }
    if (new TextEncoder().encode(fileObj.content).byteLength > MAX_FILE_CONTENT_BYTES) {
      return { valid: false, error: `File "${fileObj.name}" exceeds maximum allowed content size (64 KB).` }
    }

    validatedFiles.push({
      name: fileObj.name.trim(),
      content: fileObj.content,
    })
  }

  return {
    valid: true,
    snapshot: {
      v: 1,
      trackId: obj.trackId.trim(),
      title: obj.title.trim(),
      files: validatedFiles,
    },
  }
}

/**
 * Encodes a SnapshotV1 into a base64url string with compression (if available).
 * Enforces the strict 8 KB hard cap on the resulting hash payload.
 */
export async function encodeSnapshot(snapshot: SnapshotV1, baseUrl = ''): Promise<EncodeResult> {
  const validation = validateSnapshotSchema(snapshot)
  if (!validation.valid || !validation.snapshot) {
    return {
      ok: false,
      size: 0,
      limit: MAX_SNAPSHOT_LINK_BYTES,
      error: validation.error || 'Invalid snapshot schema',
    }
  }

  const json = JSON.stringify(validation.snapshot)
  const rawBytes = new TextEncoder().encode(json)

  let prefix: string
  let encodedPayload: string

  if (hasCompressionStream()) {
    try {
      const compressed = await compressDeflate(rawBytes)
      const compressedPayload = bytesToBase64Url(compressed)
      // Only use compression if it actually saves space or is equal
      if (compressedPayload.length <= bytesToBase64Url(rawBytes).length) {
        prefix = 'c.'
        encodedPayload = compressedPayload
      } else {
        prefix = 'u.'
        encodedPayload = bytesToBase64Url(rawBytes)
      }
    } catch {
      prefix = 'u.'
      encodedPayload = bytesToBase64Url(rawBytes)
    }
  } else {
    prefix = 'u.'
    encodedPayload = bytesToBase64Url(rawBytes)
  }

  const hash = `#snapshot=${prefix}${encodedPayload}`
  const size = hash.length

  if (size > MAX_SNAPSHOT_LINK_BYTES) {
    return {
      ok: false,
      size,
      limit: MAX_SNAPSHOT_LINK_BYTES,
      error: `Snapshot exceeds the 8 KB link-size limit (${(size / 1024).toFixed(1)} KB of 8.0 KB max). Reduce file contents or remove extra files.`,
    }
  }

  const fullUrl = baseUrl ? `${baseUrl}${hash}` : hash

  return {
    ok: true,
    hash,
    url: fullUrl,
    size,
    limit: MAX_SNAPSHOT_LINK_BYTES,
  }
}

/**
 * Decodes a SnapshotV1 from a URL hash string or encoded snapshot token.
 * Validates the schema, track validity, and bounds.
 */
export async function decodeSnapshot(hashOrToken: string): Promise<DecodeResult> {
  try {
    let token = hashOrToken.trim()
    if (token.startsWith('#')) {
      token = token.slice(1)
    }
    if (token.startsWith('snapshot=')) {
      token = token.slice('snapshot='.length)
    }

    if (!token) {
      return { ok: false, error: 'No snapshot payload found in URL.' }
    }

    if (token.length > MAX_SNAPSHOT_LINK_BYTES) {
      return { ok: false, error: 'Snapshot link exceeds maximum allowable size (8 KB).' }
    }

    let isCompressed = false
    let rawPayload = token

    if (token.startsWith('c.')) {
      isCompressed = true
      rawPayload = token.slice(2)
    } else if (token.startsWith('u.')) {
      isCompressed = false
      rawPayload = token.slice(2)
    }

    const bytes = base64UrlToBytes(rawPayload)

    let jsonString = ''
    if (isCompressed && hasCompressionStream()) {
      try {
        const decompressed = await decompressDeflate(bytes)
        jsonString = new TextDecoder().decode(decompressed)
      } catch {
        return { ok: false, error: 'Failed to decompress snapshot payload. The link may be corrupted.' }
      }
    } else {
      jsonString = new TextDecoder().decode(bytes)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonString)
    } catch {
      return { ok: false, error: 'Malformed snapshot JSON payload.' }
    }

    const validation = validateSnapshotSchema(parsed)
    if (!validation.valid || !validation.snapshot) {
      return { ok: false, error: validation.error || 'Snapshot schema validation failed.' }
    }

    return {
      ok: true,
      snapshot: validation.snapshot,
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to decode challenge snapshot.',
    }
  }
}
