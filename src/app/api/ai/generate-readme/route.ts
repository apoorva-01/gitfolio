import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { generateReadme } from '@/lib/ai'
import { generateReadmeSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  let body: { repoId: string }
  try {
    body = generateReadmeSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError
      return NextResponse.json(
        { error: 'Validation failed', details: zodError.errors },
        { status: 400 }
      )
    }
    throw error
  }

  const { repoId } = body

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
