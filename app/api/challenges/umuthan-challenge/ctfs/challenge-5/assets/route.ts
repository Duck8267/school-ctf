import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const image = readFileSync(join(process.cwd(), 'challenges/umuthan-challenge/ctfs/challenge-5/assets/logo.png'))
  return new NextResponse(image, {
    headers: { 'Content-Type': 'image/png' },
  })
}
