'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { DashboardSkeleton } from '@/components/ui/skeletons'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useRepositories, useSyncRepos } from '@/hooks/useRepositories'
import { useProfileAnalysis, useAnalyzProfile } from '@/hooks/useAnalysis'
import { useSyncStatus } from '@/hooks/useRepositories'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Star, GitFork, AlertTriangle, RefreshCw, ArrowRight, Lock, Eye, Network, FolderGit, Users, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

interface RepoType {
  id: string
  name: string
  language: string | null
  stargazersCount: number
  forksCount: number
  healthScore: number
  pushedAt: string | null
  isPrivate: boolean
  topics: string[]
}

export default function DashboardPage() {
  const { repos, total, isLoading } = useRepositories() as { repos: RepoType[]; total: number; isLoading: boolean }
  const { data: profileAnalysis } = useProfileAnalysis()
  const { data: syncStatus } = useSyncStatus()
  const { mutate: syncRepos, isPending: isSyncing } = useSyncRepos()
  const { mutate: analyzeProfile, isPending: isAnalyzing } = useAnalyzProfile()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <DashboardSkeleton />

  const avgHealth = repos.length > 0 ? repos.reduce((a, r) => a + r.healthScore, 0) / repos.length : 0
  const criticalRepos = repos.filter(r => r.healthScore < 40).slice(0, 5)
  
  const langCounts: Record<string, number> = {}
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1 })
  const langData = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }))

  const topRepos = [...repos].sort((a, b) => b.stargazersCount - a.stargazersCount).slice(0, 5)
  const recentRepos = [...repos].sort((a, b) => new Date(b.pushedAt || 0).getTime() - new Date(a.pushedAt || 0).getTime()).slice(0, 5)

  if (isLoading) return <DashboardSkeleton />

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Welcome back! Here&apos;s what&apos;s happening with your portfolio.</p>
          </div>
          <Button onClick={() => syncRepos()} disabled={isSyncing}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-md p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Total Repositories</p>
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(88, 166, 255, 0.1)', color: 'var(--color-accent)' }}>
                <FolderGit className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[28px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>{total}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {repos.filter(r => !r.isPrivate).length} public · {repos.filter(r => r.isPrivate).length} private
            </p>
          </div>

          <div className="rounded-md p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Average Health Score</p>
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(63, 185, 80, 0.1)', color: 'var(--color-success)' }}>
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-[28px] font-bold" style={{ color: 'var(--color-text)' }}>{avgHealth.toFixed(0)}</p>
              <ProgressRing progress={avgHealth} size={40} showLabel={false} />
            </div>
          </div>

          <div className="rounded-md p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Recruiter Readiness</p>
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(163, 113, 247, 0.1)', color: '#a371f7' }}>
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[28px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              {profileAnalysis?.recruiterReadinessScore?.toFixed(0) || '--'}
            </p>
            {profileAnalysis?.developerArchetype && (
              <p className="text-xs" style={{ color: 'var(--color-success)' }}>{profileAnalysis.developerArchetype}</p>
            )}
          </div>

          <div className="rounded-md p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Last Synced</p>
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: 'rgba(210, 153, 34, 0.1)', color: 'var(--color-warning)' }}>
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text)' }}>
              {syncStatus?.lastSynced ? formatRelativeTime(syncStatus.lastSynced) : 'Never'}
            </p>
            {syncStatus?.repoCount > 0 && (
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{syncStatus.repoCount} repos</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
                Critical Issues
              </CardTitle>
            </CardHeader>
            {criticalRepos.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>All repos are healthy!</p>
            ) : (
              <div className="space-y-3">
                {criticalRepos.map(repo => (
                  <div key={repo.id} className="flex items-center justify-between p-3 rounded-md" style={{ background: 'var(--color-surface-hover)' }}>
                    <div className="flex items-center gap-3">
                      <ProgressRing progress={repo.healthScore} size={36} />
                      <div>
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>{repo.name}</p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{repo.language || 'Unknown'}</p>
                      </div>
                    </div>
                    <Link href={`/repos/${repo.id}`}>
                      <Button size="sm" variant="secondary">Fix with AI</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language Distribution</CardTitle>
            </CardHeader>
            {langData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={langData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name }) => name}
                    >
                      {langData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No language data</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {recentRepos.map(repo => (
                <div key={repo.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{repo.name}</span>
                    {repo.isPrivate && <Lock className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{formatRelativeTime(repo.pushedAt)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Repos by Stars</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {topRepos.map(repo => (
                <div key={repo.id} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>{repo.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Star className="w-3 h-3" /> {repo.stargazersCount}
                    </span>
                    <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <GitFork className="w-3 h-3" /> {repo.forksCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {profileAnalysis?.topImprovements && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Improvement Checklist</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {profileAnalysis.topImprovements.map((imp: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-md" style={{ background: 'var(--color-surface-hover)' }}>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium" style={{ background: 'rgba(63, 185, 80, 0.1)', color: 'var(--color-success)' }}>
                      {imp.priority}
                    </span>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--color-text)' }}>{imp.action}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{imp.impact}</p>
                    </div>
                  </div>
                  <Badge variant={imp.effort === 'low' ? 'success' : imp.effort === 'medium' ? 'warning' : 'danger'}>
                    {imp.effort}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Code Universe</span>
              <a href="/graph" className="text-sm flex items-center gap-1" style={{ color: 'var(--color-success)' }}>
                Explore Full Graph <ArrowRight className="w-4 h-4" />
              </a>
            </CardTitle>
          </CardHeader>
          <div className="h-48 rounded-md flex items-center justify-center" style={{ background: 'var(--color-surface-hover)' }}>
            <div className="text-center" style={{ color: 'var(--color-text-muted)' }}>
              <Network className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color: 'var(--color-text-muted)' }} />
              <p>Graph visualization loads on the Graph page</p>
              <a href="/graph" className="text-sm mt-2 inline-block" style={{ color: 'var(--color-success)' }}>
                View interactive graph →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  )
}