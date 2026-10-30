/**
 * Tiny embedded media samples for the HTML media-elements topic.
 * Keeps bundle size minimal (< 2 kB total) while providing valid playback data URIs.
 */

// 1-second silent WAV PCM audio sample (50 bytes base64)
export const SAMPLE_AUDIO =
  'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAAAAAAAAAAAAAAAAA'

// Minimal 1-pixel WebM video clip (single frame)
export const SAMPLE_VIDEO =
  'data:video/webm;base64,GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYUkoakECPQa5FAES4QoN1AQAAAAAAAMYAAAGBAkKFgQIYUkoakECPQa5FAES4QoN1AQAAAAAAAMYAAAGB'
