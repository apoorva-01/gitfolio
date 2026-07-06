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
