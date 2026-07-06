'use client'

import type { ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import { useRepositories } from '@/hooks/useRepositories'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Chip, LangDot } from '@/components/gf/primitives'
import { Bars, Donut, Network, type NetworkData } from '@/components/gf/charts'
import { deriveLanguages } from '@/lib/gf-derive'
import { toast } from '@/components/ui/Toast'
import type { Repository } from '@/store'

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <Card padding={16}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, color: 'var(--text)', lineHeight: 1.1, marginTop: 6 }}>{value}</div>
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

export default function AnalyticsPage() {
  const { repos, total, isLoading, error } = useRepositories()
  const { data: session } = useSession()
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

  // repos updated per month, last 12 months
  const perMonth = Array(12).fill(0)
  repos.forEach((r: Repository) => {
    if (!r.pushedAt) return
    const m = Math.floor((Date.now() - new Date(r.pushedAt).getTime()) / 2629800000)
    if (m >= 0 && m < 12) perMonth[11 - m]++
  })
  const monthLabels = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (11 - i)); return d.toLocaleString('en', { month: 'short' }) })

  // stack graph: me + top languages
  const network: NetworkData = {
    nodes: [
      { id: 'me', name: username, x: 0.5, y: 0.5, repos: 22, accent: true },
      ...langs.map((l, i) => {
        const a = (i / Math.max(1, langs.length)) * Math.PI * 2
        return { id: l.name, name: l.name, x: 0.5 + 0.34 * Math.cos(a), y: 0.5 + 0.34 * Math.sin(a), repos: Math.round(l.pct / 5) + 4 }
      }),
    ],
    edges: langs.map((l) => ['me', l.name, 5] as [string, string, number]),
  }

  // peak activity by day/hour from push times
  const grid = Array.from({ length: 7 }, () => Array(12).fill(0))
  repos.forEach((r: Repository) => {
    if (!r.pushedAt) return
    const d = new Date(r.pushedAt)
    const day = (d.getDay() + 6) % 7
    grid[day][Math.floor(d.getHours() / 2)]++
  })
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <PageShell topNav={topNav}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="gf-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <KPI label="Repositories" value={String(total)} />
          <KPI label="Total stars" value={totalStars.toLocaleString()} />
          <KPI label="Total forks" value={String(totalForks)} />
          <KPI label="Avg health" value={`${avgHealth}%`} />
        </div>

        <div className="gf-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Card>
              <CardHead title="Repository activity" sub="Repos updated per month" right={<Chip color="var(--accent)" dot>last 12 months</Chip>} />
              <Bars data={perMonth} height={140} labels={monthLabels} />
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
              <CardHead title="Peak activity hours" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {grid.map((row, ri) => (
                  <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', width: 22, textTransform: 'uppercase', letterSpacing: 0.6 }}>{days[ri]}</span>
                    {row.map((v, i) => (
                      <div key={i} style={{ flex: 1, height: 14, borderRadius: 2, background: v === 0 ? 'var(--surface-2)' : `color-mix(in oklab, var(--accent) ${Math.min(100, 20 + v * 14)}%, var(--surface-2))` }} />
                    ))}
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginLeft: 28, marginTop: 6 }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} style={{ flex: 1, fontSize: 9, color: 'var(--text-3)', textAlign: 'center' }}>{i < 6 ? '0' + 2 * i : 2 * i}</span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
