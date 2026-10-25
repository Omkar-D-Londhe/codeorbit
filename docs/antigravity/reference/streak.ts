/** Date helpers and streaks. Days are LOCAL calendar days as 'YYYY-MM-DD' strings. */

const pad = (n: number): string => String(n).padStart(2, '0')

export function dayKey(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Whole days since 1970-01-01 for a day key (calendar arithmetic, immune to DST). */
export function epochDay(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

/** Insert a day key keeping the list unique, sorted and bounded. Returns the same array when unchanged. */
export function addDay(days: readonly string[], key: string, max = 400): string[] {
  if (days.includes(key)) return days as string[]
  return [...days, key].sort().slice(-max)
}

export interface StreakInfo {
  /** Consecutive active days ending today or yesterday; 0 if the last activity is older. */
  current: number
  longest: number
  lastActive?: string
  activeToday: boolean
}

export function streakInfo(days: readonly string[], todayKey: string): StreakInfo {
  const nums = Array.from(new Set(days.map(epochDay))).sort((a, b) => a - b)
  if (nums.length === 0) return { current: 0, longest: 0, activeToday: false }
  let longest = 1
  let run = 1
  for (let i = 1; i < nums.length; i++) {
    run = nums[i] === nums[i - 1] + 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }
  const today = epochDay(todayKey)
  const last = nums[nums.length - 1]
  let current = 0
  if (last === today || last === today - 1) {
    current = 1
    for (let i = nums.length - 1; i > 0 && nums[i - 1] === nums[i] - 1; i--) current++
  }
  const lastKey = [...days].sort().slice(-1)[0]
  return { current, longest, lastActive: lastKey, activeToday: last === today }
}
