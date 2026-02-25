import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
document.cookie = "user_role=guest; path=/";
</script>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
