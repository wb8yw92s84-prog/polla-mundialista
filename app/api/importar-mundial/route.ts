import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.SPORTMONKS_API_TOKEN

  if (!token) {
    return NextResponse.json({
      error: 'No existe SPORTMONKS_API_TOKEN'
    })
  }

  const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${token}`

  const response = await fetch(url)
  const data = await response.json()

  return NextResponse.json({
    status: response.status,
    ok: response.ok,
    respuesta: data
  })
}