import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.resolve(__dirname, '../public/icons')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// CRC32 table
const crcTable = []
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = -1
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff]
  }
  return (crc ^ -1) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crc])
}

function renderCodeOrbitIcon(size, isMaskable = false) {
  const width = size
  const height = size
  const raw = Buffer.alloc(height * (1 + width * 4))

  // Colors
  const bg = [25, 27, 37, 255]       // #191B25
  const arc = [154, 139, 255, 255]   // #9A8BFF
  const orb = [195, 244, 119, 255]   // #C3F477

  const cornerRadius = isMaskable ? 0 : Math.round(size * 0.25)

  // Geometric centers relative to 32px viewBox
  const orbCx = size * (16 / 32)
  const orbCy = size * (11 / 32)
  const orbR = size * (3 / 32)

  const arcCx = size * (16 / 32)
  const arcCy = size * (22 / 32)
  const arcR = size * (11 / 32)
  const strokeW = size * (2.4 / 32)

  let pos = 0
  for (let y = 0; y < height; y++) {
    raw[pos++] = 0 // filter byte: none
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0

      // Check rounded corner boundary
      let inCard = false
      if (isMaskable) {
        inCard = true
      } else {
        const dx = Math.min(x, width - 1 - x)
        const dy = Math.min(y, height - 1 - y)
        if (dx >= cornerRadius || dy >= cornerRadius) {
          inCard = true
        } else {
          const cornerDist = Math.hypot(cornerRadius - dx, cornerRadius - dy)
          if (cornerDist <= cornerRadius) {
            inCard = true
          }
        }
      }

      if (inCard) {
        r = bg[0]
        g = bg[1]
        b = bg[2]
        a = bg[3]

        // Orbit arc (upper half of circle at arcCx, arcCy with radius arcR)
        const distToArcCenter = Math.hypot(x - arcCx, y - arcCy)
        const distFromArc = Math.abs(distToArcCenter - arcR)
        const isUpperHalf = y <= arcCy + strokeW * 0.5
        const inAngleRange = x >= arcCx - arcR - strokeW && x <= arcCx + arcR + strokeW

        if (distFromArc <= strokeW * 0.5 && isUpperHalf && inAngleRange) {
          // Antialias factor (simple distance clamp)
          const factor = Math.max(0, Math.min(1, 1 - (distFromArc / (strokeW * 0.5))))
          r = Math.round(r * (1 - factor) + arc[0] * factor)
          g = Math.round(g * (1 - factor) + arc[1] * factor)
          b = Math.round(b * (1 - factor) + arc[2] * factor)
        }

        // Orb circle at orbCx, orbCy
        const distToOrb = Math.hypot(x - orbCx, y - orbCy)
        if (distToOrb <= orbR) {
          const factor = Math.max(0, Math.min(1, (orbR - distToOrb) + 0.5))
          r = Math.round(r * (1 - factor) + orb[0] * factor)
          g = Math.round(g * (1 - factor) + orb[1] * factor)
          b = Math.round(b * (1 - factor) + orb[2] * factor)
        }
      }

      raw[pos++] = r
      raw[pos++] = g
      raw[pos++] = b
      raw[pos++] = a
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const idat = zlib.deflateSync(raw, { level: 9 })
  const iend = Buffer.alloc(0)

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', iend),
  ])
}

const sizes = [192, 512]
for (const s of sizes) {
  // Standard icon
  const standardPng = renderCodeOrbitIcon(s, false)
  fs.writeFileSync(path.join(outDir, `icon-${s}.png`), standardPng)
  console.log(`Generated icon-${s}.png (${standardPng.length} bytes)`)

  // Maskable icon (safe area / full bleed)
  const maskablePng = renderCodeOrbitIcon(s, true)
  fs.writeFileSync(path.join(outDir, `icon-${s}-maskable.png`), maskablePng)
  console.log(`Generated icon-${s}-maskable.png (${maskablePng.length} bytes)`)
}

// Also write icon.svg
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#191B25"/>
  <path d="M80 352 A176 176 0 0 1 432 352" fill="none" stroke="#9A8BFF" stroke-width="38.4" stroke-linecap="round"/>
  <circle cx="256" cy="176" r="48" fill="#C3F477"/>
</svg>`
fs.writeFileSync(path.join(outDir, 'icon.svg'), svgIcon)
console.log('Generated icon.svg')
