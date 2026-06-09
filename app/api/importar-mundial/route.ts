import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.API_FOOTBALL_KEY

  const response = await fetch(
    'https://v3.football.api-sports.io/fixtures?league=1&season=2026',
    {
      headers: {
        'x-apisports-key': apiKey || ''
      }
    }
  )

  const data = await response.json()

  return NextResponse.json(data)
}