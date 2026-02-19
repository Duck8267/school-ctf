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

    if (!pin || typeof pin !== 'string' || !PIN_REGEX.test(pin)) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()
    const superuserPin = '7070'
    const isSuperuser = trimmedName.toLowerCase() === 'superuser'

    // Superuser may only log in with the hardcoded PIN 7070
    if (isSuperuser && pin !== superuserPin) {
      return NextResponse.json(
        { error: 'Invalid team name or PIN' },
        { status: 401 }
      )
    }

    let team
    if (isSuperuser) {
      const inEvent = db.teams.getByEvent(eventId)
      team = inEvent.find((t) => t.name.toLowerCase() === 'superuser') ?? undefined
      // Pre-create superuser for this event on first login
      if (!team) {
        const teamId = db.teams.create('superuser', eventId, superuserPin)
        team = db.teams.findById(teamId) ?? undefined
      }
    } else {
      team = db.teams.findByEventNameAndPin(eventId, trimmedName, pin)
    }

    if (!team) {
      return NextResponse.json(
        { error: 'Invalid team name or PIN' },
        { status: 401 }
      )
    }

    await setSignedCookie('team_id', team.id.toString())

    return NextResponse.json({
      success: true,
      teamId: team.id,
      teamName: team.name,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to log in' },
      { status: 500 }
    )
  }
}
