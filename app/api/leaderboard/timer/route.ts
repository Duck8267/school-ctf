import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { requireSuperuser } from '@/lib/auth'

function buildTimerResponse() {
  return db.leaderboardTimer.getStatus()
}

export async function GET() {
  try {
    return NextResponse.json({
      timer: buildTimerResponse(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to load timer' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await requireSuperuser()
    if (result.error) return result.error

    const body = await request.json().catch(() => ({}))
    const minutes = Number(body.minutes)

    if (!Number.isFinite(minutes) || minutes <= 0) {
      return NextResponse.json(
        { error: 'Minutes must be a positive number' },
        { status: 400 }
      )
    }

    const durationSeconds = Math.round(minutes * 60)
    const startedAt = new Date().toISOString()

    db.leaderboardTimer.set({
      started_at: startedAt,
      duration_seconds: durationSeconds,
    })

    return NextResponse.json({
      timer: {
        startedAt,
        durationSeconds,
        remainingSeconds: durationSeconds,
        isActive: true,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to start timer' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const result = await requireSuperuser()
    if (result.error) return result.error

    const body = await request.json().catch(() => ({}))
    const minutes = body.minutes === undefined ? 5 : Number(body.minutes)

    if (!Number.isFinite(minutes) || minutes <= 0) {
      return NextResponse.json(
        { error: 'Minutes must be a positive number' },
        { status: 400 }
      )
    }

    const status = db.leaderboardTimer.getStatus()
    if (!status || !status.isActive) {
      return NextResponse.json(
        { error: 'No active timer to extend' },
        { status: 400 }
      )
    }

    const updatedStatus = db.leaderboardTimer.extend(
      Math.round(minutes * 60)
    )

    return NextResponse.json({
      timer: updatedStatus,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to add time' },
      { status: 500 }
    )
  }
}
