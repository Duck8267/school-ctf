import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<h1>Jumbled Code</h1>
<p>Find the hidden flag.</p>
<p><a href="./encoded">encoded.txt</a></p>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
