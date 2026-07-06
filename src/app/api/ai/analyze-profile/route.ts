import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'
import { analyzeProfile } from '@/lib/ai'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id

  try {
    const result = await analyzeProfile(userId)
    const analysis = await prisma.profileAnalysis.create({
      data: {
        userId,
        overallScore: result.overallScore,
        suggestions: result.topImprovements as any,
        skillMap: result.skillMap as any,
        languageDistribution: {},
        developerArchetype: result.developerArchetype,
        topStrengths: result.topStrengths as any,
        criticalGaps: result.criticalGaps as any,
        profileBioSuggestion: result.profileBioSuggestion,
        pinnedRepoRecommendations: result.pinnedRepoRecommendations as any,
        careerNarrative: result.careerNarrative,
        topImprovements: result.topImprovements as any,
        recruiterReadinessScore: result.recruiterReadinessScore,
      },
    })

    return NextResponse.json({ cached: false, analysis })
  } catch (error) {
    console.error('Profile analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
