import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
  localStorage.setItem("secret_vault", "FLAG{storage_is_not_secure}");
</script>

<h1>Forgotten Memory</h1>
<p>Find the hidden flag.</p>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
