import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { buildGraphData, saveGraphSnapshot } from '@/lib/graph'
import { revalidatePath } from 'next/cache'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as { id: string }).id
  const graphData = await buildGraphData(userId)
  await saveGraphSnapshot(userId, graphData)
  revalidatePath('/graph')

  return NextResponse.json({ success: true, ...graphData })
}
