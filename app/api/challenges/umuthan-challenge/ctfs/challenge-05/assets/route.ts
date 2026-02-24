import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const filePath = join(
    process.cwd(),
    'challenges',
    'umuthan-challenge',
    'ctfs',
    'challenge-05',
    'assets',
    'logo.png'
  )

  const image = readFileSync(filePath)

  return new NextResponse(image, {
    headers: { 'Content-Type': 'image/png' },
  })
}
