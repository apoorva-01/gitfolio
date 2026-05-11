'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRepositories } from '@/hooks/useRepositories'
import { DashboardSkeleton } from '@/components/ui/skeletons'
import { toast } from '@/components/ui/Toast'
import { formatRelativeTime } from '@/lib/utils'
import type { Repository } from '@/store'

function ActivityIcon({ type }: { type: string }) {
  const props = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }
  const icon = type === 'commit'
    ? <svg {...props}><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>
    : type === 'pr'
    ? <svg {...props}><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>
    : type === 'star'
    ? <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    : <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  return icon
}

export default function DashboardPage() {
  const { repos, total, isLoading, error } = useRepositories()
  const router = useRouter()

  const stats = {
    totalRepos: total || repos.length,
    totalStars: repos.reduce((sum: number, r: Repository) => sum + (r.stargazersCount || 0), 0),
    followers: 892,
    contributions: repos.reduce((sum: number, r: Repository) => sum + (r.healthScore || 0), 0),
  }

  const derivedActivities = repos.slice(0, 5).map((r: Repository, i: number) => ({
    type: i % 2 === 0 ? 'commit' : 'pr',
    text: `<strong>Updated</strong> <span class="activity-repo">${r.name}</span>`,
    time: r.pushedAt ? formatRelativeTime(new Date(r.pushedAt)) : 'recently',
  }))

  const trending = [...repos]
    .sort((a: Repository, b: Repository) => (b.stargazersCount || 0) - (a.stargazersCount || 0))
    .slice(0, 3)
    .map((r: Repository, i: number) => ({ rank: i + 1, name: r.name, desc: r.description || '', stars: r.stargazersCount || 0, forks: r.forksCount || 0 }))

  if (isLoading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="p-5 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <p style={{ color: 'var(--color-error)' }}>Failed to load dashboard data.</p>
        <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 text-sm rounded cursor-pointer" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
          Retry
        </button>
      </div>
    )
  }
  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Welcome back! Here&apos;s what&apos;s happening with your portfolio.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Repositories', value: String(stats.totalRepos), change: `${repos.filter((r: Repository) => { const d = r.pushedAt ? new Date(r.pushedAt) : new Date(0); return d > new Date(Date.now() - 30*24*60*60*1000) }).length} new this month`, color: 'rgba(88, 166, 255, 0.1)', iconColor: 'var(--color-accent)' },
          { label: 'Total Stars', value: String(stats.totalStars), change: `Across ${repos.length} repos`, color: 'rgba(210, 153, 34, 0.1)', iconColor: 'var(--color-warning)' },
          { label: 'Followers', value: String(stats.followers), change: '+24 this month', color: 'rgba(63, 185, 80, 0.1)', iconColor: 'var(--color-success)' },
          { label: 'Contributions', value: String(stats.contributions), change: '+156 this year', color: 'rgba(163, 113, 247, 0.1)', iconColor: '#a371f7' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-lg"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</span>
              <div
                className="w-8 h-8 flex items-center justify-center rounded"
                style={{ background: stat.color, color: stat.iconColor }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {stat.label === 'Total Repositories' && <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>}
                  {stat.label === 'Total Stars' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
                  {stat.label === 'Followers' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                  {stat.label === 'Contributions' && <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>}
                </svg>
              </div>
            </div>
            <div className="text-[28px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>{stat.value}</div>
            <div className="text-xs" style={{ color: 'var(--color-success)' }}>{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Recent Activity</h2>
            <Link href="/repos" className="text-sm no-underline" style={{ color: 'var(--color-accent)' }}>View all</Link>
          </div>
          <div className="py-2">
            {derivedActivities.map((a: { type: string; text: string; time: string }, i: number) => (
              <div
                key={i}
                className="flex gap-3 px-5 py-3 transition-colors"
                style={{ color: 'var(--color-text)' }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: a.type === 'commit' ? 'rgba(63, 185, 80, 0.1)' : a.type === 'pr' ? 'rgba(88, 166, 255, 0.1)' : a.type === 'star' ? 'rgba(163, 113, 247, 0.1)' : 'rgba(210, 153, 34, 0.1)',
                    color: a.type === 'commit' ? 'var(--color-success)' : a.type === 'pr' ? 'var(--color-accent)' : a.type === 'star' ? '#a371f7' : 'var(--color-warning)',
                  }}
                >
                  <ActivityIcon type={a.type} />
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-1" dangerouslySetInnerHTML={{ __html: a.text }} />
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Quick Actions</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'New Repo', iconType: 'plus', onClick: () => window.open('https://github.com/new', '_blank') },
                    { label: 'Import', iconType: 'upload', onClick: () => fetch('/api/github/sync', { method: 'POST' }).then(() => toast.success('Sync started!')) },
                    { label: 'Edit Profile', iconType: 'edit', onClick: () => router.push('/settings') },
                    { label: 'Themes', iconType: 'layout', onClick: () => router.push('/settings') },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-2 p-4 rounded text-sm cursor-pointer transition-all"
                      style={{
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-secondary)',
                      }}
                    >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {action.iconType === 'plus' && <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
                      {action.iconType === 'upload' && <><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></>}
                      {action.iconType === 'edit' && <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>}
                      {action.iconType === 'layout' && <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>}
                    </svg>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>Trending Repos</h2>
              <Link href="/repos" className="text-sm no-underline" style={{ color: 'var(--color-accent)' }}>View all</Link>
            </div>
            <div className="py-2">
              {trending.map((repo) => (
                <div key={repo.rank} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-base font-bold w-6 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>{repo.rank}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{repo.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{repo.desc}</div>
                  </div>
                  <div className="flex gap-3 text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                    <span>★ {repo.stars}</span>
                    <span>⑂ {repo.forks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}