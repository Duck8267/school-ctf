import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<h1>Jumbled Code</h1>
<p>Find the hidden flag.</p>
<p>70,76,65,71,123,106,115,95,105,115,95,114,101,97,100,97,98,108,101,125</p>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
