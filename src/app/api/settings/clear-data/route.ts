import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  await prisma.repository.deleteMany({ where: { userId } })
  await prisma.repoAnalysis.deleteMany({ where: { userId } })
  await prisma.profileAnalysis.deleteMany({ where: { userId } })
  await prisma.graphSnapshot.deleteMany({ where: { userId } })

  return NextResponse.json({ success: true })
}
