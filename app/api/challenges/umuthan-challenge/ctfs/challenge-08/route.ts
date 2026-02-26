import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
// FLAG{network_sniffer_pro}
fetch('/api/challenges/umuthan-challenge/ctfs/challenge-8/data');
</script>
<h1>Hidden Requests</h1>
<p>Find the hidden flag in the network traffic.</p>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
