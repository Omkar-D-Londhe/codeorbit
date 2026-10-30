export interface HighlightTarget {
  selector: string
  candidateSelectors?: string[]
  label: string
  route?: string
}

let activeHighlight: HighlightTarget | null = null
const listeners = new Set<(target: HighlightTarget | null) => void>()

export function setPendingHighlight(target: HighlightTarget | null): void {
  activeHighlight = target
  listeners.forEach((listener) => listener(activeHighlight))
}

export function getPendingHighlight(): HighlightTarget | null {
  return activeHighlight
}

export function clearPendingHighlight(): void {
  setPendingHighlight(null)
}

export function subscribeHighlight(
  listener: (target: HighlightTarget | null) => void
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
