'use client'

import { useEffect, useState } from 'react'

const chartData: Record<string, { commits: string; added: string; removed: string; change: string; bars: string[]; sparkData: number[][]; contribValues: number[] }> = {
  week: { commits: '124', added: '432', removed: '198', change: '↑ 5%', bars: ['30%','45%','20%','55%','40%','35%','60%','50%','38%','42%','48%','52%','35%','28%'], sparkData: [[40,60,35,80,55,90,70],[55,70,45,85,65,95,75],[30,50,25,60,40,55,35]], contribValues: [42, 8, 3, 12, 2] },
  month: { commits: '487', added: '1,234', removed: '456', change: '↑ 23%', bars: ['60%','80%','45%','90%','70%','55%','85%','40%','75%','65%','95%','50%','80%','60%'], sparkData: [[40,60,35,80,55,90,70],[55,70,45,85,65,95,75],[30,50,25,60,40,55,35]], contribValues: [487, 23, 12, 34, 8] },
  year: { commits: '2,847', added: '12,456', removed: '4,321', change: '↑ 45%', bars: ['40%','55%','60%','75%','80%','65%','70%','85%','90%','75%','60%','55%','70%','65%'], sparkData: [[50,65,55,80,70,85,75],[60,75,65,90,80,95,85],[40,55,45,70,60,75,50]], contribValues: [2847, 156, 89, 234, 45] },
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  'C++': '#f34b7d',
  'C#': '#178600',
  PHP: '#4F5D95',
  Swift: '#ffac45',
  Kotlin: '#F18E33',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Lua: '#000080',
}

const contribItems = [
  { label: 'Commits', color: '#58a6ff', icon: <><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></> },
  { label: 'Pull Requests', color: '#3fb950', icon: <><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></> },
  { label: 'Issues', color: '#d29922', icon: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></> },
  { label: 'Reviews', color: '#a371f7', icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></> },
  { label: 'Discussions', color: '#f85149', icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> },
]

