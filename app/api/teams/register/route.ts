import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { requireEventId, setSignedCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    const eventResult = await requireEventId()
    if (eventResult.error) return eventResult.error
    const eventId = eventResult.eventId

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    const teamName = name.trim()

    if (teamName.length > 50) {
      return NextResponse.json(
        { error: 'Team name must be 50 characters or less' },
        { status: 400 }
      )
    }

    const isSuperUserTeam = teamName.toLowerCase() === 'superuser'

    // Check if team name already exists in this event (skip check for superuser team)
    if (!isSuperUserTeam) {
      const teamsInEvent = db.teams.getByEvent(eventId)
      const existing = teamsInEvent.find(
        (t) => t.name.toLowerCase() !== 'superuser' && t.name === teamName
      )

      if (existing) {
        return NextResponse.json(
          { error: 'Team name already taken in this event' },
          { status: 400 }
        )
      }
    }

    const teamId = db.teams.create(teamName, eventId)

    await setSignedCookie('team_id', teamId.toString())

    return NextResponse.json({
      success: true,
      teamId,
      teamName,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to register team' },
      { status: 500 }
    )
  }
}
