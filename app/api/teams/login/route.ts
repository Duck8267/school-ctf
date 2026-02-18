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

    const team = db.teams.findByEventNameAndPin(
      eventId,
      name.trim(),
      pin
    )

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
