import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { analyzeRepository } from '@/lib/ai'
import { analyzeRepoSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  let body: { repoId: string }
  try {
    body = analyzeRepoSchema.parse(await request.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError = error as z.ZodError
      return NextResponse.json(
        { error: 'Validation failed', details: zodError.issues },
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

  const existing = await prisma.repoAnalysis.findFirst({
    where: { repositoryId: repoId },
    orderBy: { analyzedAt: 'desc' },
  })

  if (existing && Date.now() - existing.analyzedAt.getTime() > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ cached: true, analysis: existing })
  }

  try {
    const result = await analyzeRepository(repo)
    const analysis = await prisma.repoAnalysis.create({
      data: {
        repositoryId: repoId,
        userId,
        summary: result.summary,
        strengths: result.strengths as any,
        issues: result.issues as any,
        readmeSuggestion: result.readmeSuggestion,
        suggestedTopics: result.suggestedTopics as any,
        suggestedDescription: result.suggestedDescription,
        recruiterImpact: result.recruiterImpact,
        estimatedImprovementScore: result.estimatedImprovementScore,
        aiSuggestions: result as any,
      },
    })

    return NextResponse.json({ cached: false, analysis })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