const CIRCUMFERENCE = 2 * Math.PI * 40

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [hoveredLang, setHoveredLang] = useState<string | null>(null)
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => setApiData(d))
      .catch(() => {})
  }, [])

  const periodData = chartData[period]

  const displayData = {
    healthScore: apiData?.totalHealthScore?.toLocaleString() || '487',
    stars: apiData?.totalStars?.toLocaleString() || '1,234',
    forks: apiData?.totalForks?.toLocaleString() || '456',
    repos: apiData?.totalRepos?.toLocaleString() || '47',
  }

  const langEntries = apiData?.languageDistribution
    ? Object.entries(apiData.languageDistribution as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
    : []

  const totalLangCount = langEntries.reduce((s, [, c]) => s + (c as number), 0)
  let donutOffset = 0
  const donutSegments = totalLangCount > 0
    ? langEntries.map(([lang, count]) => {
        const pct = (count as number) / totalLangCount
        const dash = pct * CIRCUMFERENCE
        const seg = { lang: lang as string, dash, offset: donutOffset, color: LANG_COLORS[lang as string] || '#636e72' }
        donutOffset -= dash
        return seg
      })
    : []

  const topRepos = apiData?.topRepos || []

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-[28px] font-semibold" style={{ color: 'var(--color-text)' }}>Analytics</h1>
        <div className="flex gap-2">
          {['Week', 'Month', 'Year'].map((f) => {
            const key = f.toLowerCase()
            return (
              <button
                key={f}
                onClick={() => setPeriod(key)}
                className="px-3.5 py-2 text-sm rounded cursor-pointer transition-colors"
                style={{
                  background: period === key ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                  border: `1px solid ${period === key ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  color: period === key ? 'var(--color-text)' : 'var(--color-text-secondary)',
                }}
              >
                {f}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[
          { value: displayData.repos, label: 'Total Repositories', color: '#58a6ff', statKey: 'repo' },
          { value: displayData.stars, label: 'Total Stars', color: '#d29922', statKey: 'stars' },
          { value: displayData.healthScore, label: 'Health Score', color: '#3fb950', statKey: 'health' },
        ].map((s, idx) => {
          return (
            <div
              key={s.label}
              className="p-5 rounded-lg transition-all"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-[28px] font-bold" style={{ color: 'var(--color-text)' }}>{s.value}</div>
                <div
                  className="w-9 h-9 flex items-center justify-center rounded"
                  style={{ background: `${s.color}26`, color: s.color }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {s.statKey === 'repo' && <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>}
                    {s.statKey === 'stars' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
                    {s.statKey === 'health' && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
                  </svg>
                </div>
              </div>
              <div className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Synced from GitHub
              </div>
              <div className="flex items-end gap-1 h-8 mt-3">
                {periodData.sparkData[idx]?.map((h: number, i: number) => (
                  <div key={i} className="flex-1 rounded-sm transition-all" style={{ height: `${h}%`, background: s.color }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-6">
        <div className="p-5 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Commit Activity (Last 30 Days)</h2>
          <div className="flex items-end gap-2 h-48 px-2 relative">
            {periodData.bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 relative"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div
                  className="rounded-t transition-all cursor-pointer"
                  style={{
                    height: h,
                    background: hoveredBar === i ? 'var(--color-success)' : 'var(--color-accent)',
                  }}
                />
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{i + 1}</div>
                {hoveredBar === i && (
                  <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 rounded-lg px-3 py-2 text-xs whitespace-nowrap"
                    style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <div className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Day {i + 1}</div>
                    <div style={{ color: 'var(--color-text-secondary)' }}>Commits: {Math.round(parseInt(periodData.commits) * (parseInt(h) / 100))}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Language Distribution</h2>
          {donutSegments.length > 0 ? (
            <>
              <div className="flex flex-col items-center relative">
                <svg viewBox="0 0 100 100" width="180" height="180" className="transform -rotate-90">
                  {donutSegments.map((s) => (
                    <circle
                      key={s.lang}
                      cx="50" cy="50" r="40"
                      fill="transparent"
                      stroke={s.color}
                      strokeWidth="20"
                      strokeDasharray={`${s.dash} ${CIRCUMFERENCE}`}
                      strokeDashoffset={s.offset}
                      className="cursor-pointer transition-opacity"
                      style={{ opacity: hoveredLang && hoveredLang !== s.lang ? 0.3 : 1 }}
                      onMouseEnter={() => setHoveredLang(s.lang)}
                      onMouseLeave={() => setHoveredLang(null)}
                    />
                  ))}
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{apiData?.totalRepos || 0}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>repos</div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {langEntries.map(([lang, count]) => {
                  const pct = totalLangCount > 0 ? Math.round(((count as number) / totalLangCount) * 100) : 0
                  const color = LANG_COLORS[lang as string] || '#636e72'
                  return (
                    <div
                      key={lang}
                      className="flex items-center gap-1.5 text-sm px-2 py-1 rounded cursor-pointer transition-all"
                      style={{
                        color: hoveredLang && hoveredLang !== lang ? 'var(--color-text-muted)' : 'var(--color-text-secondary)',
                        background: hoveredLang === lang ? 'var(--color-surface-hover)' : 'transparent',
                      }}
                      onMouseEnter={() => setHoveredLang(lang)}
                      onMouseLeave={() => setHoveredLang(null)}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      {lang} {pct}%
                    </div>
                  )
                })}
              </div>
              {hoveredLang && (() => {
                const entry = langEntries.find(([l]) => l === hoveredLang)
                if (!entry) return null
                const [, count] = entry
                return (
                  <div
                    className="mt-3 text-xs rounded-lg px-3 py-2"
                    style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <span className="font-semibold">{hoveredLang}</span>
                    <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>{count as number} repos</span>
                  </div>
                )
              })()}
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: 'var(--color-text-muted)' }}>
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Top Repositories by Activity</h2>
          <div className="flex flex-col gap-3">
            {topRepos.length > 0 ? (
              topRepos.map((r: { name: string; stars: number; forks: number; commits: number }, _i: number, arr: { name: string; stars: number; forks: number; commits: number }[]) => {
                const maxCommits = Math.max(...arr.map(x => x.commits), 1)
                const pct = (r.commits / maxCommits) * 100
                return (
                  <div key={r.name} className="flex items-center gap-4 py-2">
                    <span className="text-sm min-w-[140px]" style={{ color: 'var(--color-accent)' }}>{r.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--color-accent)' }} />
                    </div>
                    <span className="text-sm font-semibold min-w-[40px] text-right" style={{ color: 'var(--color-text-muted)' }}>{r.commits}</span>
                  </div>
                )
              })
            ) : (
              <div className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>No repositories yet</div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--color-text)' }}>Contribution Breakdown</h2>
          <div className="flex flex-col gap-4">
            {contribItems.map((c, i) => (
              <div key={c.label} className="flex items-center gap-3 py-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="2">
                  {c.icon}
                </svg>
                <span className="flex-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>{c.label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {i === 0 ? (apiData?.totalHealthScore?.toLocaleString() || periodData.contribValues[0]) : periodData.contribValues[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
