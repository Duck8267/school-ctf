import { NextRequest, NextResponse } from 'next/server'
import { getEventByPassword } from '@/lib/events'
import { setSignedCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({} as any))
    const password = (body as any)?.password

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const event = getEventByPassword(password)

    if (!event) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    await setSignedCookie('event_id', event.id)

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        name: event.name,
        date: event.date,
        location: event.location,
        description: event.description,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to verify event password' },
      { status: 500 }
    )
  }
}
