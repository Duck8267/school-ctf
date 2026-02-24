import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
let isAuthorized = false;

function checkAccess() {
  if (isAuthorized) {
    const el = document.getElementById("result");
    if (el) el.innerText = "FLAG{logic_hacker}";
  }
}
</script>

<h1>The Logic Gate</h1>
<p>Find the hidden flag.</p>

<button onclick="checkAccess()">Verify</button>
<div id="result"></div>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
