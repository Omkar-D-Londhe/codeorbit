/** Keyboard model shared by the topic strip and the arc: logical curriculum order, not pixel proximity. */
export function nextIdForKey(key: string, ids: readonly string[], currentId: string): string | null {
  const i = ids.indexOf(currentId)
  if (i < 0 || ids.length === 0) return null
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return ids[Math.min(i + 1, ids.length - 1)]
    case 'ArrowLeft':
    case 'ArrowUp':
      return ids[Math.max(i - 1, 0)]
    case 'Home':
      return ids[0]
    case 'End':
      return ids[ids.length - 1]
    default:
      return null
  }
}
