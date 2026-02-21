import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(`<!DOCTYPE html>
<html>
<head><title>Secrets in Pixels</title></head>
<body>
  <h1>Secrets in Pixels</h1>
  <img src="/api/challenges/umuthan-challenge/ctfs/challenge-5/assets/logo.png" alt="Event Logo" />
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html' },
  })
}
