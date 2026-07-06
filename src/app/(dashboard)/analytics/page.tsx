'use client'

import type { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { useRepositories } from '@/hooks/useRepositories'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Chip, LangDot } from '@/components/gf/primitives'
import { Bars, Donut, Network, type NetworkData } from '@/components/gf/charts'
import { deriveLanguages } from '@/lib/gf-derive'
import { toast } from '@/components/ui/Toast'
import type { Repository } from '@/store'

function KPI({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <Card padding={16}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: 'var(--text)', lineHeight: 1.1, marginTop: 6 }}>{value}</div>
      {delta != null && (
        <div style={{ fontSize: 11, marginTop: 4, color: delta > 0 ? 'var(--success)' : delta < 0 ? 'var(--danger)' : 'var(--text-3)' }}>
          {delta > 0 ? `+${delta}` : delta < 0 ? String(delta) : '±0'} since last sync
        </div>
      )}
    </Card>
  )
}

function CardHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}
      </div>
      {right}
    </div>
  )
}

type Analytics = {
  totalStars: number; totalForks: number; avgHealth: number
  followers: number | null; contributionsTotal: number; hasContributions: boolean
  weekdayActivity: number[]; monthlyActivity: { label: string; value: number }[]
  deltas: { repos: number; stars: number; forks: number; followers: number } | null
}

