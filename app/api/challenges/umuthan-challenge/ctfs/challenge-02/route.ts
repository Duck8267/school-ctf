import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
  window.onload = function () {
    console.log("Welcome to the challenge!");
    console.log("System Status: Active");
    console.log("Secret Flag Found: FLAG{console_detective}");
  };
</script>

<h1>The Whispering Console</h1>
<p>Find the hidden flag.</p>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
