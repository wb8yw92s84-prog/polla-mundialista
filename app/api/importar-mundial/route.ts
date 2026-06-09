import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    mensaje: 'API importar mundial funcionando'
  })
}