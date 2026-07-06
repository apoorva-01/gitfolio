'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRepositories } from '@/hooks/useRepositories'
import { PageShell, TopNav } from '@/components/gf/AppShell'
import { Card, Button, Icon, Chip, LangDot, Divider } from '@/components/gf/primitives'
import { rel, deriveLanguages } from '@/lib/gf-derive'
import type { Repository } from '@/store'

function RepoCard({ repo }: { repo: Repository }) {
  return (
    <Link href={`/repos/${repo.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Card padding={20} style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Icon.Repo size={14} style={{ color: 'var(--text-3)' }} />
          <span className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
          <Chip>{repo.isPrivate ? 'Private' : 'Public'}</Chip>
        </div>
        <Chip color={(repo.healthScore || 0) >= 70 ? 'var(--success)' : (repo.healthScore || 0) >= 45 ? 'var(--warn)' : 'var(--danger)'} dot>{Math.round(repo.healthScore || 0)}</Chip>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.45, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', minHeight: 38 }}>
        {repo.description || <span style={{ color: 'var(--text-3)' }}>No description</span>}
      </div>
      {repo.topics?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {repo.topics.slice(0, 3).map((t) => (
            <span key={t} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 500 }}>{t}</span>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'var(--text-2)' }}>
          {repo.language && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LangDot lang={repo.language} />{repo.language}</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Star size={11} />{(repo.stargazersCount || 0).toLocaleString()}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Fork size={11} />{repo.forksCount || 0}</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Updated {rel(repo.pushedAt)} ago</span>
      </div>
    </Card>
    </Link>
  )
}

export default function ReposPage() {
  const [q, setQ] = useState('')
  const { repos, total, isLoading, error } = useRepositories()

  const publicCount = repos.filter((r: Repository) => !r.isPrivate).length
  const privateCount = repos.filter((r: Repository) => r.isPrivate).length
  const langs = deriveLanguages(repos)
  const query = q.trim().toLowerCase()
  const shown: Repository[] = query
    ? repos.filter((r: Repository) => r.name.toLowerCase().includes(query) || (r.description || '').toLowerCase().includes(query) || (r.language || '').toLowerCase().includes(query) || r.topics?.some((t) => t.toLowerCase().includes(query)))
    : repos

  return (
    <PageShell topNav={<TopNav title="Repositories" subtitle={`${publicCount} public · ${privateCount} private`} />}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {isLoading && <div style={{ color: 'var(--text-3)' }}>Loading repositories…</div>}
        {error && (
          <Card padding={20}>
            <p style={{ color: 'var(--danger)', marginBottom: 12 }}>Failed to load repositories.</p>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </Card>
        )}

        {!isLoading && !error && (
          <>
            {/* toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
                <Icon.Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-3)' }} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, topic, language…" style={{
                  width: '100%', height: 36, padding: '0 12px 0 34px', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 8, color: 'var(--text)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
                }} />
              </div>
              <Divider vertical style={{ height: 24 }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{shown.length} of {total}</span>
              <div style={{ marginLeft: 'auto' }}>
                <Button variant="primary" size="md" icon={<Icon.Plus size={14} />} href="https://github.com/new">New</Button>
              </div>
            </div>

            {/* language strip */}
            {langs.length > 0 && (
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 11, color: 'var(--text-2)', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>Languages</span>
                {langs.map((l) => (
                  <span key={l.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <LangDot lang={l.name} /> {l.name} <span style={{ color: 'var(--text-3)' }}>{l.pct.toFixed(1)}%</span>
                  </span>
                ))}
              </div>
            )}

            {/* grid */}
            {shown.length === 0 ? (
              <Card padding={32} style={{ textAlign: 'center' }}>
                <Icon.Repo size={24} style={{ color: 'var(--text-3)' }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 8 }}>{total === 0 ? 'No repositories yet' : 'No matches'}</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>{total === 0 ? 'Sync your GitHub to import repositories.' : 'Try a different search.'}</div>
              </Card>
            ) : (
              <div className="gf-repo-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, alignItems: 'stretch' }}>
                {shown.map((r: Repository) => <RepoCard key={r.id} repo={r} />)}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  )
}
