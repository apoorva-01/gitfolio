import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const repos = await prisma.repository.findMany({
    where: { userId },
    orderBy: { pushedAt: 'desc' },
  })

  const lastSynced = repos[0]?.pushedAt || null
  return NextResponse.json({ lastSynced, repoCount: repos.length })
}
