import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { requireTeam, safePath } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { ctfId: string } }
) {
  try {
    const result = await requireTeam()
    if (result.error) return result.error

    const safeCtfId = safePath(params.ctfId)
    if (!safeCtfId) {
      return NextResponse.json(
        { error: 'Invalid CTF id' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const challengeId = searchParams.get('challengeId')

    const safeChallengeId = challengeId ? safePath(challengeId) : null
    if (!safeChallengeId) {
      return NextResponse.json(
        { error: 'Valid challengeId required' },
        { status: 400 }
      )
    }

    const purchasedHints = db.hintPurchases.getByTeamAndCTF(
      result.team.id,
      safeCtfId,
      safeChallengeId
    )

    return NextResponse.json({
      purchasedHints,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get purchased hints' },
      { status: 500 }
    )
  }
}
