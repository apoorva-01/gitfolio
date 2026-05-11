'use client'

import Link from 'next/link'
import { use } from 'react'
import { useRepositories } from '@/hooks/useRepositories'
import type { Repository } from '@/store'
import { toast } from '@/components/ui/Toast'

const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Vue: '#41b883',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Ruby: '#701516',
  Java: '#b07219',
}

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolved = use(params)
  const { repos } = useRepositories()
  const username = resolved.username

  const stats = {
    repos: repos.length,
    stars: repos.reduce((s: number, r: Repository) => s + (r.stargazersCount || 0), 0),
    followers: 892,
    contributions: repos.reduce((s: number, r: Repository) => s + (r.healthScore || 0), 0),
  }

  const langDist = repos.reduce((acc: Record<string, number>, r: Repository) => {
    if (r.language) acc[r.language] = (acc[r.language] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const langTotal = (Object.values(langDist) as number[]).reduce((s, v) => s + v, 0) || 1
  const langEntries = (Object.entries(langDist) as [string, number][]).sort(([, a], [, b]) => b - a).slice(0, 6)

  const pinned: Repository[] = repos.slice(0, 2)

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'var(--font-ui)' }}>
      <div className="max-w-[960px] mx-auto px-6">
        <header className="py-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg no-underline" style={{ color: 'var(--color-text)' }}>
              <svg viewBox="0 0 32 32" width="24" height="24" fill="none">
                <rect width="32" height="32" rx="6" fill="#161b22"/>
                <path d="M16 6C10.477 6 6 10.477 6 16s4.477 10 10 10 10-4.477 10-10S21.523 6 16 6z" stroke="#58a6ff" strokeWidth="2" fill="none"/>
                <path d="M12 16l3 3 5-6" stroke="#3fb950" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              GitFolio
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied to clipboard!')
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded cursor-pointer"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share
            </button>
          </div>
        </header>

        <main className="py-10">
          <div className="flex gap-6 mb-8">
            <div className="w-[120px] h-[120px] rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-success))' }} />
            <div className="flex-1">
              <h1 className="text-[28px] font-bold mb-1" style={{ color: 'var(--color-text)' }}>Alex Developer</h1>
              <div className="text-lg mb-3" style={{ color: 'var(--color-text-secondary)' }}>@{resolved.username}</div>
              <p className="text-base mb-4 leading-relaxed" style={{ color: 'var(--color-text)' }}>
                Full-stack developer passionate about building developer tools and open source. Currently exploring Rust and systems programming.
              </p>
              <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  San Francisco, CA
                </span>
                <span className="flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  github.com/{resolved.username}
                </span>
              </div>
            </div>
          </div>

          <div
            className="flex gap-8 px-6 py-5 rounded-lg mb-8"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {[
              { value: String(stats.repos), label: 'Repositories' },
              { value: String(stats.stars), label: 'Stars' },
              { value: String(stats.followers), label: 'Followers' },
              { value: String(stats.contributions), label: 'Contributions' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{s.value}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              {stats.contributions} contributions in the last year
            </h2>
            <div
              className="rounded-lg p-6"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Less</span>
                  {['var(--color-surface-hover)', '#0e4429', '#006d32', '#26a641', '#39d353'].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-sm" style={{ background: c }} />
                  ))}
                  <span>More</span>
                </div>
              </div>
              <div className="flex gap-0.5 overflow-x-auto pb-2">
                {Array.from({ length: 52 }).map((_, w) => (
                  <div key={w} className="flex flex-col gap-0.5">
                    {Array.from({ length: 7 }).map((_, d) => (
                      <div key={d} className="w-3 h-3 rounded-sm" style={{ background: Math.random() > 0.5 ? ['var(--color-surface-hover)', '#0e4429', '#006d32', '#26a641', '#39d353'][Math.floor(Math.random() * 5)] : 'var(--color-surface-hover)' }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              Pinned Repositories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pinned.map((repo) => (
                <div key={repo.name} className="p-5 rounded-lg transition-all" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <div className="flex justify-between items-start mb-2">
                    <a href="#" className="text-lg font-semibold no-underline" style={{ color: 'var(--color-accent)' }}>{repo.name}</a>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-hover)' }}>Public</span>
                  </div>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{repo.description}</p>
                  <div className="flex gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: langColors[repo.language || ''] || '#6e7681' }} />{repo.language}</span>
                    <span>★ {repo.stargazersCount}</span>
                    <span>⑂ {repo.forksCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact
            </h2>
            <div className="rounded-lg p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex flex-wrap gap-3">
                {['GitHub', 'LinkedIn', 'Twitter', 'Email'].map((link) => (
                  <a key={link} href={link === 'GitHub' ? `https://github.com/${username}` : '#'} className="flex items-center gap-2 px-4 py-2 rounded text-sm no-underline transition-all" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      {link === 'GitHub' && <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>}
                      {link === 'LinkedIn' && <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>}
                      {link === 'Twitter' && <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>}
                    </svg>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            Top Languages
          </h2>
          <div className="rounded-lg p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex h-2.5 rounded-full overflow-hidden mb-4">
              {langEntries.map(([lang, count]) => (
                <div key={lang} className="h-full" style={{ background: langColors[lang] || '#6e7681', flex: count }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              {langEntries.map(([lang, count]) => (
                <div key={lang} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="w-3 h-3 rounded-full" style={{ background: langColors[lang] || '#6e7681' }} />
                  {lang} {Math.round((count / langTotal) * 100)}%
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-6 text-center text-sm" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
          <p>© 2025 Alex Developer · Built with <Link href="/" style={{ color: 'var(--color-accent)' }}>GitFolio</Link></p>
        </footer>
      </div>
    </div>
  )
}