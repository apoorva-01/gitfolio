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
      <div className="flex justify-between"><div className="h-8 w-32" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)' }} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => <RepoCardSkeleton key={i} />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-bold" style={{ color: 'var(--color-text)' }}>Repositories</h1>
        <Button onClick={() => syncRepos()} disabled={isSyncing}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
          {isSyncing ? 'Syncing...' : 'Sync'}
        </Button>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            <Input
              placeholder="Search repos..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-10"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)' }}
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
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Min Health:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={filters.minHealth}
              onChange={e => setFilter('minHealth', parseInt(e.target.value))}
              className="w-24"
              style={{ background: 'var(--color-surface)' }}
            />
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>{filters.minHealth}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </Card>

      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{total} repositories</p>

      <div className="grid-2">
        <div className="language-legend" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div className="legend-item"><span className="language-color js"></span> JavaScript 12</div>
          <div className="legend-item"><span className="language-color ts"></span> TypeScript 15</div>
          <div className="legend-item"><span className="language-color python"></span> Python 8</div>
          <div className="legend-item"><span className="language-color rust"></span> Rust 4</div>
          <div className="legend-item"><span className="language-color go"></span> Go 5</div>
          <div className="legend-item"><span className="language-color css"></span> CSS 3</div>
        </div>
      </div>

      <div className="repos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
        {filteredRepos.slice((page - 1) * limit, page * limit).map(repo => (
          <RepoCard key={repo.id} repo={repo} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Page {page} of {totalPages}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function RepoCard({ repo }: { repo: any }) {
  const healthColor = repo.healthScore >= 70 ? 'var(--color-success)' : repo.healthScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
  
  return (
    <Card 
      style={{ 
        background: 'var(--color-surface)', 
        border: '1px solid var(--color-border)', 
        borderRadius: 'var(--radius-md)', 
        transition: 'all 0.2s ease' 
      }} 
      className="hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/repos/${repo.id}`} className="font-semibold truncate" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>{repo.name}</Link>
            {repo.isPrivate && <Lock className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />}
            {repo.isFork && <GitFork className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }} />}
          </div>
          <p className="text-sm line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>{repo.description || 'No description'}</p>
        </div>
        <ProgressRing progress={repo.healthScore} size={36} />
      </div>

      <div className="repo-stats" style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <span className="repo-stat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="language-color" style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: getLanguageColor(repo.language) }} />
          {repo.language || 'Unknown'}
        </span>
        <span className="repo-stat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Star className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} /> {repo.stargazersCount}
        </span>
        <span className="repo-stat" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GitFork className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} /> {repo.forksCount}
        </span>
      </div>

      <div className="repo-meta" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        {formatRelativeTime(repo.pushedAt)}
      </div>
    </Card>
  )
}