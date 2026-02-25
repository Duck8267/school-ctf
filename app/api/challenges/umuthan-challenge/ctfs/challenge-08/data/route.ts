import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    secret: "FLAG{network_sniffer_pro}"
  })
}