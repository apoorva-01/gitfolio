import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { contributionsByWeekday, contributionsByMonth, contributionsTotal, type ContribDay } from '@/lib/gf-derive'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { followers: true, following: true, location: true, contributions: true },
  })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const repos = await prisma.repository.findMany({ where: { userId } })

  const totalStars = repos.reduce((s, r) => s + r.stargazersCount, 0)
  const totalForks = repos.reduce((s, r) => s + r.forksCount, 0)
  const avgHealth = repos.length ? repos.reduce((s, r) => s + (r.healthScore || 0), 0) / repos.length : 0

  const langBytes: Record<string, number> = {}
  repos.forEach((r) => {
    const langs = (r.languages as Record<string, number>) || {}
    Object.entries(langs).forEach(([k, v]) => { langBytes[k] = (langBytes[k] || 0) + Number(v) })
  })

  const topRepos = [...repos]
    .sort((a, b) => b.stargazersCount - a.stargazersCount)
    .slice(0, 5)
    .map((r) => ({ name: r.name, stars: r.stargazersCount, forks: r.forksCount, health: Math.round(r.healthScore || 0) }))

  const contributions = (user.contributions as ContribDay[] | null) || []

  // Honest deltas: need at least two snapshots to compare.
  const snaps = await prisma.profileSnapshot.findMany({
    where: { userId },
    orderBy: { capturedAt: 'desc' },
    take: 2,
  })
  const deltas = snaps.length >= 2
    ? {
        repos: snaps[0].repoCount - snaps[1].repoCount,
        stars: snaps[0].totalStars - snaps[1].totalStars,
        forks: snaps[0].totalForks - snaps[1].totalForks,
        followers: snaps[0].followers - snaps[1].followers,
        since: snaps[1].capturedAt,
      }
    : null

  return NextResponse.json({
    totalRepos: repos.length,
    totalStars,
    totalForks,
    avgHealth: Math.round(avgHealth),
    languageDistribution: langBytes,
    topRepos,
    followers: user.followers ?? null,
    following: user.following ?? null,
    location: user.location ?? null,
    contributionsTotal: contributionsTotal(contributions),
    weekdayActivity: contributionsByWeekday(contributions),
    monthlyActivity: contributionsByMonth(contributions),
    hasContributions: contributions.length > 0,
    deltas,
  })
}
