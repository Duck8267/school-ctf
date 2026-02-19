import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { requireEventId, setSignedCookie } from '@/lib/auth'

const PIN_REGEX = /^\d{4}$/

export async function POST(request: NextRequest) {
  try {
    const { name, pin } = await request.json()

    const eventResult = await requireEventId()
    if (eventResult.error) return eventResult.error
    const eventId = eventResult.eventId

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Team name is required' },
        { status: 400 }
      )
    }

    const pinStr = typeof pin === 'string' && PIN_REGEX.test(pin) ? pin : null
    if (!pinStr) {
      return NextResponse.json(
        { error: 'Please set a 4-digit PIN so you can log back in later' },
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
    if (isSuperUserTeam) {
      return NextResponse.json(
        { error: 'Use "Log in to existing team" to sign in as superuser' },
        { status: 400 }
      )
    }

    // Check if team name already exists in this event
    {
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

    const teamId = db.teams.create(teamName, eventId, pinStr)

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
