import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  const text = readFileSync(join(process.cwd(), 'challenges/umuthan-challenge/ctfs/challenge-4/encoded.txt'), 'utf-8')
  return new NextResponse(text, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
