import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Logo, Card, Button, Icon, Avatar, Chip, LangDot, Divider } from '@/components/gf/primitives'
import { Heatmap, LangBars } from '@/components/gf/charts'
import { deriveLanguages, contributionsToGrid, contributionsTotal, type ContribDay } from '@/lib/gf-derive'
import type { Repository as StoreRepository } from '@/store'
import { ShareButton } from './ShareButton'

async function getProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { githubLogin: username },
    select: {
      name: true, bio: true, image: true, githubLogin: true,
      followers: true, location: true, company: true, blog: true, twitterUsername: true, contributions: true,
    },
  })
  if (!user) return null
  const repos = await prisma.repository.findMany({
    where: { user: { githubLogin: username }, isPrivate: false },
    orderBy: [{ stargazersCount: 'desc' }, { pushedAt: 'desc' }],
  })
  return { user, repos }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const data = await getProfile(username)
  if (!data) return { title: 'Profile not found · GitFolio' }
  const title = `${data.user.name || username} · GitFolio`
  const description = data.user.bio || `${data.repos.length} public repositories on GitHub.`
  return { title, description }
}

function deriveHeatmap(repos: { pushedAt: Date | null }[]): number[][] {
  const grid: number[][] = Array.from({ length: 53 }, () => Array(7).fill(0))
  const now = Date.now()
  for (const r of repos) {
    if (!r.pushedAt) continue
    const t = new Date(r.pushedAt).getTime()
    const daysAgo = Math.floor((now - t) / 86400000)
    if (daysAgo < 0 || daysAgo > 370) continue
    const weekIdx = 52 - Math.floor(daysAgo / 7)
    if (weekIdx >= 0 && weekIdx < 53) grid[weekIdx][new Date(t).getDay()] += 2
  }
  return grid
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await getProfile(username)
  if (!data) notFound()

  const { user, repos } = data
  const name = user.name || username
  const langs = deriveLanguages(repos as unknown as StoreRepository[], 6)
  const contribDays = (user.contributions as ContribDay[] | null) || []
  const hasRealContribs = contribDays.length > 0
  const heatmap = hasRealContribs ? contributionsToGrid(contribDays) : deriveHeatmap(repos)
  const totalStars = repos.reduce((s, r) => s + (r.stargazersCount || 0), 0)
  const totalForks = repos.reduce((s, r) => s + (r.forksCount || 0), 0)
  const pinned = repos.slice(0, 6)
  const bio = user.bio || (langs[0] ? `Builds across ${langs.length} languages — most active in ${langs[0].name}.` : 'Developer on GitHub.')

  const stats = [
    { value: repos.length.toLocaleString(), label: 'Repositories' },
    { value: totalStars.toLocaleString(), label: 'Stars' },
    ...(user.followers != null ? [{ value: user.followers.toLocaleString(), label: 'Followers' }] : [{ value: totalForks.toLocaleString(), label: 'Forks' }]),
    { value: String(langs.length), label: 'Languages' },
  ]

  const socials: { label: string; href: string }[] = [
    { label: 'GitHub', href: `https://github.com/${user.githubLogin}` },
    ...(user.blog ? [{ label: 'Website', href: user.blog.startsWith('http') ? user.blog : `https://${user.blog}` }] : []),
    ...(user.twitterUsername ? [{ label: 'Twitter', href: `https://twitter.com/${user.twitterUsername}` }] : []),
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
        {/* header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}><Logo size={26} /></Link>
          <ShareButton />
        </header>

        <main style={{ padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* identity */}
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <Avatar src={user.image} name={name} size={112} ring />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.8, margin: 0, color: 'var(--text)' }}>{name}</h1>
              <div className="mono" style={{ fontSize: 15, color: 'var(--text-2)', marginTop: 2 }}>@{user.githubLogin}</div>
              {(user.location || user.company) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10, fontSize: 13, color: 'var(--text-2)' }}>
                  {user.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.MapPin size={13} />{user.location}</span>}
                  {user.company && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon.Building size={13} />{user.company}</span>}
                </div>
              )}
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.55, margin: '14px 0 0', maxWidth: 620 }}>{bio}</p>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {socials.map((s) => (
                  <Button key={s.label} variant="surface" size="sm" icon={s.label === 'GitHub' ? <Icon.Github size={14} /> : s.label === 'Twitter' ? <Icon.Twitter size={14} /> : <Icon.Link size={14} />} href={s.href}>{s.label}</Button>
                ))}
              </div>
            </div>
          </div>

          {/* stats */}
          <Card padding={0}>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{ flex: '1 1 120px', textAlign: 'center', padding: '20px 16px', borderLeft: i === 0 ? 'none' : '1px solid var(--border)' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, color: 'var(--accent)' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* contributions */}
          <section>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 4px' }}>Contribution activity</h2>
            {hasRealContribs && <div style={{ fontSize: 13, color: 'var(--text-3)', margin: '0 0 12px' }}>{contributionsTotal(contribDays).toLocaleString()} contributions in the last year</div>}
            <Card><Heatmap data={heatmap} cell={11} gap={3} /></Card>
          </section>

          {/* pinned */}
          {pinned.length > 0 && (
            <section>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>Pinned repositories</h2>
              <div className="gf-pinned-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {pinned.map((repo) => (
                  <a key={repo.id} href={`https://github.com/${repo.fullName}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <Card padding={16} style={{ height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Icon.Repo size={12} style={{ color: 'var(--text-3)' }} />
                        <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repo.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.45, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', minHeight: 34 }}>
                        {repo.description || <span style={{ color: 'var(--text-3)' }}>No description</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, fontSize: 11, color: 'var(--text-2)' }}>
                        {repo.language && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><LangDot lang={repo.language} />{repo.language}</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Star size={11} />{(repo.stargazersCount || 0).toLocaleString()}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon.Fork size={11} />{repo.forksCount || 0}</span>
                      </div>
                    </Card>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* languages */}
          {langs.length > 0 && (
            <section>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', margin: '0 0 14px' }}>Top languages</h2>
              <Card><LangBars data={langs} /></Card>
            </section>
          )}
        </main>

        <footer style={{ padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-3)', borderTop: '1px solid var(--border)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            Built with <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>GitFolio</Link>
            <Divider vertical style={{ height: 12 }} />
            <Chip color="var(--success)" dot>{repos.length} public repos</Chip>
          </span>
        </footer>
      </div>
    </div>
  )
}
