import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
document.cookie = "user_role=guest; path=/";

if (document.cookie.includes("user_role=admin")) {
  alert("FLAG{cookie_is_delicious}");
}
</script>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
