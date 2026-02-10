import { NextRequest, NextResponse } from 'next/server'
import { getChallenge } from '@/lib/challenges'
import db from '@/lib/db'
import { requireTeam, safePath } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await requireTeam()
    if (result.error) return result.error

    const safeId = safePath(params.id)
    if (!safeId) {
      return NextResponse.json(
        { error: 'Invalid challenge id' },
        { status: 400 }
      )
    }

    const { password } = await request.json()

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const challenge = getChallenge(safeId)

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      )
    }

    if (password !== challenge.password) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    db.challengeAccess.create(result.team.id, safeId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to unlock challenge' },
      { status: 500 }
    )
  }
}
