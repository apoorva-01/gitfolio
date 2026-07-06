'use client'

import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRepositories, useSyncRepos } from '@/hooks/useRepositories'
import { useProfileAnalysis, useAnalyzProfile } from '@/hooks/useAnalysis'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Avatar, Chip, AIBadge, type IconName } from '@/components/gf/primitives'
import { Heatmap, LangBars, ActivityTimeline, type ActivityItem, type LangSlice } from '@/components/gf/charts'
import { toast } from '@/components/ui/Toast'
import { rel, deriveLanguages } from '@/lib/gf-derive'
import { SITE_URL, SITE_HOST } from '@/lib/site'
import type { Repository } from '@/store'

/* ---------- derivations from real repo data ---------- */

function deriveActivity(repos: Repository[]): ActivityItem[] {
  return [...repos]
    .filter((r) => r.pushedAt)
    .sort((a, b) => new Date(b.pushedAt!).getTime() - new Date(a.pushedAt!).getTime())
    .slice(0, 6)
    .map((r) => ({ type: 'push', repo: r.name, when: rel(r.pushedAt!), msg: r.description || 'Updated repository' }))
}

function deriveHeatmap(repos: Repository[]): number[][] {
  const grid: number[][] = Array.from({ length: 53 }, () => Array(7).fill(0))
  const now = Date.now()
  repos.forEach((r) => {
    if (!r.pushedAt) return
    const t = new Date(r.pushedAt).getTime()
    const daysAgo = Math.floor((now - t) / 86400000)
    if (daysAgo < 0 || daysAgo > 370) return
    const weekIdx = 52 - Math.floor(daysAgo / 7)
    const dayIdx = new Date(t).getDay()
    if (weekIdx >= 0 && weekIdx < 53) grid[weekIdx][dayIdx] += 2
  })
  return grid
}

type Stat = { label: string; value: string; delta?: string; period: string; icon: IconName; accent?: boolean }
type Insight = { tag: string; title: string; body: string }

function deriveInsights(repos: Repository[], langs: LangSlice[]): Insight[] {
  if (repos.length === 0) {
    return [{ tag: 'Setup', title: 'Sync your repositories', body: 'Import your GitHub repos to unlock AI insights, health scores, and a portfolio.' }]
  }
  const out: Insight[] = []
  const noReadme = repos.filter((r) => !r.hasReadme).length
  if (noReadme > 0) out.push({ tag: 'Docs', title: `${noReadme} repo${noReadme > 1 ? 's' : ''} missing a README`, body: 'Repos with a README score higher and read better on your portfolio. Generate one in a click.' })
  const lowHealth = repos.filter((r) => (r.healthScore || 0) < 50).length
  if (lowHealth > 0) out.push({ tag: 'Health', title: `${lowHealth} repo${lowHealth > 1 ? 's' : ''} below 50 health`, body: 'Add topics, a description, and a license to lift these repos on your profile.' })
  if (langs[0]) out.push({ tag: 'Profile', title: `${langs[0].name} is your primary language`, body: `It makes up ${langs[0].pct.toFixed(0)}% of your code. Lead your bio with it.` })
  return out.slice(0, 3)
}

type Improvement = { priority?: number; action?: string; impact?: string; effort?: string }

function improvementsToInsights(items: Improvement[]): Insight[] {
  return items
    .filter((it) => it.action)
    .slice(0, 3)
    .map((it) => ({
      tag: it.effort ? `${it.effort[0].toUpperCase()}${it.effort.slice(1)} effort` : 'Improve',
      title: it.action as string,
      body: it.impact || 'Recommended by Claude from your repositories.',
    }))
}

/* ---------- local cards ---------- */

