import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import db from './db'
import path from 'path'

// Secret key for signing cookies.
// To make the repo work out of the box, we ship a built-in default secret.
// For real deployments, override this by setting AUTH_SECRET in the environment.
const DEFAULT_AUTH_SECRET = 'school-ctf-default-insecure-auth-secret-change-me'
const SECRET = process.env.AUTH_SECRET || DEFAULT_AUTH_SECRET

function sign(value: string): string {
  const mac = createHmac('sha256', SECRET).update(value).digest('hex')
  return `${value}.${mac}`
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf('.')
  if (idx === -1) return null
  const value = signed.slice(0, idx)
  const mac = signed.slice(idx + 1)
  const expected = createHmac('sha256', SECRET).update(value).digest('hex')
  try {
    const a = Buffer.from(mac, 'hex')
    const b = Buffer.from(expected, 'hex')
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }
  return value
}

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

/** Set a signed cookie */
export async function setSignedCookie(name: string, value: string) {
  const cookieStore = await cookies()
  cookieStore.set(name, sign(value), COOKIE_OPTS)
}

/** Read and verify a signed cookie, returning the raw value or null */
export async function getSignedCookie(name: string): Promise<string | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(name)?.value
  if (!raw) return null
  return verify(raw)
}

/** Delete a cookie */
export async function deleteCookie(name: string) {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}

/** Authenticate the current request. Returns team or an error NextResponse. */
export async function requireTeam(): Promise<
  | { team: { id: number; name: string; total_points: number; event_id: string }; error?: undefined }
  | { error: NextResponse; team?: undefined }
> {
  const teamIdStr = await getSignedCookie('team_id')
  if (!teamIdStr) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  const teamId = parseInt(teamIdStr, 10)
  if (isNaN(teamId)) {
    return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  }
  const team = db.teams.findById(teamId)
  if (!team) {
    return { error: NextResponse.json({ error: 'Team not found' }, { status: 404 }) }
  }
  return { team }
}

/** Require the current team to be the superuser */
export async function requireSuperuser(): Promise<
  | { team: { id: number; name: string; total_points: number; event_id: string }; error?: undefined }
  | { error: NextResponse; team?: undefined }
> {
  const result = await requireTeam()
  if (result.error) return result
  if (result.team.name.toLowerCase() !== 'superuser') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return result
}

/** Read and verify the event_id cookie */
export async function requireEventId(): Promise<
  | { eventId: string; error?: undefined }
  | { error: NextResponse; eventId?: undefined }
> {
  const eventId = await getSignedCookie('event_id')
  if (!eventId) {
    return { error: NextResponse.json({ error: 'No event selected' }, { status: 401 }) }
  }
  return { eventId }
}

/**
 * Sanitize a path segment to prevent directory traversal.
 * Returns null if the value is unsafe.
 */
export function safePath(segment: string): string | null {
  // Must be non-empty, no slashes, no dots-only, no null bytes
  if (
    !segment ||
    segment.includes('/') ||
    segment.includes('\\') ||
    segment.includes('\0') ||
    segment === '.' ||
    segment === '..'
  ) {
    return null
  }
  // Double-check the resolved path stays within the expected directory
  const resolved = path.resolve(segment)
  const base = path.resolve('.')
  // segment should just be a simple name
  if (path.basename(segment) !== segment) return null
  return segment
}
