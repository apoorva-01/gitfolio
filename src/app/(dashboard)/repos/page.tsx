'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRepoStore } from '@/store'
import { useRepositories, useSyncRepos } from '@/hooks/useRepositories'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Select, Badge } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { RepoCardSkeleton } from '@/components/ui/skeletons'
import { formatRelativeTime, cn } from '@/lib/utils'
import { getLanguageColor } from '@/lib/languages'
import { Search, Filter, RefreshCw, Lock, GitFork, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ReposPage() {
  const { filteredRepos, filters, setFilter, resetFilters, isLoading } = useRepoStore()
  const { total } = useRepositories(filters as any)
  const { mutate: syncRepos, isPending: isSyncing } = useSyncRepos()
  const [searchInput, setSearchInput] = useState(filters.search)
  const [page, setPage] = useState(1)
  const [mounted, setMounted] = useState(false)
  const limit = 20

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const timer = setTimeout(() => setFilter('search', searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [filters.visibility, filters.language, filters.sortBy, filters.minHealth, filters.search])

  const languages = useMemo(() => {
    return [...new Set(filteredRepos.map(r => r.language).filter(Boolean))] as string[]
  }, [filteredRepos])

  const totalPages = Math.ceil(total / limit)

  if (!mounted) return (
    <div className="space-y-6">
      <div className="flex justify-between"><div className="h-8 w-32 bg-gray-800 animate-pulse rounded" /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => <RepoCardSkeleton key={i} />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Repositories</h1>
        <Button onClick={() => syncRepos()} disabled={isSyncing}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search repos..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filters.visibility} onChange={e => setFilter('visibility', e.target.value)}>
            <option value="all">All</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </Select>
          <Select value={filters.language} onChange={e => setFilter('language', e.target.value)}>
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </Select>
          <Select value={filters.sortBy} onChange={e => setFilter('sortBy', e.target.value)}>
            <option value="updated">Last Updated</option>
            <option value="stars">Stars</option>
            <option value="health">Health</option>
            <option value="name">Name</option>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Min Health:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minHealth}
              onChange={e => setFilter('minHealth', parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-300">{filters.minHealth}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
        </div>
      </Card>

      <p className="text-sm text-gray-400">{total} repositories</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRepos.slice((page - 1) * limit, page * limit).map(repo => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function RepoCard({ repo }: { repo: any }) {
  const healthColor = repo.healthScore >= 70 ? 'text-emerald-500' : repo.healthScore >= 40 ? 'text-yellow-500' : 'text-red-500'
  
  return (
    <Card className="hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/repos/${repo.id}`} className="font-semibold text-white hover:text-emerald-400 truncate">
              {repo.name}
            </Link>
            {repo.isPrivate && <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />}
            {repo.isFork && <GitFork className="w-3 h-3 text-gray-500 flex-shrink-0" />}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2">{repo.description || 'No description'}</p>
        </div>
        <ProgressRing progress={repo.healthScore} size={48} />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Badge variant="default" className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} />
          {repo.language || 'Unknown'}
        </Badge>
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <Star className="w-3 h-3" /> {repo.stargazersCount}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <GitFork className="w-3 h-3" /> {repo.forksCount}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {repo.topics?.slice(0, 3).map((topic: string) => (
            <span key={topic} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              {topic}
            </span>
          ))}
          {repo.topics?.length > 3 && (
            <span className="text-xs text-gray-500">+{repo.topics.length - 3}</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formatRelativeTime(repo.pushedAt)}</span>
      </div>
    </Card>
  )
}




