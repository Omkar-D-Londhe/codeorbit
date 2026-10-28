let loaded = false

/**
 * Dynamically loads Atkinson Hyperlegible font when dyslexia-friendly font mode is enabled.
 * Keeps font files out of the critical bundle when disabled (Spec §7.3, §11).
 */
export async function loadDyslexiaFont(): Promise<void> {
  if (loaded || typeof window === 'undefined') return
  try {
    await import('@fontsource/atkinson-hyperlegible')
    loaded = true
  } catch (err) {
    console.warn('Failed to dynamically load Atkinson Hyperlegible font:', err)
  }
}
