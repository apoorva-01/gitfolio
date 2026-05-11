'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRepositories } from '@/hooks/useRepositories'
import type { Repository } from '@/store'
import { Skeleton } from '@/components/ui/skeletons'
import { formatRelativeTime } from '@/lib/utils'

const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Vue: '#41b883',
  CSS: '#563d7c',
  HTML: '#e34c26',
}

function FilterDropdown({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-4 py-2.5 text-sm rounded cursor-pointer transition-colors"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: value === 'all' ? 'var(--color-text-secondary)' : 'var(--color-text)' }}
      >
        {value === 'all' ? label : value} ▾
      </button>
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-10 rounded py-1 min-w-[160px]"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt === 'All' ? 'all' : opt); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer border-none"
              style={{
                background: (opt === 'All' && value === 'all') || opt === value ? 'var(--color-surface-hover)' : 'transparent',
                color: (opt === 'All' && value === 'all') || opt === value ? 'var(--color-text)' : 'var(--color-text-secondary)',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ReposPage() {
  const { repos, isLoading, error } = useRepositories()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [langFilter, setLangFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated')

  const langCounts: Record<string, number> = {}
  repos.forEach((r: Repository) => {
    if (r.language) langCounts[r.language] = (langCounts[r.language] || 0) + 1
  })
  const langEntries = Object.entries(langCounts).sort(([, a], [, b]) => b - a)
  const languages = [...new Set(repos.map((r: Repository) => r.language).filter(Boolean))] as string[]

  const filtered = repos.filter((r: Repository) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || (r.description ?? '').toLowerCase().includes(search.toLowerCase())
    const visibility = r.isPrivate ? 'private' : 'public'
    const matchType = typeFilter === 'all' || visibility === typeFilter
    const matchLang = langFilter === 'all' || (r.language ?? '') === langFilter
    return matchSearch && matchType && matchLang
  })

  const sorted = [...filtered].sort((a: Repository, b: Repository) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'stars') return (b.stargazersCount || 0) - (a.stargazersCount || 0)
    return new Date(b.pushedAt || 0).getTime() - new Date(a.pushedAt || 0).getTime()
  })

  if (isLoading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({length: 6}).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  )

  if (error) return (
    <div className="text-center py-16">
      <p style={{ color: 'var(--color-error)' }}>Failed to load repositories.</p>
      <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 text-sm rounded cursor-pointer" style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
        Retry
      </button>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Repositories</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>All your repositories, synced from GitHub</p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div className="flex gap-3 flex-1 flex-wrap items-center">
          <div className="relative flex-1 max-w-[400px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2"
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Find a repository..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-2.5 pl-10 pr-3 text-sm rounded"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
          <FilterDropdown label="Type" options={['All', 'Public', 'Private']} value={typeFilter} onChange={setTypeFilter} />
          <FilterDropdown label="Language" options={['All', ...languages]} value={langFilter} onChange={setLangFilter} />
          <FilterDropdown label="Sort" options={['Recently updated', 'Name', 'Stars']} value={sortBy === 'updated' ? 'all' : sortBy} onChange={(v) => setSortBy(v === 'all' ? 'updated' : v)} />
        </div>
        <div className="flex gap-1 p-1 rounded" style={{ background: 'var(--color-surface)' }}>
          <button
            onClick={() => setView('grid')}
            className="p-2 rounded cursor-pointer"
            style={{ background: view === 'grid' ? 'var(--color-surface-hover)' : 'transparent', color: view === 'grid' ? 'var(--color-text)' : 'var(--color-text-muted)', border: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button
            onClick={() => setView('list')}
            className="p-2 rounded cursor-pointer"
            style={{ background: view === 'list' ? 'var(--color-surface-hover)' : 'transparent', color: view === 'list' ? 'var(--color-text)' : 'var(--color-text-muted)', border: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
              <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-4 mb-6 px-5 py-4 rounded-lg"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {langEntries.slice(0, 6).map(([lang, count]) => (
          <div key={lang} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: langColors[lang] || '#6e7681' }} />
            {lang} {count}
          </div>
        ))}
      </div>

      <div
        className={view === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
          : 'flex flex-col gap-3'
        }
      >
        {sorted.map((repo: Repository) => (
          <div
            key={repo.id}
            className={`rounded-lg transition-all ${view === 'list' ? 'flex items-center gap-4 p-4' : 'p-5'}`}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {view === 'list' ? (
              <>
                <div className="flex-1 min-w-0">
                  <Link href={`https://github.com/${repo.fullName}`} className="text-lg font-semibold no-underline" style={{ color: 'var(--color-accent)' }} target="_blank" rel="noopener noreferrer">{repo.name}</Link>
                  <span className="ml-2 text-xs px-2.5 py-1 rounded-full" style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-hover)' }}>{repo.isPrivate ? 'Private' : 'Public'}</span>
                </div>
                <p className="text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--color-text-secondary)' }}>{repo.description}</p>
                <div className="flex gap-4 text-sm flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: langColors[repo.language ?? ''] || '#6e7681' }} />
                    {repo.language}
                  </span>
                  <span>★ {repo.stargazersCount}</span>
                  <span>⑂ {repo.forksCount}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Updated {formatRelativeTime(repo.pushedAt)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <Link href={`https://github.com/${repo.fullName}`} className="text-lg font-semibold no-underline" style={{ color: 'var(--color-accent)' }} target="_blank" rel="noopener noreferrer">{repo.name}</Link>
                  <span className="ml-2 text-xs px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: 'var(--color-text-secondary)', background: 'var(--color-surface-hover)' }}>{repo.isPrivate ? 'Private' : 'Public'}</span>
                </div>
                <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{repo.description}</p>
                <div className="flex gap-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: langColors[repo.language ?? ''] || '#6e7681' }} />
                    {repo.language}
                  </span>
                  <span>★ {repo.stargazersCount}</span>
                  <span>⑂ {repo.forksCount}</span>
                </div>
                <div className="mt-3 pt-3 text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  Updated {formatRelativeTime(repo.pushedAt)}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {sorted.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>No repositories match your filters.</p>
        </div>
      )}
    </div>
  )
}