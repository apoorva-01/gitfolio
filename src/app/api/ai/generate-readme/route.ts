import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { generateReadme } from '@/lib/ai'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const { repoId } = await request.json()

  const repo = await prisma.repository.findFirst({ where: { id: repoId, userId } })
  if (!repo) {
    return NextResponse.json({ error: 'Repository not found' }, { status: 404 })
  }

  try {
    const readme = await generateReadme(repoId)
    return NextResponse.json({ readme })
  } catch (error) {
    console.error('README generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
