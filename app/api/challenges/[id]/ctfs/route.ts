import { NextRequest, NextResponse } from 'next/server'
import { getCTFsInChallenge } from '@/lib/challenges'
import db from '@/lib/db'
import { requireTeam, safePath } from '@/lib/auth'

export async function GET(
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

    const ctfs = getCTFsInChallenge(safeId)

    // Get completion status for each CTF
    const attempts = db.ctfAttempts.getByTeamAndChallenge(
      result.team.id,
      safeId
    )

    const attemptsMap = new Map(
      attempts.map((a) => [
        a.ctf_id,
        { completed: a.completed === 1, points: a.points_earned },
      ])
    )

    const ctfsWithStatus = ctfs.map((ctf) => {
      const attempt = attemptsMap.get(ctf.id)
      return {
        ...ctf,
        flag: undefined, // Don't send flag to client
        completed: attempt?.completed || false,
        pointsEarned: attempt?.points || 0,
      }
    })

    return NextResponse.json(ctfsWithStatus)
  } catch {
    return NextResponse.json(
      { error: 'Failed to get CTFs' },
      { status: 500 }
    )
  }
}