function StatCard({ stat }: { stat: Stat }) {
  const Ico = Icon[stat.icon]
  const positive = stat.delta?.startsWith('+')
  return (
    <Card padding={20} style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8,
          background: stat.accent ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: stat.accent ? 'var(--accent)' : 'var(--text-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Ico size={16} />
        </div>
        {stat.delta && (
          <span style={{ fontSize: 11, fontWeight: 600, color: positive ? 'var(--success)' : 'var(--danger)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <Icon.TrendUp size={11} />{stat.delta}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{stat.label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8, color: 'var(--text)', lineHeight: 1.1 }}>{stat.value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{stat.period}</div>
    </Card>
  )
}

function QuickAction({ icon, title, body, badge, onClick, href }: { icon: IconName; title: string; body: string; badge?: boolean; onClick?: () => void; href?: string }) {
  const Ico = Icon[icon]
  const style: CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, textDecoration: 'none', cursor: 'pointer' }
  const inner = (
    <>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-2)', color: 'var(--text-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ico size={15} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>{title} {badge && <AIBadge>AI</AIBadge>}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{body}</div>
      </div>
      <Icon.ChevronR size={14} style={{ color: 'var(--text-3)' }} />
    </>
  )
  return href ? <Link href={href} style={style}>{inner}</Link> : <button onClick={onClick} style={{ ...style, border: 'none', background: 'transparent', font: 'inherit', textAlign: 'left', width: '100%' }}>{inner}</button>
}

function InsightCard({ insight, source }: { insight: Insight; source: string }) {
  return (
    <Card padding={16} style={{ borderColor: 'color-mix(in oklab, var(--ai) 25%, var(--border))', background: 'linear-gradient(135deg, var(--ai-soft) 0%, transparent 50%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AIBadge>{insight.tag}</AIBadge>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{source}</span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6, letterSpacing: -0.1 }}>{insight.title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{insight.body}</div>
    </Card>
  )
}

/* ---------- page ---------- */

export default function DashboardPage() {
  const { repos, total, isLoading, error } = useRepositories()
  const { data: session } = useSession()
  const { data: analysis } = useProfileAnalysis()
  const analyze = useAnalyzProfile()
  const sync = useSyncRepos()
  const user = session?.user
  const login = (user as { githubLogin?: string } | undefined)?.githubLogin
  const firstName = (user?.name || 'there').split(' ')[0]

  const regenerate = () => {
    analyze.mutate(undefined, {
      onSuccess: () => toast.success('AI insights regenerated'),
      onError: () => toast.error('Could not regenerate insights'),
    })
  }
  const runSync = () => {
    if (sync.isPending) return
    toast.success('Syncing your repositories…')
    sync.mutate(undefined, {
      onSuccess: (data: { synced?: number }) => toast.success(`Synced ${data?.synced ?? 0} repositories`),
      onError: () => toast.error('Sync failed'),
    })
  }
  const topNavActions = (
    <Button variant="ai" size="sm" icon={<Icon.Sparkle size={12} />} disabled={analyze.isPending} onClick={regenerate}>
      {analyze.isPending ? 'Regenerating…' : 'Regenerate AI insights'}
    </Button>
  )

  if (isLoading) {
    return (
      <PageShell topNav={<TopNav title="Dashboard" subtitle="Overview of your GitFolio" />}>
        <div style={{ padding: 24, color: 'var(--text-3)' }}>Loading your dashboard…</div>
      </PageShell>
    )
  }

  if (error) {
    return (
      <PageShell topNav={<TopNav title="Dashboard" subtitle="Overview of your GitFolio" />}>
        <div style={{ padding: 24 }}>
          <Card padding={20}>
            <p style={{ color: 'var(--danger)', marginBottom: 12 }}>Failed to load dashboard data.</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        </div>
      </PageShell>
    )
  }

  const languages = deriveLanguages(repos)
  const activity = deriveActivity(repos)
  const heatmap = deriveHeatmap(repos)
  const aiImprovements = (analysis?.topImprovements as Improvement[] | undefined) || []
  const insights = aiImprovements.length ? improvementsToInsights(aiImprovements) : deriveInsights(repos, languages)

  const totalStars = repos.reduce((s: number, r: Repository) => s + (r.stargazersCount || 0), 0)
  const avgHealth = repos.length ? Math.round(repos.reduce((s: number, r: Repository) => s + (r.healthScore || 0), 0) / repos.length) : 0
  const langCount = new Set(repos.map((r: Repository) => r.language).filter(Boolean)).size
  const newThisMonth = repos.filter((r: Repository) => r.pushedAt && Date.now() - new Date(r.pushedAt).getTime() < 30 * 86400000).length

  const stats: Stat[] = [
    { label: 'Repositories', value: String(total), delta: newThisMonth ? `+${newThisMonth}` : undefined, period: 'active this month', icon: 'Repo', accent: true },
    { label: 'Total stars', value: String(totalStars), period: 'across all repos', icon: 'Star' },
    { label: 'Avg health', value: `${avgHealth}%`, period: 'repo health score', icon: 'TrendUp', accent: true },
    { label: 'Languages', value: String(langCount), period: 'in your stack', icon: 'Code' },
  ]

  return (
    <PageShell topNav={<TopNav title="Dashboard" subtitle="Overview of your GitFolio" actions={topNavActions} />}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* welcome */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar src={user?.image} name={user?.name || 'User'} size={48} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: 'var(--text)' }}>
                Welcome back, {firstName}<span style={{ color: 'var(--accent)' }}>.</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {login
                  ? <>Your GitFolio is at <Link href={`/pub/${login}`} className="mono" style={{ color: 'var(--text)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{SITE_HOST}/{login}</Link></>
                  : 'Sync your GitHub to build your portfolio'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {login && <Button variant="secondary" size="md" icon={<Icon.Eye size={14} />} href={`/pub/${login}`}>Preview</Button>}
            <Button variant="primary" size="md" icon={<Icon.Share size={14} />}
              onClick={() => { if (login) { navigator.clipboard?.writeText(`${SITE_URL}/pub/${login}`); toast.success('Public link copied') } }}>Share</Button>
          </div>
        </div>

        {/* stats */}
        <div className="gf-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {stats.map((s) => <StatCard key={s.label} stat={s} />)}
        </div>

        {/* main grid */}
        <div className="gf-dash-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Contribution activity</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Last 12 months · derived from repo activity</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Chip color="var(--accent)" dot>{new Date().getFullYear()}</Chip>
                </div>
              </div>
              <Heatmap data={heatmap} cell={11} gap={3} />
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Recent activity</div>
                <Button variant="ghost" size="sm" href="/repos">View all</Button>
              </div>
              {activity.length ? <ActivityTimeline items={activity} /> : <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No activity yet — sync your repositories to see recent pushes.</div>}
            </Card>

            <Card>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Top languages</div>
              {languages.length ? <LangBars data={languages} /> : <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No language data yet.</div>}
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
            <Card padding={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon.Sparkle size={14} style={{ color: 'var(--ai)' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>AI Insights</div>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{aiImprovements.length ? `Analyzed ${rel(analysis.analyzedAt)}` : 'Not yet analyzed'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.map((ins, i) => <InsightCard key={i} insight={ins} source={aiImprovements.length ? 'via Claude' : 'Heuristic — regenerate for AI'} />)}
              </div>
            </Card>

            <Card padding={16}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Quick actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <QuickAction icon="Repo" title="Sync repositories" body={sync.isPending ? 'Syncing from GitHub…' : 'Pull the latest from GitHub'} onClick={runSync} />
                <QuickAction icon="Sparkle" title="Regenerate bio" body={analyze.isPending ? 'Analyzing your profile…' : 'AI-rewrite from your latest repos'} badge onClick={regenerate} />
                <QuickAction icon="Chart" title="View analytics" body="Languages, cadence, and trends" href="/analytics" />
                {login && <QuickAction icon="Globe" title="Public page" body={`${SITE_HOST}/${login}`} href={`/pub/${login}`} />}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
