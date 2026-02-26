import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`
<script>
document.cookie = "user_role=admin; path=/api/challenges/umuthan-challenge/ctfs";
</script>
`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
