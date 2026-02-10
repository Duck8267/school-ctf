import { NextRequest, NextResponse } from 'next/server'
import { requireTeam } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const result = await requireTeam()
    if (result.error) return result.error

    return NextResponse.json({
      id: result.team.id,
      name: result.team.name,
      total_points: result.team.total_points,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get team info' },
      { status: 500 }
    )
  }
}
