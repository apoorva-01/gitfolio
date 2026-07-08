'use client'

import { Card, Icon, LangDot } from './primitives'
import type { GitHubActivity } from '@/lib/github'

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card padding={14}>
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--text)' }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
    </Card>
  )
}

export function ActivitySummary({ activity }: { activity: GitHubActivity }) {
  const { allTime, lastYear, contributedReposCount, contributedRepos } = activity
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <Stat value={contributedReposCount} label="Repos contributed to" />
        <Stat value={allTime.mergedPullRequests} label="Merged PRs" />
        <Stat value={allTime.discussionAnswers} label="Accepted answers" />
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
        <span style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 10, fontWeight: 600 }}>Last 12 months</span>{' · '}
        <b style={{ color: 'var(--text-2)', fontWeight: 600 }}>{lastYear.commits.toLocaleString()}</b> commits{' · '}
        <b style={{ color: 'var(--text-2)', fontWeight: 600 }}>{lastYear.pullRequests.toLocaleString()}</b> PRs{' · '}
        <b style={{ color: 'var(--text-2)', fontWeight: 600 }}>{lastYear.issues.toLocaleString()}</b> issues{' · '}
        <b style={{ color: 'var(--text-2)', fontWeight: 600 }}>{lastYear.reviews.toLocaleString()}</b> reviews
      </div>

      {contributedRepos.length > 0 && (
        <div className="gf-pinned-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {contributedRepos.map((r) => (
            <a key={r.nameWithOwner} href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex' }}>
              <Card padding={14} style={{ height: '100%', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <Icon.Fork size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                  <span className="mono" style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nameWithOwner}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', minHeight: 34 }}>
                  {r.description || <span style={{ color: 'var(--text-3)' }}>No description</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10, fontSize: 11, color: 'var(--text-2)' }}>
                  {r.language && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LangDot lang={r.language} />{r.language}</span>}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Star size={11} />{r.stars > 999 ? (r.stars / 1000).toFixed(1) + 'k' : r.stars}</span>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
