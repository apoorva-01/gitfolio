import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET(_request: Request, { params }: { params: Promise<{ repoId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const { repoId } = await params

  const repo = await prisma.repository.findFirst({ where: { id: repoId, userId } })
  if (!repo) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
  }

  const analysis = await prisma.repoAnalysis.findFirst({
    where: { repositoryId: repoId, userId },
    orderBy: { analyzedAt: 'desc' },
  })

  if (!analysis) {
    return NextResponse.json({ error: 'No analysis found' }, { status: 404 })
  }

  return NextResponse.json(analysis)
}
