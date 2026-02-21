import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<h1>The Grand Finale</h1>
<p>Find the hidden flag.</p>
<p><a href="./final-challenge.txt">final-challenge.txt</a></p>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
