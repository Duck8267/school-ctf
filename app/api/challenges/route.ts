import { NextRequest, NextResponse } from 'next/server'
import { getAllChallenges } from '@/lib/challenges'
import { requireTeam } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const result = await requireTeam()
    if (result.error) return result.error

    const challenges = getAllChallenges()

    const challengesWithStatus = challenges.map((challenge) => ({
      ...challenge,
      unlocked: true,
      password: undefined, // Don't send password to client
    }))

    return NextResponse.json(challengesWithStatus)
  } catch {
    return NextResponse.json(
      { error: 'Failed to get challenges' },
      { status: 500 }
    )
  }
}
