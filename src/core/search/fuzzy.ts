export interface FuzzyMatch {
  score: number
  ranges: Array<[number, number]>
}

/**
 * 9.2 Fuzzy Search Matcher: Subsequence matcher with scoring bonuses
 * for consecutive characters, word boundaries, and exact case matching.
 * Returns consolidated highlight ranges [start, end) or null.
 */
export function fuzzy(query: string, text: string): FuzzyMatch | null {
  if (!query) {
    return { score: 0, ranges: [] }
  }
  if (!text) {
    return null
  }

  const q = query.toLowerCase()
  const t = text.toLowerCase()

  if (q.length > t.length) {
    return null
  }

  const matchedIndices: number[] = []
  let tIdx = 0

  for (let qIdx = 0; qIdx < q.length; qIdx++) {
    const qChar = q[qIdx]
    let found = -1
    let firstFound = -1

    for (let i = tIdx; i < t.length; i++) {
      if (t[i] === qChar) {
        if (firstFound === -1) firstFound = i
        const isWordStart =
          i === 0 ||
          /[\s\-_/.]/.test(text[i - 1]) ||
          (/[A-Z]/.test(text[i]) && !/[A-Z]/.test(text[i - 1]))

        if (isWordStart) {
          found = i
          break
        }
      }
    }

    if (found === -1) {
      found = firstFound
    }

    if (found === -1) {
      return null
    }

    matchedIndices.push(found)
    tIdx = found + 1
  }

  let score = 100
  let consecutive = 0
  const ranges: Array<[number, number]> = []

  let rangeStart = matchedIndices[0]
  let prevIdx = matchedIndices[0]

  for (let i = 0; i < matchedIndices.length; i++) {
    const idx = matchedIndices[i]

    score += 10

    if (query[i] === text[idx]) {
      score += 5
    }

    const isWordStart =
      idx === 0 ||
      /[\s\-_/.]/.test(text[idx - 1]) ||
      (/[A-Z]/.test(text[idx]) && !/[A-Z]/.test(text[idx - 1]))

    if (isWordStart) {
      score += 20
    }

    if (i > 0) {
      if (idx === prevIdx + 1) {
        consecutive++
        score += consecutive * 15
      } else {
        ranges.push([rangeStart, prevIdx + 1])
        rangeStart = idx
        consecutive = 0
        score -= (idx - prevIdx - 1) * 2
      }
    }
    prevIdx = idx
  }
  ranges.push([rangeStart, prevIdx + 1])

  score -= Math.round((text.length - query.length) * 0.5)

  return { score, ranges }
}
