import { NextRequest, NextResponse } from 'next/server'
import { getEvent } from '@/lib/events'
import { requireEventId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const result = await requireEventId()
    if (result.error) return result.error

    const event = getEvent(result.eventId)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: event.id,
      name: event.name,
      date: event.date,
      location: event.location,
      description: event.description,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get event' },
      { status: 500 }
    )
  }
}
