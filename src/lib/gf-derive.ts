import type { Repository } from '@/store'
import type { LangSlice } from '@/components/gf/charts'

/** Short relative time, e.g. "2d", "3w" (no "ago" suffix). */
export function rel(dateStr?: string | null): string {
  if (!dateStr) return 'never'
  const s = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  if (s < 2629800) return `${Math.floor(s / 604800)}w`
  if (s < 31557600) return `${Math.floor(s / 2629800)}mo`
  return `${Math.floor(s / 31557600)}y`
}

/** Top-N language slices by bytes (falls back to per-repo primary language counts). */
export function deriveLanguages(repos: Repository[], topN = 6): LangSlice[] {
  const bytes: Record<string, number> = {}
  repos.forEach((r) => {
    const langs = r.languages || {}
    Object.entries(langs).forEach(([k, v]) => { bytes[k] = (bytes[k] || 0) + Number(v) })
  })
  let sum = Object.values(bytes).reduce((a, b) => a + b, 0)
  let entries = Object.entries(bytes)
  if (sum === 0) {
    const counts: Record<string, number> = {}
    repos.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1 })
    entries = Object.entries(counts)
    sum = Object.values(counts).reduce((a, b) => a + b, 0)
  }
  if (sum === 0) return []
  return entries.sort((a, b) => b[1] - a[1]).slice(0, topN).map(([name, v]) => ({ name, pct: (v / sum) * 100 }))
}

export type ContribDay = { date: string; count: number }

/** GitHub daily contribution calendar → 53×7 grid (grid[week][weekday], weekday 0=Sun). */
export function contributionsToGrid(days: ContribDay[]): number[][] {
  const grid: number[][] = Array.from({ length: 53 }, () => Array(7).fill(0))
  if (!days.length) return grid
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const first = new Date(sorted[0].date + 'T00:00:00Z')
  const startCol = first.getUTCDay() // pad the first (partial) week so columns land on the right weekday
  for (const d of sorted) {
    const dt = new Date(d.date + 'T00:00:00Z')
    const offset = Math.round((dt.getTime() - first.getTime()) / 86400000) + startCol
    const week = Math.floor(offset / 7)
    if (week >= 0 && week < 53) grid[week][dt.getUTCDay()] = d.count
  }
  return grid
}

/** Total contributions in the calendar. */
export function contributionsTotal(days: ContribDay[]): number {
  return days.reduce((s, d) => s + d.count, 0)
}

/** Contribution counts summed by weekday (index 0=Sun … 6=Sat). */
export function contributionsByWeekday(days: ContribDay[]): number[] {
  const out = Array(7).fill(0)
  for (const d of days) out[new Date(d.date + 'T00:00:00Z').getUTCDay()] += d.count
  return out
}

/** Contribution counts bucketed into the last 12 calendar months. */
export function contributionsByMonth(days: ContribDay[], now = new Date()): { label: string; value: number }[] {
  const buckets = Array(12).fill(0)
  const labels: string[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - i), 1))
    labels.push(d.toLocaleString('en', { month: 'short', timeZone: 'UTC' }))
  }
  for (const d of days) {
    const dt = new Date(d.date + 'T00:00:00Z')
    const monthsAgo = (now.getUTCFullYear() - dt.getUTCFullYear()) * 12 + (now.getUTCMonth() - dt.getUTCMonth())
    if (monthsAgo >= 0 && monthsAgo < 12) buckets[11 - monthsAgo] += d.count
  }
  return labels.map((label, i) => ({ label, value: buckets[i] }))
}
