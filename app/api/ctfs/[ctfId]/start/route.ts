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

    const { challengeId } = await request.json()

    const safeChallengeId = safePath(challengeId)
    if (!safeChallengeId) {
      return NextResponse.json(
        { error: 'Invalid challenge id' },
        { status: 400 }
      )
    }

    const teamId = result.team.id

    // Check if already started or completed
    const existing = db.ctfAttempts.findByTeamAndCTF(
      teamId,
      safeCtfId,
      safeChallengeId
    )

    if (existing) {
      if (existing.completed === 1) {
        return NextResponse.json(
          { error: 'CTF already completed' },
          { status: 400 }
        )
      }
      return NextResponse.json({
        success: true,
        startTime: existing.start_time || new Date().toISOString(),
      })
    }

    const startTime = new Date().toISOString()
    db.ctfAttempts.create(teamId, safeCtfId, safeChallengeId, startTime)

    return NextResponse.json({
      success: true,
      startTime,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to start CTF' },
      { status: 500 }
    )
  }
}
