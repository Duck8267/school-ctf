import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<h1>The Unclickable Button</h1>
<p>Find the hidden flag.</p>

<button disabled onclick="alert('FLAG{button_unlocked}')">
  Claim Flag
</button>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
