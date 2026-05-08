import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const { searchParams } = new URL(request.url)

  const visibility = searchParams.get('visibility') || 'all'
  const language = searchParams.get('language')
  const sort = searchParams.get('sort') || 'updated'
  const order = searchParams.get('order') || 'desc'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const where: any = { userId }
  if (visibility !== 'all') where.isPrivate = visibility === 'private'
  if (language) where.language = language
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const orderBy: any = {}
  if (sort === 'stars') orderBy.stargazersCount = order
  else if (sort === 'health') orderBy.healthScore = order
  else if (sort === 'name') orderBy.name = order
  else orderBy.pushedAt = order

  const [repos, total] = await Promise.all([
    prisma.repository.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.repository.count({ where }),
  ])

  return NextResponse.json({ repos, total, page, limit, pages: Math.ceil(total / limit) })
}
