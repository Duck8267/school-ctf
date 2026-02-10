import { NextRequest, NextResponse } from 'next/server'
import { deleteCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    await deleteCookie('team_id')
    await deleteCookie('event_id')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    )
  }
}