export default function AnalyticsPage() {
  const { repos, total, isLoading, error } = useRepositories()
  const { data: session } = useSession()
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics')
      if (!res.ok) throw new Error('Failed to load analytics')
      return res.json()
    },
  })
  const username = (session?.user?.name || 'you').split(' ')[0]

  const topNav = (
    <TopNav title="Analytics" subtitle="Activity, languages, and stack · last 12 months" actions={
      <Button variant="ai" size="sm" icon={<Icon.Sparkle size={12} />} onClick={() => { fetch('/api/ai/analyze-profile', { method: 'POST' }).then(() => toast.success('Asking Claude…')) }}>Ask Claude</Button>
    } />
  )

  if (isLoading) return <PageShell topNav={topNav}><div style={{ padding: 24, color: 'var(--text-3)' }}>Loading analytics…</div></PageShell>
  if (error) return (
    <PageShell topNav={topNav}>
      <div style={{ padding: 24 }}><Card padding={20}><p style={{ color: 'var(--danger)', marginBottom: 12 }}>Failed to load analytics.</p><Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Retry</Button></Card></div>
    </PageShell>
  )

  const totalStars = repos.reduce((s: number, r: Repository) => s + (r.stargazersCount || 0), 0)
  const totalForks = repos.reduce((s: number, r: Repository) => s + (r.forksCount || 0), 0)
  const avgHealth = repos.length ? Math.round(repos.reduce((s: number, r: Repository) => s + (r.healthScore || 0), 0) / repos.length) : 0
  const langs = deriveLanguages(repos, 5)
  const deltas = analytics?.deltas ?? null
  const realActivity = !!analytics?.hasContributions

  // contributions per month (real) — fall back to repo push activity until first sync
  const perMonthFallback = Array(12).fill(0)
  repos.forEach((r: Repository) => {
    if (!r.pushedAt) return
    const m = Math.floor((Date.now() - new Date(r.pushedAt).getTime()) / 2629800000)
    if (m >= 0 && m < 12) perMonthFallback[11 - m]++
  })
  const fallbackLabels = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (11 - i)); return d.toLocaleString('en', { month: 'short' }) })
  const monthlyValues = realActivity ? analytics!.monthlyActivity.map((m) => m.value) : perMonthFallback
  const monthlyLabels = realActivity ? analytics!.monthlyActivity.map((m) => m.label) : fallbackLabels

  // stack graph: me + top languages
  const network: NetworkData = {
    nodes: [
      { id: 'me', name: username, x: 0.5, y: 0.5, repos: total, accent: true },
      ...langs.map((l, i) => {
        const a = (i / Math.max(1, langs.length)) * Math.PI * 2
        return { id: l.name, name: l.name, x: 0.5 + 0.34 * Math.cos(a), y: 0.5 + 0.34 * Math.sin(a), repos: Math.round(l.pct / 5) + 4 }
      }),
    ],
    edges: langs.map((l) => ['me', l.name, 5] as [string, string, number]),
  }

  // activity by weekday (real contributions) — fall back to repo push weekday
  const weekdayFallback = Array(7).fill(0)
  repos.forEach((r: Repository) => { if (r.pushedAt) weekdayFallback[new Date(r.pushedAt).getDay()]++ })
  const weekday = realActivity ? analytics!.weekdayActivity : weekdayFallback
  const weekdayMax = Math.max(1, ...weekday)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <PageShell topNav={topNav}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="gf-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KPI label="Repositories" value={String(total)} delta={deltas?.repos} />
          <KPI label="Total stars" value={totalStars.toLocaleString()} delta={deltas?.stars} />
          <KPI label={analytics?.followers != null ? 'Followers' : 'Total forks'} value={analytics?.followers != null ? analytics.followers.toLocaleString() : String(totalForks)} delta={analytics?.followers != null ? deltas?.followers : deltas?.forks} />
          <KPI label="Avg health" value={`${avgHealth}%`} />
        </div>

        <div className="gf-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Card>
              <CardHead title={realActivity ? 'Contributions per month' : 'Repository activity'} sub={realActivity ? `${analytics!.contributionsTotal.toLocaleString()} in the last year` : 'Repos updated per month · sync for real contributions'} right={<Chip color="var(--accent)" dot>last 12 months</Chip>} />
              <Bars data={monthlyValues} height={140} labels={monthlyLabels} />
            </Card>
            <Card style={{ display: 'flex', flexDirection: 'column' }}>
              <CardHead title="Your stack graph" sub={`${langs.length} core languages`} />
              <div style={{ height: 300 }}><Network data={network} /></div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Card>
              <CardHead title="Language distribution" right={<Chip>by bytes</Chip>} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Donut data={langs} size={150} thickness={24} centerValue={String(new Set(repos.map((r: Repository) => r.language).filter(Boolean)).size)} centerLabel="LANGUAGES" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {langs.map((l) => (
                    <div key={l.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text)' }}><LangDot lang={l.name} />{l.name}</span>
                      <span style={{ color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{l.pct.toFixed(1)}%</span>
                    </div>
                  ))}
                  {langs.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>No language data</span>}
                </div>
              </div>
            </Card>

            <Card padding={16} style={{ borderColor: 'color-mix(in oklab, var(--ai) 25%, var(--border))', background: 'linear-gradient(135deg, var(--ai-soft) 0%, transparent 60%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Icon.Sparkle size={14} style={{ color: 'var(--ai)' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI takeaway</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.55 }}>
                {langs[0]
                  ? <>Your strongest signal is in <b className="gf-ai-text">{langs[0].name}</b> ({langs[0].pct.toFixed(0)}% of your code) across {total} repos with an average health of {avgHealth}%.</>
                  : <>Sync your repositories to generate an AI takeaway on your stack and activity.</>}
              </div>
              <Button variant="ghost" size="sm" iconRight={<Icon.ArrowR size={11} />} style={{ marginTop: 12, paddingLeft: 0 }} onClick={() => { fetch('/api/ai/analyze-profile', { method: 'POST' }).then(() => toast.success('Generating report…')) }}>Generate full report</Button>
            </Card>

            <Card>
              <CardHead title="Activity by weekday" sub={realActivity ? 'From your contribution calendar' : 'From repo push times · sync for real data'} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {weekday.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', width: 30, textTransform: 'uppercase', letterSpacing: 0.6 }}>{days[i]}</span>
                    <div style={{ flex: 1, height: 12, borderRadius: 3, background: 'var(--surface-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round((v / weekdayMax) * 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                    </div>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-2)', width: 34, textAlign: 'right' }}>{v.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
