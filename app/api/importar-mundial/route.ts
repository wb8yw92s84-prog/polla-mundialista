import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.SPORTMONKS_API_TOKEN

  if (!token) {
    return NextResponse.json({ error: 'Falta SPORTMONKS_API_TOKEN' })
  }

  const response = await fetch(
    `https://api.sportmonks.com/v3/football/leagues?api_token=${token}&per_page=100`
  )

  const data = await response.json()

  const ligas = data.data || []

  const posibles = ligas.filter((liga: any) =>
    String(liga.name).toLowerCase().includes('world')
  )

  return NextResponse.json({
    total_recibidas: ligas.length,
    posibles_mundial: posibles,
  })
}