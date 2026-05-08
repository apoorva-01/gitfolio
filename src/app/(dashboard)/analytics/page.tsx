'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRepositories } from '@/hooks/useRepositories'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, PieChart, Pie } from 'recharts'
import { GitFork as ForkIcon, Star, TrendingUp, Calendar, Activity } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

interface RepoType {
  id: string
  name: string
  language: string | null
  stargazersCount: number
  forksCount: number
  openIssuesCount: number
  healthScore: number
  createdAt: string
  hasReadme: boolean
  description: string | null
  hasLicense: boolean
  topics: string[]
  pushedAt: string | null
}

export default function AnalyticsPage() {
  const { repos } = useRepositories() as { repos: RepoType[] }
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return <div className="animate-pulse h-96 bg-gray-900 rounded-lg" />

  const healthBrackets: { label: string; count: number; color: string }[] = [
    { label: '0-20', count: repos.filter((r: { healthScore: number }) => r.healthScore < 20).length, color: '#ef4444' },
    { label: '20-40', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 20 && r.healthScore < 40).length, color: '#f97316' },
    { label: '40-60', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 40 && r.healthScore < 60).length, color: '#f59e0b' },
    { label: '60-80', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 60 && r.healthScore < 80).length, color: '#84cc16' },
    { label: '80-100', count: repos.filter((r: { healthScore: number }) => r.healthScore >= 80).length, color: '#10b981' },
  ]

  const langCounts: Record<string, number> = {}
  repos.forEach(r => { if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1 })
  const langData = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }))

  const scatterData = repos
    .filter(r => r.stargazersCount > 0 || r.forksCount > 0)
    .map(r => ({
      x: r.stargazersCount,
      y: r.healthScore,
      name: r.name,
      language: r.language,
    }))

  const yearLangCounts: Record<string, Record<string, number>> = {}
  repos.forEach(r => {
    const year = new Date(r.createdAt).getFullYear().toString()
    if (!yearLangCounts[year]) yearLangCounts[year] = {}
    if (r.language) yearLangCounts[year][r.language] = (yearLangCounts[year][r.language] || 0) + 1
  })

  const yearlyData = Object.entries(yearLangCounts)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([year, langs]) => ({
      year,
      ...langs,
    }))

  const avgHealth = repos.length > 0 ? repos.reduce((a, r) => a + r.healthScore, 0) / repos.length : 0
  const shipsVsStarts = {
    shipped: repos.filter(r => r.forksCount > 0 || r.stargazersCount > 0).length,
    total: repos.length,
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-gray-400">Total Repos</p>
          <p className="text-3xl font-bold text-white">{repos.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Avg Health</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-white">{avgHealth.toFixed(0)}</p>
            <ProgressRing progress={avgHealth} size={40} showLabel={false} />
          </div>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Total Stars</p>
          <p className="text-3xl font-bold text-white">{repos.reduce((a, r) => a + r.stargazersCount, 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-400">Total Forks</p>
          <p className="text-3xl font-bold text-white">{repos.reduce((a, r) => a + r.forksCount, 0)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Score Distribution</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthBrackets}>
                <XAxis dataKey="label" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {healthBrackets.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repo Activity by Stars</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <XAxis dataKey="x" type="number" name="Stars" stroke="#6b7280" label={{ value: 'Stars', fill: '#6b7280' }} />
                <YAxis dataKey="y" type="number" name="Health" stroke="#6b7280" domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded p-2 text-sm">
                          <p className="text-white font-medium">{d.name}</p>
                          <p className="text-gray-400">Stars: {d.x}</p>
                          <p className="text-gray-400">Health: {d.y}</p>
                          <p className="text-gray-400">Language: {d.language}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={index} fill={getLangColor(entry.language)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
        </CardHeader>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={langData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {langData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping vs Starting</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex h-8 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 flex items-center justify-center text-sm text-white font-medium"
              style={{ width: `${(shipsVsStarts.shipped / shipsVsStarts.total) * 100}%` }}
            >
              {shipsVsStarts.shipped} shipped
            </div>
            <div
              className="bg-gray-700 flex items-center justify-center text-sm text-gray-300 font-medium"
              style={{ width: `${((shipsVsStarts.total - shipsVsStarts.shipped) / shipsVsStarts.total) * 100}%` }}
            >
              {shipsVsStarts.total - shipsVsStarts.shipped} started
            </div>
          </div>
          <p className="text-sm text-gray-400">
            {((shipsVsStarts.shipped / shipsVsStarts.total) * 100).toFixed(0)}% of your repos have activity (stars or forks)
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Repository Health Table</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Language</th>
                <th className="pb-3 pr-4">Health</th>
                <th className="pb-3 pr-4">Stars</th>
                <th className="pb-3 pr-4">Forks</th>
                <th className="pb-3 pr-4">Issues</th>
                <th className="pb-3">Missing</th>
              </tr>
            </thead>
            <tbody>
              {[...repos]
                .sort((a, b) => b.healthScore - a.healthScore)
                .slice(0, 20)
                .map(repo => {
                  const missing: string[] = []
                  if (!repo.hasReadme) missing.push('README')
                  if (!repo.description) missing.push('Description')
                  if (!repo.hasLicense) missing.push('License')
                  if (!repo.topics?.length) missing.push('Topics')

                  return (
                    <tr key={repo.id} className="border-b border-gray-800/50">
                      <td className="py-3 pr-4 text-white">{repo.name}</td>
                      <td className="py-3 pr-4 text-gray-400">{repo.language || '-'}</td>
                      <td className="py-3 pr-4">
                        <span className={cn(
                          'font-medium',
                          repo.healthScore >= 70 ? 'text-emerald-400' :
                          repo.healthScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {repo.healthScore.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-400">{repo.stargazersCount}</td>
                      <td className="py-3 pr-4 text-gray-400">{repo.forksCount}</td>
                      <td className="py-3 pr-4 text-gray-400">{repo.openIssuesCount}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {missing.map(m => (
                            <span key={m} className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">{m}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function getLangColor(lang: string | null): string {
  const colors: Record<string, string> = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584', Java: '#b07219',
    'C#': '#178600', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF',
    Dart: '#00B4AB', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051',
  }
  return colors[lang || ''] || '#8b949e'
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
