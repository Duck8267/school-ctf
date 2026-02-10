import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { requireSuperuser } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const result = await requireSuperuser()
    if (result.error) return result.error

    const requester = result.team

    const targetId = parseInt(params.teamId, 10)
    if (isNaN(targetId)) {
      return NextResponse.json(
        { error: 'Invalid team id' },
        { status: 400 }
      )
    }

    if (targetId === requester.id) {
      return NextResponse.json(
        { error: 'Cannot remove the superuser team itself' },
        { status: 400 }
      )
    }

    const deleted = db.teams.delete(targetId)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
}
