import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const repos = await prisma.repository.findMany({ where: { userId: user.id } })

  const langDist: Record<string, number> = {}
  repos.forEach(r => {
    if (r.language) langDist[r.language] = (langDist[r.language] || 0) + 1
  })

  const totalStars = repos.reduce((s, r) => s + r.stargazersCount, 0)
  const totalForks = repos.reduce((s, r) => s + r.forksCount, 0)
  const totalHealthScore = repos.reduce((s, r) => s + (r.healthScore || 0), 0)

  const topRepos = [...repos]
    .sort((a, b) => b.stargazersCount - a.stargazersCount)
    .slice(0, 5)
    .map(r => ({
      name: r.name,
      stars: r.stargazersCount,
      forks: r.forksCount,
      commits: r.healthScore || 0,
    }))

  return NextResponse.json({
    totalRepos: repos.length,
    totalStars,
    totalForks,
    totalHealthScore,
    languageDistribution: langDist,
    topRepos,
    lastSynced: user.updatedAt,
  })
}
