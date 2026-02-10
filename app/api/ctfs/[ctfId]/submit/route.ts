import { NextRequest, NextResponse } from 'next/server'
import { getCTF } from '@/lib/challenges'
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

    const { challengeId, flag } = await request.json()

    const safeChallengeId = safePath(challengeId)
    if (!safeChallengeId) {
      return NextResponse.json(
        { error: 'Invalid challenge id' },
        { status: 400 }
      )
    }

    if (!flag || typeof flag !== 'string') {
      return NextResponse.json(
        { error: 'Flag is required' },
        { status: 400 }
      )
    }

    const ctf = getCTF(safeChallengeId, safeCtfId)

    if (!ctf) {
      return NextResponse.json({ error: 'CTF not found' }, { status: 404 })
    }

    const teamId = result.team.id

    // Get or create attempt
    let attempt = db.ctfAttempts.findByTeamAndCTF(
      teamId,
      safeCtfId,
      safeChallengeId
    )

    if (!attempt) {
      const startTime = new Date().toISOString()
      db.ctfAttempts.create(teamId, safeCtfId, safeChallengeId, startTime)
      attempt = db.ctfAttempts.findByTeamAndCTF(
        teamId,
        safeCtfId,
        safeChallengeId
      )!
    }

    if (attempt.completed === 1) {
      return NextResponse.json(
        { error: 'CTF already completed' },
        { status: 400 }
      )
    }

    const normalizeFlag = (value: string) =>
      value
        .trim()
        .replace(/^flag\{/i, '')
        .replace(/\}$/i, '')
        .trim()

    const providedFlag = flag.trim()
    const correctFlag = ctf.flag.trim()

    const isExactMatch =
      providedFlag.toLowerCase() === correctFlag.toLowerCase()
    const isNormalizedMatch =
      normalizeFlag(providedFlag).toLowerCase() ===
      normalizeFlag(correctFlag).toLowerCase()

    const isCorrect = isExactMatch || isNormalizedMatch

    if (isCorrect) {
      const startTime = new Date(attempt.start_time!).getTime()
      const endTime = new Date().getTime()
      const timeTaken = Math.floor((endTime - startTime) / 1000)

      const endTimeStr = new Date().toISOString()
      db.ctfAttempts.update(attempt.id, endTimeStr, 1, ctf.points)
      db.teams.updatePoints(teamId, ctf.points)

      return NextResponse.json({
        success: true,
        correct: true,
        points: ctf.points,
        timeTaken,
      })
    } else {
      return NextResponse.json({
        success: true,
        correct: false,
        message: 'Incorrect flag. Keep trying!',
      })
    }
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit flag' },
      { status: 500 }
    )
  }
}
