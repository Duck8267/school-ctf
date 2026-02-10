import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { requireTeam, safePath } from '@/lib/auth'

export async function POST(
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

    const { challengeId, hintIndex } = await request.json()

    const safeChallengeId = safePath(challengeId)
    if (!safeChallengeId) {
      return NextResponse.json(
        { error: 'Invalid challenge id' },
        { status: 400 }
      )
    }

    if (hintIndex === undefined || hintIndex === null || typeof hintIndex !== 'number' || hintIndex < 0) {
      return NextResponse.json(
        { error: 'Valid hintIndex is required' },
        { status: 400 }
      )
    }

    const team = result.team

    // Check if hint already purchased
    const purchasedHints = db.hintPurchases.getByTeamAndCTF(
      team.id,
      safeCtfId,
      safeChallengeId
    )

    if (purchasedHints.includes(hintIndex)) {
      return NextResponse.json({
        success: true,
        alreadyPurchased: true,
      })
    }

    // Calculate cost (10 * hint number, where hint 1 = index 0)
    const cost = (hintIndex + 1) * 10

    // Check if team has enough points
    if (team.total_points < cost) {
      return NextResponse.json(
        {
          error: 'Insufficient points',
          cost,
          currentPoints: team.total_points,
        },
        { status: 400 }
      )
    }

    const newTotalPoints = db.teams.deductPoints(team.id, cost)

    db.hintPurchases.create(
      team.id,
      safeCtfId,
      safeChallengeId,
      hintIndex,
      cost
    )

    return NextResponse.json({
      success: true,
      cost,
      newTotalPoints,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to purchase hint' },
      { status: 500 }
    )
  }
}
