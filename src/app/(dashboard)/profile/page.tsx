'use client'

import { useSession } from 'next-auth/react'
import { useRepositories } from '@/hooks/useRepositories'
import { useProfileAnalysis, useAnalyzProfile } from '@/hooks/useAnalysis'
import { useContributions } from '@/hooks/useContributions'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Avatar, Chip, LangDot, Divider, AIBadge } from '@/components/gf/primitives'
import { Heatmap, LangBars } from '@/components/gf/charts'
import { ActivitySummary } from '@/components/gf/ActivitySummary'
import { deriveLanguages, contributionsToGrid, contributionsTotal } from '@/lib/gf-derive'
import { SITE_HOST } from '@/lib/site'
import { toast } from '@/components/ui/Toast'
import type { Repository } from '@/store'

function deriveHeatmap(repos: Repository[]): number[][] {
  const grid: number[][] = Array.from({ length: 53 }, () => Array(7).fill(0))
  const now = Date.now()
  repos.forEach((r) => {
    if (!r.pushedAt) return
    const t = new Date(r.pushedAt).getTime()
    const daysAgo = Math.floor((now - t) / 86400000)
    if (daysAgo < 0 || daysAgo > 370) return
    const weekIdx = 52 - Math.floor(daysAgo / 7)
    if (weekIdx >= 0 && weekIdx < 53) grid[weekIdx][new Date(t).getDay()] += 2
  })
  return grid
}

function PinnedRepoCard({ repo }: { repo: Repository }) {
  return (
    <Card padding={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Icon.Repo size={12} style={{ color: 'var(--text-3)' }} />
        <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', minHeight: 36 }}>
        {repo.description || <span style={{ color: 'var(--text-3)' }}>No description</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: 11, color: 'var(--text-2)' }}>
        {repo.language && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LangDot lang={repo.language} />{repo.language}</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Star size={11} />{(repo.stargazersCount || 0) > 999 ? ((repo.stargazersCount || 0) / 1000).toFixed(1) + 'k' : repo.stargazersCount || 0}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Fork size={11} />{repo.forksCount || 0}</span>
      </div>
    </Card>
  )
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { repos } = useRepositories()
  const { data: analysis } = useProfileAnalysis()
  const { data: githubStats } = useContributions()
  const contributions = githubStats?.contributions || []
  const activity = githubStats?.activity || null
  const analyze = useAnalyzProfile()
  const user = session?.user
  const login = (user as { githubLogin?: string } | undefined)?.githubLogin
  const name = user?.name || 'Your name'

  const pinned = [...repos].sort((a: Repository, b: Repository) => (b.stargazersCount || 0) - (a.stargazersCount || 0)).slice(0, 6)
  const langs = deriveLanguages(repos, 6)
  const hasRealContribs = !!contributions?.length
  const heatmap = hasRealContribs ? contributionsToGrid(contributions) : deriveHeatmap(repos)
  const totalStars = repos.reduce((s: number, r: Repository) => s + (r.stargazersCount || 0), 0)

  const aiBio = analysis?.profileBioSuggestion as string | undefined
  const strengths = (analysis?.topStrengths as string[] | undefined) || []
  const archetype = analysis?.developerArchetype as string | undefined

  const regenerate = () => {
    analyze.mutate(undefined, {
      onSuccess: () => toast.success('Bio regenerated'),
      onError: () => toast.error('Could not regenerate bio'),
    })
  }

  const topNav = (
    <TopNav title="Profile" subtitle={login ? `What visitors see at ${SITE_HOST}/${login}` : 'Your public GitFolio'} actions={
      <>
        {login && <Button variant="secondary" size="sm" icon={<Icon.Eye size={13} />} href={`/pub/${login}`}>Public preview</Button>}
        <Button variant="ai" size="sm" icon={<Icon.Sparkle size={12} />} disabled={analyze.isPending} onClick={regenerate}>{analyze.isPending ? 'Regenerating…' : 'Regenerate bio'}</Button>
      </>
    } />
  )

  return (
    <PageShell topNav={topNav}>
      <div className="gf-profile-grid" style={{ padding: 24, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        {/* left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <Avatar src={user?.image} name={name} size={200} ring />
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: 'var(--text)' }}>{name}</div>
            {login && <div className="mono" style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 2 }}>@{login}</div>}
          </div>
          <div style={{ position: 'relative' }}>
            <AIBadge style={{ position: 'absolute', top: -8, right: 0 }}>{aiBio ? 'AI bio' : 'Draft'}</AIBadge>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55, padding: '12px 14px', background: 'var(--surface)', border: '1px solid color-mix(in oklab, var(--ai) 18%, var(--border))', borderRadius: 10 }}>
              {aiBio
                || (langs[0]
                  ? `Ships across ${langs.length} languages — most active in ${langs[0].name}. ${repos.length} public repos, ${totalStars.toLocaleString()} stars earned.`
                  : 'Sync your repositories, then regenerate your AI bio from your real work.')}
            </div>
            {!aiBio && repos.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>Heuristic draft — click “Regenerate bio” for a Claude-written version.</div>
            )}
          </div>
          {archetype && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Developer archetype</div>
              <Chip color="var(--ai)" dot>{archetype}</Chip>
            </div>
          )}
          {strengths.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Top strengths</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {strengths.slice(0, 5).map((s) => <Chip key={s} color="var(--accent)">{s}</Chip>)}
              </div>
            </div>
          )}
          {login && <Button variant="surface" size="md" fullWidth icon={<Icon.Github size={13} />} href={`https://github.com/${login}`}>View on GitHub</Button>}
          <Divider />
          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <span><b style={{ color: 'var(--text)' }}>{repos.length}</b> <span style={{ color: 'var(--text-3)' }}>repos</span></span>
            <span><b style={{ color: 'var(--text)' }}>{totalStars.toLocaleString()}</b> <span style={{ color: 'var(--text-3)' }}>stars</span></span>
          </div>
        </div>

        {/* right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Pinned</h2>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{pinned.length} of 6</span>
              </div>
            </div>
            {pinned.length ? (
              <div className="gf-pinned-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {pinned.map((r: Repository) => <PinnedRepoCard key={r.id} repo={r} />)}
              </div>
            ) : <Card padding={20}><span style={{ fontSize: 13, color: 'var(--text-3)' }}>No repositories to pin yet.</span></Card>}
          </div>

          {activity && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: 0 }}>Open source</h2>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Contributions beyond your own repos</span>
              </div>
              <ActivitySummary activity={activity} />
            </div>
          )}

          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Contribution activity</div>
            {hasRealContribs && <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>{contributionsTotal(contributions).toLocaleString()} contributions in the last year</div>}
            <Heatmap data={heatmap} cell={11} gap={3} showLegend={false} />
          </Card>

          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Top languages</div>
            {langs.length ? <LangBars data={langs} /> : <div style={{ fontSize: 13, color: 'var(--text-3)' }}>No language data yet.</div>}
          </Card>
        </div>
      </div>
    </PageShell>
  )
}
