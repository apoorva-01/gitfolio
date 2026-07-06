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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, bio: true, image: true, githubLogin: true },
  })

  return NextResponse.json(user)
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const data: { name?: string | null; bio?: string | null } = {}
  if ('name' in body) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length > 100) {
      return NextResponse.json({ error: 'Name must be 1–100 characters' }, { status: 400 })
    }
    data.name = name
  }
  if ('bio' in body) {
    const bio = typeof body.bio === 'string' ? body.bio.trim() : ''
    if (bio.length > 280) {
      return NextResponse.json({ error: 'Bio must be 280 characters or fewer' }, { status: 400 })
    }
    data.bio = bio || null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { name: true, bio: true, image: true, githubLogin: true },
  })

  return NextResponse.json(user)
}
