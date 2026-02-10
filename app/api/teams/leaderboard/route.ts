import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { getCtfKey, getEmojiForKey } from '@/lib/ctfEmojis'
import { requireEventId } from '@/lib/auth'

function calculateTotalTime(teamId: number): number {
  const completedAttempts = db.ctfAttempts
    .getCompletedByTeam(teamId)
    .filter((a) => a.start_time && a.end_time)

  const intervals = completedAttempts
    .map((attempt) => {
      const start = new Date(attempt.start_time as string).getTime()
      const end = new Date(attempt.end_time as string).getTime()
      return { start, end }
    })
    .filter((i) => Number.isFinite(i.start) && Number.isFinite(i.end) && i.end > i.start)
    .sort((a, b) => a.start - b.start)

  if (intervals.length === 0) {
    return 0
  }

  // Merge overlapping intervals so parallel CTFs don't double-count time.
  let totalMs = 0
  let curStart = intervals[0].start
  let curEnd = intervals[0].end

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i]
    if (next.start <= curEnd) {
      curEnd = Math.max(curEnd, next.end)
    } else {
      totalMs += curEnd - curStart
      curStart = next.start
      curEnd = next.end
    }
  }

  totalMs += curEnd - curStart

  return Math.floor(totalMs / 1000)
}

export async function GET(request: NextRequest) {
  try {
    const result = await requireEventId()
    if (result.error) return result.error

    const teams = db.teams.getByEvent(result.eventId)

    // Filter out superuser team from leaderboard
    const visibleTeams = teams.filter(
      (t) => t.name.toLowerCase() !== 'superuser'
    )

    // Calculate total time for each team and add to team data
    const teamsWithTime = visibleTeams.map((t) => {
      const total_time = calculateTotalTime(t.id)
      const completedAttempts = db.ctfAttempts
        .getCompletedByTeam(t.id)
        .filter(
          (attempt) => attempt.completed === 1 && attempt.end_time
        )
        .sort((a, b) => {
          const aTime = new Date(a.end_time as string).getTime()
          const bTime = new Date(b.end_time as string).getTime()
          return aTime - bTime
        })

      const seenKeys = new Set<string>()
      const completedCtfs: string[] = []

      for (const attempt of completedAttempts) {
        const key = getCtfKey(attempt.challenge_id, attempt.ctf_id)
        if (seenKeys.has(key)) {
          continue
        }
        seenKeys.add(key)
        const emoji = getEmojiForKey(key)
        if (emoji) {
          completedCtfs.push(emoji)
        }
      }

      return {
        ...t,
        total_time,
        completedCtfs,
      }
    })

    // Sort by points (descending), then by time (ascending - lower time is better)
    teamsWithTime.sort((a, b) => {
      if (b.total_points !== a.total_points) {
        return b.total_points - a.total_points
      }
      return a.total_time - b.total_time
    })

    return NextResponse.json({
      teams: teamsWithTime.map((t) => ({
        id: t.id,
        name: t.name,
        total_points: t.total_points,
        total_time: t.total_time,
        completedCtfs: t.completedCtfs,
      })),
      timer: db.leaderboardTimer.getStatus(),
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to get leaderboard' },
      { status: 500 }
    )
  }
}
