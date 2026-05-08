'use client'

import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { DashboardSkeleton } from '@/components/ui/skeletons'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { useRepositories, useSyncRepos } from '@/hooks/useRepositories'
import { useProfileAnalysis, useAnalyzProfile } from '@/hooks/useAnalysis'
import { useSyncStatus } from '@/hooks/useRepositories'
import { formatRelativeTime } from '@/lib/utils'
import { Star, GitFork, AlertTriangle, RefreshCw, ArrowRight, Lock, Eye, Network } from 'lucide-react'
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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <Button onClick={() => syncRepos()} disabled={isSyncing}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-400 mb-1">Total Repositories</p>
            <p className="text-3xl font-bold text-white">{total}</p>
            <p className="text-xs text-gray-500 mt-1">
              {repos.filter(r => !r.isPrivate).length} public · {repos.filter(r => r.isPrivate).length} private
            </p>
          </Card>

          <Card>
            <p className="text-sm text-gray-400 mb-1">Average Health Score</p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-white">{avgHealth.toFixed(0)}</p>
              <ProgressRing progress={avgHealth} size={40} showLabel={false} />
            </div>
          </Card>

          <Card>
            <p className="text-sm text-gray-400 mb-1">Recruiter Readiness</p>
            <p className="text-3xl font-bold text-white">
              {profileAnalysis?.recruiterReadinessScore?.toFixed(0) || '--'}
            </p>
            {profileAnalysis?.developerArchetype && (
              <p className="text-xs text-emerald-400 mt-1">{profileAnalysis.developerArchetype}</p>
            )}
          </Card>

          <Card>
            <p className="text-sm text-gray-400 mb-1">Last Synced</p>
            <p className="text-lg font-medium text-white">
              {syncStatus?.lastSynced ? formatRelativeTime(syncStatus.lastSynced) : 'Never'}
            </p>
            {syncStatus?.repoCount > 0 && (
              <p className="text-xs text-gray-500 mt-1">{syncStatus.repoCount} repos</p>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            {criticalRepos.length === 0 ? (
              <p className="text-gray-400 text-sm">All repos are healthy!</p>
            ) : (
              <div className="space-y-3">
                {criticalRepos.map(repo => (
                  <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <ProgressRing progress={repo.healthScore} size={36} />
                      <div>
                        <p className="font-medium text-white">{repo.name}</p>
                        <p className="text-sm text-gray-400">{repo.language || 'Unknown'}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Fix with AI</Button>
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
              <p className="text-gray-500 text-sm">No language data</p>
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
                    <span className="text-sm text-gray-400">{repo.name}</span>
                    {repo.isPrivate && <Lock className="w-3 h-3 text-gray-500" />}
                  </div>
                  <span className="text-sm text-gray-500">{formatRelativeTime(repo.pushedAt)}</span>
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
                  <span className="text-sm text-gray-200">{repo.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-sm text-gray-400">
                      <Star className="w-3 h-3" /> {repo.stargazersCount}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-400">
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
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900 text-emerald-400 text-sm font-medium">
                      {imp.priority}
                    </span>
                    <div>
                      <p className="text-sm text-white">{imp.action}</p>
                      <p className="text-xs text-gray-500">{imp.impact}</p>
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
              <a href="/graph" className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Explore Full Graph <ArrowRight className="w-4 h-4" />
              </a>
            </CardTitle>
          </CardHeader>
          <div className="h-48 bg-gray-800/30 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Network className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Graph visualization loads on the Graph page</p>
              <a href="/graph" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
                View interactive graph →
              </a>
            </div>
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  )
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}